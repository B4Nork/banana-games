import express from "express";

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

app.listen(PORT, () => {
    console.log(
        `Banana Games API działa na http://localhost:${PORT}`
    );
});