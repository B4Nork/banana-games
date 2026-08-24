import "./styles/global.css";

import { Home } from "./pages/Home/Home";
import { Games } from "./pages/Games/Games";
import { Wheel } from "./pages/Wheel/Wheel";
import { Plinko } from "./pages/Plinko/Plinko";

const app = document.querySelector<HTMLDivElement>("#app");

if (!app) {
    throw new Error("Nie znaleziono elementu #app");
}

const root = app;

function showHome(): void {
    root.innerHTML = "";
    root.appendChild(Plinko(showGames));
}

function showGames(): void {
    root.innerHTML = "";
    root.appendChild(Games(showGame));
}

function showGame(game: string): void {
    if (game === "wheel") {
        root.innerHTML = "";
        root.appendChild(Wheel(showGames));
    }

    if (game === "plinko") {
        root.innerHTML = "";
        root.appendChild(Plinko(showGames));
    }
}

showHome();