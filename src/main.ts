import "./styles/global.css";
import { Home } from "./pages/Home/Home";

const app = document.querySelector<HTMLDivElement>("#app");

if (!app) {
    throw new Error("Nie znaleziono elementu #app");
}

app.appendChild(Home());

console.log("🍌 Banana Games uruchomione!");