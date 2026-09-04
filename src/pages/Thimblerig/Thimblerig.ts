import "./Thimblerig.css";

import { createBananas } from "../../utils/createBananas";

type CupData = {
    id: number;
    position: number;
    element: HTMLElement;
};

export function Thimblerig(onBack: () => void): HTMLElement {
    const pageThimblerig = document.createElement("div");

    pageThimblerig.className = "thimblerig-page";

    pageThimblerig.innerHTML = `
        <div class="thimblerig-game">
            <h1>KUBECZKI</h1>

            <div class="thimblerig-game-board">

                <div class="cup-container" data-cup="1">
                    <div class="game-cup"></div>
                </div>

                <div class="cup-container" data-cup="2">
                    <div class="game-ball"></div>
                    <div class="game-cup"></div>
                </div>

                <div class="cup-container" data-cup="3">
                    <div class="game-cup"></div>
                </div>

            </div>

            <button class="thimblerig-start">
                START
            </button>
        </div>
    `;

    const startButton =
        pageThimblerig.querySelector<HTMLButtonElement>(".thimblerig-start");

    const cupElements =
        pageThimblerig.querySelectorAll<HTMLElement>(".cup-container");

    if (!startButton || cupElements.length !== 3) {
        throw new Error("Nie znaleziono elementów gry Thimblerig");
    }

    /*
        position:
        0 = lewa
        1 = środek
        2 = prawa
    */

    const cups: CupData[] = Array.from(cupElements).map((element, index) => ({
        id: index + 1,
        position: index,
        element
    }));

    const POSITION_X = [
        -190,
        0,
        190
    ];

    /*
        Kulka należy do kubka numer 2.

        Nawet jeśli kubek 2 pojedzie na lewo albo prawo,
        kulka nadal jedzie razem z nim.
    */
    const ballCupId = 2;

    function updateCupPositions(): void {
        cups.forEach((cup) => {
            const x = POSITION_X[cup.position];

            cup.element.style.transform = `translateX(${x}px)`;
        });
    }

    function wait(ms: number): Promise<void> {
        return new Promise((resolve) => {
            setTimeout(resolve, ms);
        });
    }

    async function revealBall(): Promise<void> {
        const ballCup = cups.find((cup) => cup.id === ballCupId);

        if (!ballCup) return;

        const cup =
            ballCup.element.querySelector<HTMLElement>(".game-cup");

        if (!cup) return;

        cup.classList.add("revealed");

        await wait(1500);

        cup.classList.remove("revealed");

        await wait(600);
    }

    async function swapCups(
        firstCupId: number,
        secondCupId: number
    ): Promise<void> {

        const firstCup = cups.find((cup) => cup.id === firstCupId);
        const secondCup = cups.find((cup) => cup.id === secondCupId);

        if (!firstCup || !secondCup) {
            return;
        }

        const firstOldPosition = firstCup.position;
        const secondOldPosition = secondCup.position;

        /*
            Zamieniamy logiczne pozycje.
        */
        firstCup.position = secondOldPosition;
        secondCup.position = firstOldPosition;

        const firstX = POSITION_X[firstCup.position];
        const secondX = POSITION_X[secondCup.position];

        /*
            Jeden kubek jedzie lekko górą,
            drugi lekko dołem.
        */
        firstCup.element.style.transform =
            `translate(${firstX}px, -35px)`;

        secondCup.element.style.transform =
            `translate(${secondX}px, 35px)`;

        await wait(600);

        /*
            Po zakończeniu zamiany oba kubki
            wracają na tę samą wysokość.
        */
        firstCup.element.style.transform =
            `translate(${firstX}px, 0px)`;

        secondCup.element.style.transform =
            `translate(${secondX}px, 0px)`;

        await wait(200);
    }

    updateCupPositions();

    startButton.addEventListener("click", async () => {
        startButton.disabled = true;

        await revealBall();

        /*
            Na razie testowa sekwencja.

            Potem zastąpimy ją losowym generatorem.
        */
        await swapCups(1, 2);
        await swapCups(2, 3);
        await swapCups(1, 3);

        startButton.disabled = false;
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