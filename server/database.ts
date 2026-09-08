import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

const databaseDirectory = path.resolve("database");
const databasePath = path.join(
    databaseDirectory,
    "banana-games.db"
);

if (!fs.existsSync(databaseDirectory)) {
    fs.mkdirSync(databaseDirectory, {
        recursive: true
    });
}

export const db = new Database(databasePath);

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
    CREATE TABLE IF NOT EXISTS players (
        id INTEGER PRIMARY KEY AUTOINCREMENT,

        twitch_name TEXT NOT NULL UNIQUE,
        display_name TEXT NOT NULL,

        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );


    CREATE TABLE IF NOT EXISTS wallets (
        player_id INTEGER PRIMARY KEY,

        bp INTEGER NOT NULL DEFAULT 0,

        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

        FOREIGN KEY (player_id)
            REFERENCES players(id)
            ON DELETE CASCADE
    );


    CREATE TABLE IF NOT EXISTS bp_transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,

        player_id INTEGER NOT NULL,

        amount INTEGER NOT NULL,

        transaction_type TEXT NOT NULL,

        description TEXT,

        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

        FOREIGN KEY (player_id)
            REFERENCES players(id)
            ON DELETE CASCADE
    );


    CREATE TABLE IF NOT EXISTS game_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,

        player_id INTEGER NOT NULL,

        game_type TEXT NOT NULL,

        started_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        finished_at TEXT,

        FOREIGN KEY (player_id)
            REFERENCES players(id)
            ON DELETE CASCADE
    );


    CREATE TABLE IF NOT EXISTS wheel_results (
        id INTEGER PRIMARY KEY AUTOINCREMENT,

        session_id INTEGER NOT NULL UNIQUE,

        reward_name TEXT NOT NULL,

        reward_type TEXT NOT NULL,

        reward_value INTEGER,

        reward_text TEXT,

        FOREIGN KEY (session_id)
            REFERENCES game_sessions(id)
            ON DELETE CASCADE
    );


    CREATE TABLE IF NOT EXISTS plinko_results (
        id INTEGER PRIMARY KEY AUTOINCREMENT,

        session_id INTEGER NOT NULL UNIQUE,

        starting_bp INTEGER NOT NULL,

        balls_count INTEGER NOT NULL,

        final_bp INTEGER NOT NULL,

        profit INTEGER NOT NULL,

        best_multiplier REAL,

        FOREIGN KEY (session_id)
            REFERENCES game_sessions(id)
            ON DELETE CASCADE
    );


    CREATE TABLE IF NOT EXISTS thimblerig_results (
        id INTEGER PRIMARY KEY AUTOINCREMENT,

        session_id INTEGER NOT NULL UNIQUE,

        bet INTEGER NOT NULL,

        payout INTEGER NOT NULL,

        profit INTEGER NOT NULL,

        difficulty TEXT NOT NULL,

        won INTEGER NOT NULL,

        FOREIGN KEY (session_id)
            REFERENCES game_sessions(id)
            ON DELETE CASCADE
    );
`);

console.log(
    `Banana Games database loaded: ${databasePath}`
);