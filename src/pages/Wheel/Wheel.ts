import "./Wheel.css";
import { createBananas } from "../../untils/createBananas";

export function Wheel(onBack: () => void): HTMLElement {
    const wheel = document.createElement("main");

    const backButton = document.createElement("button");

    wheel.className = "wheel-page";

    wheel.innerHTML = `
        <h1>KOŁO FORTUNY</h1>
    `;
    backButton.textContent = "← WRÓĆ DO GIER";

    backButton.addEventListener("click", () => {
        createBananas();

        setTimeout(() => {
            onBack();
        }, 1200);
    });

    wheel.appendChild(backButton);

    return wheel;
}