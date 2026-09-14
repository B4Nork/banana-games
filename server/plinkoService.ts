import { db } from "./database.ts";

type WalletRow = {
    bp: number;
};

type PlinkoSessionRow = {
    session_id: number;
    player_id: number;
    finished_at: string | null;
    starting_bp: number;
    balls_count: number;
};

export type StartPlinkoResult = {
    sessionId: number;
    playerId: number;
    balance: number;
};

export type FinishPlinkoResult = {
    sessionId: number;
    playerId: number;
    startingBP: number;
    payout: number;
    profit: number;
    balance: number;
};

export function startPlinko(
    playerId: number,
    bet: number,
    ballsCount: number
): StartPlinkoResult {

    const transaction = db.transaction(() => {

        const wallet = db.prepare(`
            SELECT bp
            FROM wallets
            WHERE player_id = ?
        `).get(playerId) as WalletRow | undefined;

        if (!wallet) {
            throw new Error("Nie znaleziono portfela gracza");
        }

        if (wallet.bp < bet) {
            throw new Error("Gracz nie ma wystarczającej liczby BP");
        }

        const sessionResult = db.prepare(`
            INSERT INTO game_sessions (
                player_id,
                game_type
            )
            VALUES (?, 'plinko')
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
            bet,
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
            -bet,
            "plinko_bet",
            `Plinko - stawka, runda #${sessionId}`
        );

        db.prepare(`
            INSERT INTO plinko_results (
                session_id,
                starting_bp,
                balls_count,
                final_bp,
                profit,
                best_multiplier
            )
            VALUES (?, ?, ?, 0, ?, NULL)
        `).run(
            sessionId,
            bet,
            ballsCount,
            -bet
        );

        return {
            sessionId,
            playerId,
            balance: wallet.bp - bet
        };
    });

    return transaction();
}

export function finishPlinko(
    sessionId: number,
    payout: number,
    bestMultiplier: number | null
): FinishPlinkoResult {

    const transaction = db.transaction(() => {

        const round = db.prepare(`
            SELECT
                game_sessions.id AS session_id,
                game_sessions.player_id,
                game_sessions.finished_at,
                plinko_results.starting_bp,
                plinko_results.balls_count
            FROM game_sessions
            INNER JOIN plinko_results
                ON plinko_results.session_id = game_sessions.id
            WHERE
                game_sessions.id = ?
                AND game_sessions.game_type = 'plinko'
        `).get(sessionId) as PlinkoSessionRow | undefined;

        if (!round) {
            throw new Error("Nie znaleziono rundy Plinko");
        }

        if (round.finished_at !== null) {
            throw new Error("Ta runda została już zakończona");
        }

        const profit =
            payout - round.starting_bp;

        if (
            !Number.isSafeInteger(payout) ||
            !Number.isSafeInteger(profit)
        ) {
            throw new Error("Niepoprawna wartość wypłaty");
        }

        if (payout < 0) {
            throw new Error("Wypłata nie może być ujemna");
        }

        if (payout > 0) {

            db.prepare(`
                UPDATE wallets
                SET
                    bp = bp + ?,
                    updated_at = CURRENT_TIMESTAMP
                WHERE player_id = ?
            `).run(
                payout,
                round.player_id
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
                round.player_id,
                payout,
                "plinko_payout",
                `Plinko - wypłata, runda #${sessionId}`
            );
        }

        db.prepare(`
            UPDATE plinko_results
            SET
                final_bp = ?,
                profit = ?,
                best_multiplier = ?
            WHERE session_id = ?
        `).run(
            payout,
            profit,
            bestMultiplier,
            sessionId
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
            round.player_id
        ) as WalletRow;

        return {
            sessionId,
            playerId: round.player_id,
            startingBP: round.starting_bp,
            payout,
            profit,
            balance: wallet.bp
        };
    });

    return transaction();
}
