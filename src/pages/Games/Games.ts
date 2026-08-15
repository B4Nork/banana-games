import "./Games.css";

import { Background } from "../../components/Background/Background";
import { GameCard } from "./components/GameCard/GameCard";

export function Games(): HTMLElement {
    const gamesPage = document.createElement("main");

    gamesPage.className = "games-page";

    gamesPage.appendChild(Background());

    const title = document.createElement("h1");

    title.className = "games-title";
    title.textContent = "WYBIERZ GRĘ";

    gamesPage.appendChild(title);

    const gamesGrid = document.createElement("div");

    gamesGrid.className = "games-grid";

    const games = [
        {
            name: "PLINKO",
            icon: "🎱"
        },
        {
            name: "RISK",
            icon: "🎯"
        },
        {
            name: "KOŁO",
            icon: "🎡"
        },
        {
            name: "KAFELKI",
            icon: "🧩"
        },
        {
            name: "BANANA",
            icon: "🍌"
        },
        {
            name: "LOSOWANIE",
            icon: "🎲"
        }
    ];

    games.forEach((game) => {
        gamesGrid.appendChild(GameCard(game));
    });

    gamesPage.appendChild(gamesGrid);

    return gamesPage;
}