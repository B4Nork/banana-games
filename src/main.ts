import "./styles/global.css";
import { Games } from "./pages/Games/Games";
// TODO: Przywrócić Home jako stronę startową i dodać przejście Home -> Games

const app = document.querySelector<HTMLDivElement>("#app");

if (!app) {
    throw new Error("Nie znaleziono elementu #app");
}

app.appendChild(Games());

console.log("🍌 Banana Games uruchomione!");
