import { db } from "./database.ts";

type WalletRow = {
    bp: number;
};

type ThimblerigSessionRow = {
    session_id: number;
    player_id: number;
    finished_at: string | null;

    bet: number;
    difficulty: string;
    won: number;
};

export type StartThimblerigResult = {
    sessionId: number;
    playerId: number;
    balance: number;
};

export type FinishThimblerigResult = {
    sessionId: number;
    playerId: number;

    bet: number;
    payout: number;
    profit: number;

    won: boolean;
    balance: number;
};

export function startThimblerig(
    playerId: number,
    bet: number,
    difficulty: string
): StartThimblerigResult {

    const transaction = db.transaction(() => {

        const wallet = db.prepare(`
            SELECT bp
            FROM wallets
            WHERE player_id = ?
        `).get(playerId) as WalletRow | undefined;

        if (!wallet) {
            throw new Error(
                "Nie znaleziono portfela gracza"
            );
        }

        if (wallet.bp < bet) {
            throw new Error(
                "Gracz nie ma wystarczającej liczby BP"
            );
        }

        const sessionResult = db.prepare(`
            INSERT INTO game_sessions (
                player_id,
                game_type
            )
            VALUES (?, 'thimblerig')
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
            "thimblerig_bet",
            `Thimblerig - stawka, runda #${sessionId}`
        );

        /*
            won = -1 oznacza rundę rozpoczętą,
            ale jeszcze niezakończoną.
        */
        db.prepare(`
            INSERT INTO thimblerig_results (
                session_id,
                bet,
                payout,
                profit,
                difficulty,
                won
            )
            VALUES (?, ?, 0, ?, ?, -1)
        `).run(
            sessionId,
            bet,
            -bet,
            difficulty
        );

        return {
            sessionId,
            playerId,
            balance: wallet.bp - bet
        };
    });

    return transaction();
}

export function finishThimblerig(
    sessionId: number,
    won: boolean
): FinishThimblerigResult {

    const transaction = db.transaction(() => {

        const round = db.prepare(`
            SELECT
                game_sessions.id AS session_id,
                game_sessions.player_id,
                game_sessions.finished_at,

                thimblerig_results.bet,
                thimblerig_results.difficulty,
                thimblerig_results.won

            FROM game_sessions

            INNER JOIN thimblerig_results
                ON thimblerig_results.session_id =
                   game_sessions.id

            WHERE
                game_sessions.id = ?
                AND game_sessions.game_type =
                    'thimblerig'
        `).get(
            sessionId
        ) as ThimblerigSessionRow | undefined;

        if (!round) {
            throw new Error(
                "Nie znaleziono rundy Thimblerig"
            );
        }

        if (
            round.finished_at !== null ||
            round.won !== -1
        ) {
            throw new Error(
                "Ta runda została już zakończona"
            );
        }

        const payout =
            won
                ? round.bet * 2
                : 0;

        const profit =
            payout - round.bet;

        if (
            !Number.isSafeInteger(payout) ||
            !Number.isSafeInteger(profit)
        ) {
            throw new Error(
                "Niepoprawna wartość wypłaty"
            );
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
                "thimblerig_win",
                `Thimblerig - wygrana, runda #${sessionId}`
            );
        }

        db.prepare(`
            UPDATE thimblerig_results
            SET
                payout = ?,
                profit = ?,
                won = ?
            WHERE session_id = ?
        `).run(
            payout,
            profit,
            won ? 1 : 0,
            sessionId
        );

        db.prepare(`
            UPDATE game_sessions
            SET finished_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `).run(
            sessionId
        );

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

            bet: round.bet,
            payout,
            profit,

            won,
            balance: wallet.bp
        };
    });

    return transaction();
}