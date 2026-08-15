import "./styles/global.css";
import { Games } from "./pages/Games/Games";

const app = document.querySelector<HTMLDivElement>("#app");

if (!app) {
    throw new Error("Nie znaleziono elementu #app");
}

app.appendChild(Games());

console.log("🍌 Banana Games uruchomione!");