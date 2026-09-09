import { db } from "./database.ts";

const clearDatabase = db.transaction(() => {
    // Dzięki ON DELETE CASCADE usunięcie graczy
    // usuwa też portfele, transakcje, sesje i wyniki gier.
    db.prepare(`
        DELETE FROM players
    `).run();

    // Reset liczników ID.
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
});

clearDatabase();

console.log("Baza graczy została wyczyszczona.");