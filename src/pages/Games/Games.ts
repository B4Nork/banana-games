import "./Games.css";

import { Background } from "../../components/Background/Background";
import { WheelCard } from "./components/WheelCard/WheelCard";
import { PlinkoCard } from "./components/PlinkoCard/PlinkoCard";
import { RandomCard } from "./components/RandomCard/RandomCard";
import { ThimblerigCard } from "./components/ThimblerigCard/ThimblerigCard";
import {ActivePlayerPanel} from "../../components/ActivePlayer/ActivePlayer";

export function Games(onGameClick: (game: string) => void): HTMLElement {
    const gamesPage = document.createElement("main");

    gamesPage.className = "games-page";

    gamesPage.appendChild(Background());

    gamesPage.appendChild(ActivePlayerPanel());

    const rankingButton = document.createElement("button");

    rankingButton.className = "games-ranking-button";
    rankingButton.innerHTML = `
        <span class="games-ranking-icon">🏆</span>
        <span>RANKING</span>
    `;

    rankingButton.addEventListener("click", () => {
        onGameClick("players");
    });

    gamesPage.appendChild(rankingButton);

    const shopButton = document.createElement("button");

    shopButton.className = "games-shop-button";

    shopButton.innerHTML = `
        <span class="games-shop-icon">🛒</span>
        <span>SKLEP</span>
    `;

    shopButton.addEventListener("click", () => {
        onGameClick("shop");
    });

    gamesPage.appendChild(shopButton);

    const adminButton = document.createElement("button");

    adminButton.className = "games-admin-button";
    adminButton.innerHTML = `
        <span class="games-admin-icon">⚙️</span>
        <span>ADMIN</span>
    `;

    adminButton.addEventListener("click", () => {
        onGameClick("admin");
    });

    gamesPage.appendChild(adminButton);

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

    gamesGrid.appendChild(
        ThimblerigCard(() => onGameClick("thimblerig"))
    );

    gamesGrid.appendChild(RandomCard());

    return gamesPage;
}