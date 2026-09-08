import {
    createPlayer,
    getBalance,
    addBP,
    removeBP,
    getBPTransactions
} from "./playerService.ts";

const player =
    createPlayer("B4Nork");

console.log("GRACZ:");
console.log(player);

console.log(
    "SALDO POCZĄTKOWE:",
    getBalance(player.id)
);

const afterAdd = addBP(
    player.id,
    5000,
    "test_add",
    "Testowe dodanie BP"
);

console.log(
    "PO DODANIU:",
    afterAdd
);

const afterRemove = removeBP(
    player.id,
    1000,
    "test_remove",
    "Testowe odjęcie BP"
);

console.log(
    "PO ODJĘCIU:",
    afterRemove
);

console.log(
    "SALDO KOŃCOWE:",
    getBalance(player.id)
);

console.log("HISTORIA BP:");

const transactions =
    getBPTransactions(player.id);

console.table(transactions);