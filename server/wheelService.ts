import { db } from "./database.ts";

export const WHEEL_COST = 5000;

type WalletRow = {
    bp: number;
};

type WheelSessionRow = {
    session_id: number;
    player_id: number;
    finished_at: string | null;
};

export type StartWheelResult = {
    sessionId: number;
    playerId: number;
    cost: number;
    balance: number;
};

export type FinishWheelResult = {
    sessionId: number;
    playerId: number;
    rewardName: string;
    rewardType: string;
    rewardValue: number | null;
    rewardText: string | null;
    balance: number;
};

export function startWheel(
    playerId: number
): StartWheelResult {

    const transaction = db.transaction(() => {

        const wallet = db.prepare(`
            SELECT bp
            FROM wallets
            WHERE player_id = ?
        `).get(playerId) as WalletRow | undefined;

        if (!wallet) {
            throw new Error("Nie znaleziono portfela gracza");
        }

        if (wallet.bp < WHEEL_COST) {
            throw new Error(
                `Gracz potrzebuje ${WHEEL_COST} BP, żeby zakręcić kołem`
            );
        }

        const sessionResult = db.prepare(`
            INSERT INTO game_sessions (
                player_id,
                game_type
            )
            VALUES (?, 'wheel')
        `).run(playerId);

        const sessionId =
            Number(sessionResult.lastInsertRowid);

        db.prepare(`
            UPDATE wallets
            SET
                bp = bp - ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE player_id = ?
        `).run(
            WHEEL_COST,
            playerId
        );

        db.prepare(`
            INSERT INTO bp_transactions (
                player_id,
                amount,
                transaction_type,
                description
            )
            VALUES (?, ?, ?, ?)
        `).run(
            playerId,
            -WHEEL_COST,
            "wheel_spin",
            `Koło Fortuny - runda #${sessionId}`
        );

        return {
            sessionId,
            playerId,
            cost: WHEEL_COST,
            balance: wallet.bp - WHEEL_COST
        };
    });

    return transaction();
}

export function finishWheel(
    sessionId: number,
    rewardName: string,
    rewardType: string,
    rewardValue: number | null,
    rewardText: string | null
): FinishWheelResult {

    const transaction = db.transaction(() => {

        const session = db.prepare(`
            SELECT
                id AS session_id,
                player_id,
                finished_at
            FROM game_sessions
            WHERE id = ?
              AND game_type = 'wheel'
        `).get(
            sessionId
        ) as WheelSessionRow | undefined;

        if (!session) {
            throw new Error(
                "Nie znaleziono rundy Koła Fortuny"
            );
        }

        if (session.finished_at !== null) {
            throw new Error(
                "Ta runda została już zakończona"
            );
        }

        db.prepare(`
            INSERT INTO wheel_results (
                session_id,
                reward_name,
                reward_type,
                reward_value,
                reward_text
            )
            VALUES (?, ?, ?, ?, ?)
        `).run(
            sessionId,
            rewardName,
            rewardType,
            rewardValue,
            rewardText
        );

        db.prepare(`
            UPDATE game_sessions
            SET finished_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `).run(sessionId);

        const wallet = db.prepare(`
            SELECT bp
            FROM wallets
            WHERE player_id = ?
        `).get(
            session.player_id
        ) as WalletRow;

        return {
            sessionId,
            playerId: session.player_id,
            rewardName,
            rewardType,
            rewardValue,
            rewardText,
            balance: wallet.bp
        };
    });

    return transaction();
}