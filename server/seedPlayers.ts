import { db } from "./database.ts";

const playerNames = [
    "BananaKing",
    "Koxu123",
    "MatiGaming",
    "Pawcio",
    "KrzysiekTV",
    "Ziemniak",
    "ShadowPL",
    "Kapi",
    "MrBanana",
    "Kubson",
    "Viewer2137",
    "NocnyGracz",
    "Pixelowy",
    "RudyBoss",
    "BananowyJoe",
    "Fioletowy",
    "ZielonyGoblin",
    "Speedrunner",
    "CasualPlayer",
    "TryHard",
    "KebabMaster",
    "Pierog",
    "GamerPL",
    "CichyViewer",
    "ChatEnjoyer",
    "LosowyTyp",
    "Kasztan",
    "Marchewa",
    "Ogorek",
    "Boczek",
    "Pablo",
    "Mistrzu",
    "Klocuch",
    "GigaBanana",
    "NoobMaster",
    "ProPlayer",
    "AFKViewer",
    "Lurker",
    "ChatWarrior",
    "Pepega",
    "Monke",
    "BananMan",
    "PurpleGuy",
    "GreenGuy",
    "LuckyViewer",
    "UnluckyViewer",
    "PlinkoMaster",
    "WheelEnjoyer",
    "CupMaster",
    "FinalBoss"
];

function randomBP(): number {
    return Math.floor(
        Math.random() * 1_000_000
    );
}

const seedDatabase = db.transaction(() => {

    // Usunięcie wszystkich graczy.
    // Powiązane rekordy usuną się przez ON DELETE CASCADE.
    db.prepare(`
        DELETE FROM players
    `).run();

    // Reset ID AUTOINCREMENT
    db.prepare(`
        DELETE FROM sqlite_sequence
        WHERE name IN (
            'players',
            'bp_transactions',
            'game_sessions',
            'wheel_results',
            'plinko_results',
            'thimblerig_results'
        )
    `).run();

    const insertPlayer = db.prepare(`
        INSERT INTO players (
            twitch_name,
            display_name
        )
        VALUES (?, ?)
    `);

    const insertWallet = db.prepare(`
        INSERT INTO wallets (
            player_id,
            bp
        )
        VALUES (?, ?)
    `);

    const insertTransaction = db.prepare(`
        INSERT INTO bp_transactions (
            player_id,
            amount,
            transaction_type,
            description
        )
        VALUES (?, ?, ?, ?)
    `);

    for (const displayName of playerNames) {

        const twitchName =
            displayName.toLowerCase();

        const playerResult =
            insertPlayer.run(
                twitchName,
                displayName
            );

        const playerId =
            Number(playerResult.lastInsertRowid);

        const bp = randomBP();

        insertWallet.run(
            playerId,
            bp
        );

        insertTransaction.run(
            playerId,
            bp,
            "test_seed",
            "Testowe początkowe BP"
        );
    }
});

seedDatabase();

console.log(
    `Dodano ${playerNames.length} testowych graczy.`
);

console.log("TOP 15:");

const topPlayers = db.prepare(`
    SELECT
        players.display_name,
        wallets.bp
    FROM players
    INNER JOIN wallets
        ON wallets.player_id = players.id
    ORDER BY wallets.bp DESC
    LIMIT 15
`).all();

console.table(topPlayers);