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

import {
    getRandomStealVictim,
    stealBP,
    getBalance
} from "./playerService.ts";

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

type StealSessionRow = {
    player_id: number;
    reward_type: string;
};

type ExistingStealRow = {
    session_id: number;
    winner_id: number;
    victim_id: number;
    amount: number;
};

export function executeWheelSteal(
    sessionId: number,
    victimId: number
) {
    if (
        !Number.isSafeInteger(sessionId) ||
        sessionId <= 0 ||
        !Number.isSafeInteger(victimId) ||
        victimId <= 0
    ) {
        throw new Error("Niepoprawne dane kradzieży");
    }

    return db.transaction(() => {
        const session = db.prepare(`
            SELECT
                gs.player_id,
                wr.reward_type
            FROM game_sessions gs
            JOIN wheel_results wr
                ON wr.session_id = gs.id
            WHERE gs.id = ?
              AND gs.game_type = 'wheel'
              AND gs.finished_at IS NOT NULL
        `).get(sessionId) as StealSessionRow | undefined;

        if (!session) {
            throw new Error("Nie znaleziono zakończonej rundy");
        }

        if (session.reward_type !== "steal_bp") {
            throw new Error("Ta runda nie wygrała kradzieży");
        }

        if (session.player_id === victimId) {
            throw new Error("Nie możesz okraść samego siebie");
        }

        const existing = db.prepare(`
            SELECT *
            FROM wheel_steals
            WHERE session_id = ?
        `).get(sessionId) as ExistingStealRow | undefined;

        if (existing) {
            throw new Error("Kradzież została już wykonana");
        }

        const victim = db.prepare(`
            SELECT
                p.id,
                p.display_name,
                w.bp
            FROM players p
            JOIN wallets w
                ON w.player_id = p.id
            WHERE p.id = ?
              AND w.bp >= 10000
        `).get(victimId) as {
            id: number;
            display_name: string;
            bp: number;
        } | undefined;

        if (!victim) {
            throw new Error(
                "Wylosowany gracz nie ma już 10 000 BP"
            );
        }

        const result = stealBP(
            session.player_id,
            victim.id,
            10000
        );

        db.prepare(`
            INSERT INTO wheel_steals (
                session_id,
                winner_id,
                victim_id,
                amount
            )
            VALUES (?, ?, ?, ?)
        `).run(
            sessionId,
            session.player_id,
            victim.id,
            10000
        );

        return {
            winnerId: session.player_id,
            victimId: victim.id,
            victimName: victim.display_name,
            amount: 10000,
            winnerBalance: result.winnerBalance,
            victimBalance: result.victimBalance
        };
    })();
}