import express from "express";

import { db } from "./database.ts";

import {
    startThimblerig, 
    finishThimblerig
} from "./thimblerigService.ts";

import {
    startPlinko,
    finishPlinko
} from "./plinkoService.ts";

import {
    startWheel,
    finishWheel
} from "./wheelService.ts";

import {
    createPlayer,
    getPlayer,
    getBalance,
    addBP,
    removeBP,
    getBPTransactions,
    getAllPlayers,
    getPlayerRank
} from "./playerService.ts";

const app = express();

const PORT = 3001;

app.use(express.json());

app.get("/api/players", (_req, res) => {
    const players = getAllPlayers();

    return res.json({
        players
    });
});

app.get("/api/players/:name", (req, res) => {
    const player = getPlayer(req.params.name);

    if (!player) {
        return res.status(404).json({
            error: "Nie znaleziono gracza"
        });
    }

    const balance = getBalance(player.id);
    const rank = getPlayerRank(player.id);

    return res.json({
        player,
        balance,
        rank
    });
});

app.post("/api/players", (req, res) => {
    const {
        displayName,
        startingBP = 0
    } = req.body;

    if (
        typeof displayName !== "string" ||
        displayName.trim() === ""
    ) {
        return res.status(400).json({
            error: "Brak poprawnego nicku"
        });
    }

    if (
        typeof startingBP !== "number" ||
        !Number.isSafeInteger(startingBP) ||
        startingBP < 0
    ) {
        return res.status(400).json({
            error: "Niepoprawna liczba początkowych BP"
        });
    }

    try {
        const existingPlayer =
            getPlayer(displayName);

        if (existingPlayer) {
            return res.status(409).json({
                error: "Gracz o takim nicku już istnieje"
            });
        }

        const player =
            createPlayer(displayName);

        let balance =
            getBalance(player.id);

        if (startingBP > 0) {
            balance = addBP(
                player.id,
                startingBP,
                "starting_balance",
                "Początkowe BP gracza"
            );
        }

        const rank =
            getPlayerRank(player.id);

        return res.status(201).json({
            player,
            balance,
            rank
        });

    } catch (error) {
        return res.status(400).json({
            error:
                error instanceof Error
                    ? error.message
                    : "Nieznany błąd"
        });
    }
});

app.post("/api/players/:id/bp/add", (req, res) => {
    const playerId = Number(req.params.id);

    const {
        amount,
        transactionType,
        description
    } = req.body;

    if (
        !Number.isInteger(playerId) ||
        playerId <= 0
    ) {
        return res.status(400).json({
            error: "Niepoprawne ID gracza"
        });
    }

    if (
        typeof amount !== "number" ||
        amount <= 0
    ) {
        return res.status(400).json({
            error: "Niepoprawna liczba BP"
        });
    }

    try {
        const balance = addBP(
            playerId,
            amount,
            transactionType ?? "manual_add",
            description
        );

        return res.json({
            balance
        });
    } catch (error) {
        return res.status(400).json({
            error:
                error instanceof Error
                    ? error.message
                    : "Nieznany błąd"
        });
    }
});

app.post("/api/players/:id/bp/remove", (req, res) => {
    const playerId = Number(req.params.id);

    const {
        amount,
        transactionType,
        description
    } = req.body;

    if (
        !Number.isInteger(playerId) ||
        playerId <= 0
    ) {
        return res.status(400).json({
            error: "Niepoprawne ID gracza"
        });
    }

    if (
        typeof amount !== "number" ||
        amount <= 0
    ) {
        return res.status(400).json({
            error: "Niepoprawna liczba BP"
        });
    }

    try {
        const balance = removeBP(
            playerId,
            amount,
            transactionType ?? "manual_remove",
            description
        );

        return res.json({
            balance
        });
    } catch (error) {
        return res.status(400).json({
            error:
                error instanceof Error
                    ? error.message
                    : "Nieznany błąd"
        });
    }
});

app.get(
    "/api/players/:id/transactions",
    (req, res) => {
        const playerId = Number(req.params.id);

        if (
            !Number.isInteger(playerId) ||
            playerId <= 0
        ) {
            return res.status(400).json({
                error: "Niepoprawne ID gracza"
            });
        }

        const transactions =
            getBPTransactions(playerId);

        return res.json({
            transactions
        });
    }
);

app.post(
    "/api/games/thimblerig/start",
    (req, res) => {

        const {
            playerId,
            bet,
            difficulty
        } = req.body;

        if (
            !Number.isSafeInteger(playerId) ||
            playerId <= 0
        ) {
            return res.status(400).json({
                error:
                    "Niepoprawne ID gracza"
            });
        }

        if (
            !Number.isSafeInteger(bet) ||
            bet <= 0
        ) {
            return res.status(400).json({
                error:
                    "Niepoprawna stawka"
            });
        }

        if (
            bet > Number.MAX_SAFE_INTEGER / 2
        ) {
            return res.status(400).json({
                error:
                    "Stawka jest za duża"
            });
        }

        if (
            typeof difficulty !== "string" ||
            difficulty.trim() === ""
        ) {
            return res.status(400).json({
                error:
                    "Niepoprawny poziom trudności"
            });
        }

        try {
            const result =
                startThimblerig(
                    playerId,
                    bet,
                    difficulty
                );

            const rank =
                getPlayerRank(playerId);

            return res.status(201).json({
                ...result,
                rank
            });

        } catch (error) {

            return res.status(400).json({
                error:
                    error instanceof Error
                        ? error.message
                        : "Nieznany błąd"
            });
        }
    }
);

app.post(
    "/api/games/thimblerig/:sessionId/finish",
    (req, res) => {

        const sessionId =
            Number(req.params.sessionId);

        const {
            won
        } = req.body;

        if (
            !Number.isSafeInteger(sessionId) ||
            sessionId <= 0
        ) {
            return res.status(400).json({
                error:
                    "Niepoprawne ID rundy"
            });
        }

        if (typeof won !== "boolean") {
            return res.status(400).json({
                error:
                    "Niepoprawny wynik rundy"
            });
        }

        try {
            const result =
                finishThimblerig(
                    sessionId,
                    won
                );

            const rank =
                getPlayerRank(
                    result.playerId
                );

            return res.json({
                ...result,
                rank
            });

        } catch (error) {

            return res.status(400).json({
                error:
                    error instanceof Error
                        ? error.message
                        : "Nieznany błąd"
            });
        }
    }
);

app.post(
    "/api/games/plinko/start",
    (req, res) => {

        const {
            playerId,
            bet,
            ballsCount
        } = req.body;

        if (
            !Number.isSafeInteger(playerId) ||
            playerId <= 0
        ) {
            return res.status(400).json({
                error: "Niepoprawne ID gracza"
            });
        }

        if (
            !Number.isSafeInteger(bet) ||
            bet <= 0
        ) {
            return res.status(400).json({
                error: "Niepoprawna stawka"
            });
        }

        if (
            !Number.isSafeInteger(ballsCount) ||
            ballsCount < 1 ||
            ballsCount > 50
        ) {
            return res.status(400).json({
                error: "Niepoprawna liczba kulek"
            });
        }

        try {

            const result =
                startPlinko(
                    playerId,
                    bet,
                    ballsCount
                );

            const rank =
                getPlayerRank(playerId);

            return res
                .status(201)
                .json({
                    ...result,
                    rank
                });

        } catch (error) {

            return res.status(400).json({
                error:
                    error instanceof Error
                        ? error.message
                        : "Nieznany błąd"
            });
        }
    }
);

app.post(
    "/api/games/plinko/:sessionId/finish",
    (req, res) => {

        const sessionId =
            Number(req.params.sessionId);

        const {
            payout,
            bestMultiplier
        } = req.body;

        if (
            !Number.isSafeInteger(sessionId) ||
            sessionId <= 0
        ) {
            return res.status(400).json({
                error: "Niepoprawne ID rundy"
            });
        }

        if (
            !Number.isSafeInteger(payout) ||
            payout < 0
        ) {
            return res.status(400).json({
                error: "Niepoprawna wypłata"
            });
        }

        if (
            bestMultiplier !== null &&
            (
                typeof bestMultiplier !== "number" ||
                !Number.isFinite(bestMultiplier)
            )
        ) {
            return res.status(400).json({
                error: "Niepoprawny mnożnik"
            });
        }

        try {

            const result =
                finishPlinko(
                    sessionId,
                    payout,
                    bestMultiplier
                );

            const rank =
                getPlayerRank(
                    result.playerId
                );

            return res.json({
                ...result,
                rank
            });

        } catch (error) {

            return res.status(400).json({
                error:
                    error instanceof Error
                        ? error.message
                        : "Nieznany błąd"
            });
        }
    }
);

app.post(
    "/api/games/wheel/start",
    (req, res) => {

        const { playerId } = req.body;

        if (
            !Number.isSafeInteger(playerId) ||
            playerId <= 0
        ) {
            return res.status(400).json({
                error: "Niepoprawne ID gracza"
            });
        }

        try {
            const result =
                startWheel(playerId);

            const rank =
                getPlayerRank(playerId);

            return res.status(201).json({
                ...result,
                rank
            });

        } catch (error) {

            return res.status(400).json({
                error:
                    error instanceof Error
                        ? error.message
                        : "Nieznany błąd"
            });
        }
    }
);

app.post(
    "/api/games/wheel/:sessionId/finish",
    (req, res) => {

        const sessionId =
            Number(req.params.sessionId);

        const {
            rewardName,
            rewardType,
            rewardValue,
            rewardText
        } = req.body;

        if (
            !Number.isSafeInteger(sessionId) ||
            sessionId <= 0
        ) {
            return res.status(400).json({
                error: "Niepoprawne ID rundy"
            });
        }

        if (
            typeof rewardName !== "string" ||
            rewardName.trim() === ""
        ) {
            return res.status(400).json({
                error: "Niepoprawna nazwa nagrody"
            });
        }

        if (
            typeof rewardType !== "string" ||
            rewardType.trim() === ""
        ) {
            return res.status(400).json({
                error: "Niepoprawny typ nagrody"
            });
        }

        if (
            rewardValue !== null &&
            (
                !Number.isSafeInteger(rewardValue) ||
                rewardValue < 0
            )
        ) {
            return res.status(400).json({
                error: "Niepoprawna wartość nagrody"
            });
        }

        if (
            rewardText !== null &&
            typeof rewardText !== "string"
        ) {
            return res.status(400).json({
                error: "Niepoprawny opis nagrody"
            });
        }

        try {
            const result =
                finishWheel(
                    sessionId,
                    rewardName.trim(),
                    rewardType.trim(),
                    rewardValue,
                    rewardText
                );

            const rank =
                getPlayerRank(
                    result.playerId
                );

            return res.json({
                ...result,
                rank
            });

        } catch (error) {

            return res.status(400).json({
                error:
                    error instanceof Error
                        ? error.message
                        : "Nieznany błąd"
            });
        }
    }
);

app.get(
    "/api/admin/history",
    (_req, res) => {
        try {
            const rows = db.prepare(`
                SELECT
                    bt.id AS transaction_id,
                    bt.player_id,
                    p.twitch_name,
                    p.display_name,

                    bt.amount,
                    bt.transaction_type,
                    bt.description,
                    bt.created_at,

                    w.bp AS current_balance,

                    gs.id AS game_session_id,
                    gs.game_type,

                    wr.reward_name,
                    wr.reward_type,
                    wr.reward_value,
                    wr.reward_text

                FROM bp_transactions bt

                JOIN players p
                    ON p.id = bt.player_id

                JOIN wallets w
                    ON w.player_id = bt.player_id

                LEFT JOIN game_sessions gs
                    ON (
                        bt.transaction_type = 'wheel_spin'
                        AND bt.description = 'Koło Fortuny - runda #' || gs.id
                        AND gs.player_id = bt.player_id
                        AND gs.game_type = 'wheel'
                    )

                LEFT JOIN wheel_results wr
                    ON wr.session_id = gs.id

                ORDER BY
                    bt.created_at DESC,
                    bt.id DESC

                LIMIT 500
            `).all();

            return res.json(rows);

        } catch (error) {
            console.error(error);

            return res.status(500).json({
                error: "Nie udało się pobrać historii"
            });
        }
    }
);

app.listen(PORT, () => {
    console.log(
        `Banana Games API działa na http://localhost:${PORT}`
    );
});