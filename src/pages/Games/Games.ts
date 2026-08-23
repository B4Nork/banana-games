import "./Games.css";

import { Background } from "../../components/Background/Background";
import { WheelCard } from "./components/WheelCard/WheelCard";
import { PlinkoCard } from "./components/PlinkoCard/PlinkoCard";
import { RandomCard } from "./components/RandomCard/RandomCard";

export function Games(onGameClick: (game: string) => void): HTMLElement {
    const gamesPage = document.createElement("main");

    gamesPage.className = "games-page";

    gamesPage.appendChild(Background());

    const title = document.createElement("h1");

    title.className = "games-title";
    title.textContent = "WYBIERZ GRĘ";

    gamesPage.appendChild(title);

    const gamesGrid = document.createElement("div");

    gamesGrid.className = "games-grid";


    gamesPage.appendChild(gamesGrid);

    gamesGrid.appendChild(
        WheelCard(() => onGameClick("wheel"))
    );

    gamesGrid.appendChild(
        PlinkoCard(() => onGameClick("plinko"))
    );

    gamesGrid.appendChild(RandomCard());

    return gamesPage;
}