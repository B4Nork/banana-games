import { db } from "./database.ts";

const twitchName = "b4nork";
const displayName = "B4Nork";

const insertPlayer = db.prepare(`
    INSERT OR IGNORE INTO players (
        twitch_name,
        display_name
    )
    VALUES (?, ?)
`);

insertPlayer.run(
    twitchName,
    displayName
);

const player = db.prepare(`
    SELECT *
    FROM players
    WHERE twitch_name = ?
`).get(twitchName) as {
    id: number;
    twitch_name: string;
    display_name: string;
};

const insertWallet = db.prepare(`
    INSERT OR IGNORE INTO wallets (
        player_id,
        bp
    )
    VALUES (?, ?)
`);

insertWallet.run(
    player.id,
    1000
);

const wallet = db.prepare(`
    SELECT *
    FROM wallets
    WHERE player_id = ?
`).get(player.id);

console.log("GRACZ:");
console.log(player);

console.log("PORTFEL:");
console.log(wallet);