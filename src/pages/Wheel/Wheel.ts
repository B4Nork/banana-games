import "./Wheel.css";
import { createBananas } from "../../utils/createBananas";

export function Wheel(onBack: () => void): HTMLElement {
    const wheelPage = document.createElement("main");

    wheelPage.className = "wheel-page";

    wheelPage.innerHTML = `
        <h1 class="wheel-page-title">KOŁO FORTUNY</h1>

        <div class="wheel-content">

            <section class="wheel-section">

                <div class="wheel-placeholder">
                    <span>O</span>
                </div>

                <button class="spin-button">
                    ZAKRĘĆ
                </button>

            </section>

            <section class="rewards-panel">

                <h2>NAGRODY</h2>

                <div class="reward-list">

                    <div class="reward-row">
                        <span class="reward-name">100 PUNKTÓW</span>
                        <span class="reward-chance">40%</span>
                    </div>

                    <div class="reward-row">
                        <span class="reward-name">VIP</span>
                        <span class="reward-chance">30%</span>
                    </div>

                    <div class="reward-row">
                        <span class="reward-name">BAN</span>
                        <span class="reward-chance">20%</span>
                    </div>

                    <div class="reward-row">
                        <span class="reward-name">???</span>
                        <span class="reward-chance">10%</span>
                    </div>

                </div>

                <button class="add-reward-button">
                    + DODAJ NAGRODĘ
                </button>

                <div class="reward-total">
                    SUMA: 100%
                </div>

            </section>

        </div>
    `;

    const backButton = document.createElement("button");

    backButton.className = "back-button";
    backButton.textContent = "← WRÓĆ DO GIER";

    backButton.addEventListener("click", () => {
        createBananas();

        setTimeout(() => {
            onBack();
        }, 1400);
    });

    wheelPage.appendChild(backButton);

    return wheelPage;
}