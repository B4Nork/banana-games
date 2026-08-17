import "./styles/global.css";

import { Home } from "./pages/Home/Home";
import { Games } from "./pages/Games/Games";

const app = document.querySelector<HTMLDivElement>("#app");

if (!app) {
    throw new Error("Nie znaleziono elementu #app");
}

const root = app;

function showHome(): void {
    root.innerHTML = "";
    root.appendChild(Home(showGames));
}

function showGames(): void {
    root.innerHTML = "";
    root.appendChild(Games());
}

showHome();