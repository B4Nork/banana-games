import fs from "node:fs";
import path from "node:path";

const MAX_BACKUPS = 10;

const databasePath = path.resolve(
    "database",
    "banana-games.db"
);

const backupDirectory = path.resolve(
    "database",
    "backups"
);

if (!fs.existsSync(databasePath)) {
    console.log("Brak bazy do wykonania backupu.");
    process.exit(0);
}

if (!fs.existsSync(backupDirectory)) {
    fs.mkdirSync(
        backupDirectory,
        { recursive: true }
    );
}

const now = new Date();

const timestamp = now
    .toISOString()
    .replace(/:/g, "-")
    .replace(/\..+/, "");

const backupPath = path.join(
    backupDirectory,
    `banana-games-${timestamp}.db`
);

fs.copyFileSync(
    databasePath,
    backupPath
);

console.log(
    `Backup utworzony: ${backupPath}`
);

// Pobieramy wszystkie backupy
const backups = fs
    .readdirSync(backupDirectory)
    .filter(file =>
        file.startsWith("banana-games-") &&
        file.endsWith(".db")
    )
    .sort();

// Usuwamy najstarsze, jeśli jest ich więcej niż 10
while (backups.length > MAX_BACKUPS) {
    const oldestBackup = backups.shift();

    if (!oldestBackup) {
        break;
    }

    const oldestBackupPath = path.join(
        backupDirectory,
        oldestBackup
    );

    fs.unlinkSync(oldestBackupPath);

    console.log(
        `Usunięto stary backup: ${oldestBackup}`
    );
}

console.log(
    `Liczba backupów: ${backups.length}/${MAX_BACKUPS}`
);