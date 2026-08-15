import "./GameCard.css";

interface GameCardData {
    name: string;
    icon: string;
}

export function GameCard(game: GameCardData): HTMLElement {
    const card = document.createElement("button");

    card.className = "game-card";

    card.innerHTML = `
        <div class="game-card-icon">${game.icon}</div>
        <div class="game-card-name">${game.name}</div>
    `;

    return card;
}