import { db } from "./database.ts";

export type Player = {
    id: number;
    twitch_name: string;
    display_name: string;
    created_at: string;
    updated_at: string;
};

export type Wallet = {
    player_id: number;
    bp: number;
    updated_at: string;
};

export type BPTransaction = {
    id: number;
    player_id: number;
    amount: number;
    transaction_type: string;
    description: string | null;
    created_at: string;
};

export type PlayerWithBalance = {
    id: number;
    twitch_name: string;
    display_name: string;
    bp: number;
    created_at: string;
    rank: number;
};

export type PlayerRank = {
    rank: number;
};

export function createPlayer(displayName: string): Player {
    const twitchName = displayName
        .trim()
        .toLowerCase();

    const insertPlayer = db.prepare(`
        INSERT OR IGNORE INTO players (
            twitch_name,
            display_name
        )
        VALUES (?, ?)
    `);

    insertPlayer.run(
        twitchName,
        displayName.trim()
    );

    const player = db.prepare(`
        SELECT *
        FROM players
        WHERE twitch_name = ?
    `).get(twitchName) as Player;

    const insertWallet = db.prepare(`
        INSERT OR IGNORE INTO wallets (
            player_id,
            bp
        )
        VALUES (?, 0)
    `);

    insertWallet.run(player.id);

    return player;
}

export function getPlayer(
    twitchName: string
): Player | undefined {
    return db.prepare(`
        SELECT *
        FROM players
        WHERE twitch_name = ?
    `).get(
        twitchName.trim().toLowerCase()
    ) as Player | undefined;
}

export function getWallet(
    playerId: number
): Wallet | undefined {
    return db.prepare(`
        SELECT *
        FROM wallets
        WHERE player_id = ?
    `).get(playerId) as Wallet | undefined;
}

export function getBalance(
    playerId: number
): number {
    const wallet = getWallet(playerId);

    if (!wallet) {
        throw new Error(
            `Nie znaleziono portfela gracza ID ${playerId}`
        );
    }

    return wallet.bp;
}

function changeBP(
    playerId: number,
    amount: number,
    transactionType: string,
    description?: string
): number {
    const transaction = db.transaction(() => {
        const wallet = getWallet(playerId);

        if (!wallet) {
            throw new Error(
                `Nie znaleziono portfela gracza ID ${playerId}`
            );
        }

        const newBalance =
            wallet.bp + amount;

        if (newBalance < 0) {
            throw new Error(
                `Gracz nie ma wystarczającej liczby BP`
            );
        }

        db.prepare(`
            UPDATE wallets
            SET
                bp = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE player_id = ?
        `).run(
            newBalance,
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
            amount,
            transactionType,
            description ?? null
        );

        return newBalance;
    });

    return transaction();
}

export function addBP(
    playerId: number,
    amount: number,
    transactionType = "manual_add",
    description?: string
): number {
    if (amount <= 0) {
        throw new Error(
            "addBP wymaga dodatniej liczby BP"
        );
    }

    return changeBP(
        playerId,
        amount,
        transactionType,
        description
    );
}

export function removeBP(
    playerId: number,
    amount: number,
    transactionType = "manual_remove",
    description?: string
): number {
    if (amount <= 0) {
        throw new Error(
            "removeBP wymaga dodatniej liczby BP"
        );
    }

    return changeBP(
        playerId,
        -amount,
        transactionType,
        description
    );
}

export function getBPTransactions(
    playerId: number
): BPTransaction[] {
    return db.prepare(`
        SELECT *
        FROM bp_transactions
        WHERE player_id = ?
        ORDER BY id DESC
    `).all(playerId) as BPTransaction[];
}



export function getAllPlayers(
    limit = 15
): PlayerWithBalance[] {
    return db.prepare(`
        SELECT
            id,
            twitch_name,
            display_name,
            bp,
            created_at,
            rank
        FROM (
            SELECT
                players.id,
                players.twitch_name,
                players.display_name,
                wallets.bp,
                players.created_at,
                ROW_NUMBER() OVER (
                    ORDER BY
                        wallets.bp DESC,
                        players.id ASC
                ) AS rank
            FROM players
            INNER JOIN wallets
                ON wallets.player_id = players.id
        )
        ORDER BY rank ASC
        LIMIT ?
    `).all(limit) as PlayerWithBalance[];
}

export function getPlayerRank(
    playerId: number
): number | undefined {
    const result = db.prepare(`
        SELECT rank
        FROM (
            SELECT
                players.id,
                ROW_NUMBER() OVER (
                    ORDER BY
                        wallets.bp DESC,
                        players.id ASC
                ) AS rank
            FROM players
            INNER JOIN wallets
                ON wallets.player_id = players.id
        )
        WHERE id = ?
    `).get(playerId) as PlayerRank | undefined;

    return result?.rank;
}