import "./StartButton.css";
import { createBananas } from "../../../../untils/createBananas";

export function StartButton(onStart: () => void): HTMLElement {
    const button = document.createElement("button");

    button.className = "start-button";
    button.textContent = "ZACZNIJ";

    button.addEventListener("click", () => {
        createBananas();

        setTimeout(() => {
            onStart();
        }, 1400);
    });

    return button;
}