import "./Games.css";

import { Background } from "../../components/Background/Background";
import { WheelCard } from "./components/WheelCard/WheelCard";
import { PlinkoCard } from "./components/PlinkoCard/PlinkoCard";

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


    gamesPage.appendChild(gamesGrid);

    gamesGrid.appendChild(WheelCard());

    gamesGrid.appendChild(PlinkoCard());

    return gamesPage;
}