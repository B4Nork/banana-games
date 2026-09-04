import "./Thimblerig.css";

import { createBananas } from "../../utils/createBananas";


export function Thimblerig(onBack: () => void): HTMLElement {
    const pageThimblerig = document.createElement("div");

    pageThimblerig.className = "thimblerig-page";

    pageThimblerig.innerHTML = `
        <div class="thimblerig-game">
            <h1>KUBECZKI</h1>

            <div class="thimblerig-game-board">

                <div class="cup-position" data-position="1">
                    <div class="game-cup" data-cup="1"></div>
                </div>

                <div class="cup-position" data-position="2">
                    <div class="game-ball"></div>
                    <div class="game-cup" data-cup="2"></div>
                </div>

                <div class="cup-position" data-position="3">
                    <div class="game-cup" data-cup="3"></div>
                </div>

            </div>

            <button class="thimblerig-start">
                START
            </button>
        </div>
    `;

    const startButton =
    pageThimblerig.querySelector<HTMLButtonElement>(".thimblerig-start");

    const middleCup =
        pageThimblerig.querySelector<HTMLElement>('[data-cup="2"]');

    if (!startButton || !middleCup) {
        throw new Error("Nie znaleziono elementów gry Thimblerig");
    }

    startButton.addEventListener("click", () => {
        startButton.disabled = true;

        middleCup.classList.add("revealed");

        setTimeout(() => {
            middleCup.classList.remove("revealed");
        }, 1500);

        setTimeout(() => {
            startButton.disabled = false;
        }, 2200);
    });

    const backButton = document.createElement("button");
    
        backButton.className = "back-button";
        backButton.textContent = "← WRÓĆ DO GIER";
    
        backButton.addEventListener("click", () => {
            createBananas();
    
            setTimeout(() => {
                onBack();
            }, 1400);
        });
    
        pageThimblerig.appendChild(backButton);
    
    return pageThimblerig;
}