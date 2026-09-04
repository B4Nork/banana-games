import "./Thimblerig.css";

import { createBananas } from "../../utils/createBananas";

type CupData = {
    id: number;
    position: number;
    element: HTMLElement;
};

type SwapPair = [number, number];

export function Thimblerig(onBack: () => void): HTMLElement {
    const pageThimblerig = document.createElement("div");

    pageThimblerig.className = "thimblerig-page";

    pageThimblerig.innerHTML = `
        <div class="thimblerig-game">

            <h1>THIMBLERIG</h1>

            <div class="thimblerig-game-board">

                <div class="cup-container" data-cup="1">
                    <div class="game-cup">
                        <div class="cup-logo">B</div>
                    </div>
                </div>

                <div class="cup-container" data-cup="2">

                    <div class="game-ball">
                        ★
                    </div>

                    <div class="game-cup">
                        <div class="cup-logo">B</div>
                    </div>

                </div>

                <div class="cup-container" data-cup="3">
                    <div class="game-cup">
                        <div class="cup-logo">B</div>
                    </div>
                </div>

            </div>

            <p class="thimblerig-status"></p>

            <button class="thimblerig-start">
                START
            </button>

        </div>
    `;

    const startButton =
        pageThimblerig.querySelector<HTMLButtonElement>(
            ".thimblerig-start"
        );

    const cupElements =
        pageThimblerig.querySelectorAll<HTMLElement>(
            ".cup-container"
        );

    const statusText =
        pageThimblerig.querySelector<HTMLElement>(
            ".thimblerig-status"
        );

    const gameBoard =
        pageThimblerig.querySelector<HTMLElement>(
            ".thimblerig-game-board"
        );

    if (
        !startButton ||
        !statusText ||
        !gameBoard ||
        cupElements.length !== 3
    ) {
        throw new Error(
            "Nie znaleziono elementów gry Thimblerig"
        );
    }

    /*
        position:

        0 = lewa
        1 = środek
        2 = prawa
    */

    const cups: CupData[] =
        Array.from(cupElements).map(
            (element, index) => ({
                id: index + 1,
                position: index,
                element
            })
        );

    const POSITION_X = [
        -190,
        0,
        190
    ];

    /*
        Nagroda należy do fizycznego kubka nr 2.

        Jeżeli kubek 2 zostanie przesunięty,
        nagroda przesuwa się razem z nim,
        ponieważ znajduje się w jego kontenerze.
    */

    const ballCupId = 2;

    let canChoose = false;

    function wait(ms: number): Promise<void> {
        return new Promise((resolve) => {
            setTimeout(resolve, ms);
        });
    }

    function updateCupPositions(): void {
        cups.forEach((cup) => {
            const x = POSITION_X[cup.position];

            cup.element.style.transform =
                `translateX(${x}px)`;
        });
    }

    async function revealBall(): Promise<void> {
        const ballCup =
            cups.find(
                (cup) => cup.id === ballCupId
            );

        if (!ballCup) {
            return;
        }

        const cupVisual =
            ballCup.element.querySelector<HTMLElement>(
                ".game-cup"
            );

        if (!cupVisual) {
            return;
        }

        cupVisual.classList.add("revealed");

        await wait(1500);

        cupVisual.classList.remove("revealed");

        await wait(600);
    }

    async function revealChosenCup(
        cup: CupData
    ): Promise<void> {

        const cupVisual =
            cup.element.querySelector<HTMLElement>(
                ".game-cup"
            );

        if (!cupVisual) {
            return;
        }

        cupVisual.classList.add("revealed");

        await wait(1500);
    }

    async function swapCups(
        firstCupId: number,
        secondCupId: number
    ): Promise<void> {

        const firstCup =
            cups.find(
                (cup) => cup.id === firstCupId
            );

        const secondCup =
            cups.find(
                (cup) => cup.id === secondCupId
            );

        if (!firstCup || !secondCup) {
            return;
        }

        const firstOldPosition =
            firstCup.position;

        const secondOldPosition =
            secondCup.position;

        /*
            Zamiana logicznych miejsc.
        */

        firstCup.position =
            secondOldPosition;

        secondCup.position =
            firstOldPosition;

        const firstX =
            POSITION_X[firstCup.position];

        const secondX =
            POSITION_X[secondCup.position];

        /*
            Jeden kubek przechodzi górą,
            drugi dołem.
        */

        firstCup.element.style.transform =
            `translate(${firstX}px, -35px)`;

        secondCup.element.style.transform =
            `translate(${secondX}px, 35px)`;

        await wait(600);

        /*
            Wracają na wspólną wysokość.
        */

        firstCup.element.style.transform =
            `translate(${firstX}px, 0px)`;

        secondCup.element.style.transform =
            `translate(${secondX}px, 0px)`;

        await wait(200);
    }

    function generateShuffleSequence(
        movesCount: number
    ): SwapPair[] {

        const possiblePairs: SwapPair[] = [
            [1, 2],
            [1, 3],
            [2, 3]
        ];

        const sequence: SwapPair[] = [];

        let previousPair:
            SwapPair | null = null;

        for (
            let i = 0;
            i < movesCount;
            i++
        ) {
            let availablePairs =
                possiblePairs;

            if (previousPair) {
                availablePairs =
                    possiblePairs.filter(
                        ([a, b]) => {
                            return !(
                                a === previousPair![0] &&
                                b === previousPair![1]
                            );
                        }
                    );
            }

            const randomIndex =
                Math.floor(
                    Math.random() *
                    availablePairs.length
                );

            const selectedPair =
                availablePairs[randomIndex];

            sequence.push(
                selectedPair
            );

            previousPair =
                selectedPair;
        }

        return sequence;
    }

    async function shuffleCups(): Promise<void> {
        const sequence =
            generateShuffleSequence(10);

        console.log(
            "Sekwencja mieszania:",
            sequence
        );

        for (
            const [
                firstCup,
                secondCup
            ] of sequence
        ) {
            await swapCups(
                firstCup,
                secondCup
            );
        }
    }

    cups.forEach((cup) => {

        cup.element.addEventListener(
            "click",
            async () => {

                if (!canChoose) {
                    return;
                }

                canChoose = false;

                /*
                    Po kliknięciu od razu
                    wyłączamy hover wyboru.
                */

                gameBoard.classList.remove(
                    "choosing"
                );

                await revealChosenCup(cup);

                if (
                    cup.id === ballCupId
                ) {
                    statusText.textContent =
                        "WYGRANA!";
                } else {
                    statusText.textContent =
                        "PRZEGRANA!";
                }

                startButton.disabled = false;

                startButton.textContent =
                    "ZAGRAJ PONOWNIE";
            }
        );
    });

    startButton.addEventListener(
        "click",
        async () => {

            startButton.disabled = true;

            canChoose = false;

            gameBoard.classList.remove(
                "choosing"
            );

            statusText.textContent = "";

            /*
                Chowamy wszystkie odkryte
                kubki z poprzedniej rundy.
            */

            cups.forEach((cup) => {

                const cupVisual =
                    cup.element
                        .querySelector<HTMLElement>(
                            ".game-cup"
                        );

                cupVisual?.classList.remove(
                    "revealed"
                );
            });

            await wait(500);

            /*
                Pokazujemy graczowi,
                gdzie jest nagroda.
            */

            statusText.textContent =
                "ZAPAMIĘTAJ KUBEK";

            await revealBall();

            /*
                Start mieszania.
            */

            statusText.textContent =
                "MIESZANIE...";

            await shuffleCups();

            /*
                Gracz może wybierać.
            */

            statusText.textContent =
                "WYBIERZ KUBEK";

            gameBoard.classList.add(
                "choosing"
            );

            canChoose = true;
        }
    );

    updateCupPositions();

    const backButton =
        document.createElement("button");

    backButton.className =
        "back-button";

    backButton.textContent =
        "← WRÓĆ DO GIER";

    backButton.addEventListener(
        "click",
        () => {

            createBananas();

            setTimeout(() => {
                onBack();
            }, 1400);
        }
    );

    pageThimblerig.appendChild(
        backButton
    );

    return pageThimblerig;
}