import "./Thimblerig.css";

import { createBananas } from "../../utils/createBananas";

type CupData = {
    id: number;
    position: number;
    element: HTMLElement;
};

type SwapPair = [number, number];

type DifficultyConfig = {
    name: string;
    moves: number;
    swapDuration: number;
    pauseDuration: number;
};

export function Thimblerig(onBack: () => void): HTMLElement {
    const pageThimblerig = document.createElement("div");

    pageThimblerig.className = "thimblerig-page";

    pageThimblerig.innerHTML = `
        <div class="thimblerig-game">

            <h1>THIMBLERIG</h1>

            <div class="thimblerig-layout">

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

                <div class="thimblerig-bet-panel">

                    <div class="bet-panel-header">
                        STAWKA
                    </div>

                    <div class="bet-input-wrapper">

                        <input
                            class="thimblerig-bet-input"
                            type="number"
                            min="1"
                            step="1"
                            value="1000"
                        />

                        <span class="bet-currency">
                            BP
                        </span>

                    </div>

                    <div class="bet-info">

                        <div class="bet-info-row">
                            <span>POZIOM</span>
                            <strong class="difficulty-value">
                                ŁATWY
                            </strong>
                        </div>

                        <div class="bet-info-row">
                            <span>MNOŻNIK</span>
                            <strong>
                                ×2
                            </strong>
                        </div>

                        <div class="bet-info-row bet-win-row">
                            <span>WYGRANA</span>
                            <strong class="win-value">
                                2 000 BP
                            </strong>
                        </div>

                    </div>

                    <div class="bet-risk-info">
                        Im większa stawka, tym trudniejsze mieszanie.
                    </div>

                    <button class="thimblerig-start">
                        START
                    </button>

                </div>

            </div>

            <p class="thimblerig-status"></p>

        </div>
    `;

    const startButton =
        pageThimblerig.querySelector<HTMLButtonElement>(
            ".thimblerig-start"
        )!;

    const betInput =
        pageThimblerig.querySelector<HTMLInputElement>(
            ".thimblerig-bet-input"
        )!;

    const difficultyValue =
        pageThimblerig.querySelector<HTMLElement>(
            ".difficulty-value"
        )!;

    const winValue =
        pageThimblerig.querySelector<HTMLElement>(
            ".win-value"
        )!;

    const cupElements =
        pageThimblerig.querySelectorAll<HTMLElement>(
            ".cup-container"
        )!;

    const statusText =
        pageThimblerig.querySelector<HTMLElement>(
            ".thimblerig-status"
        )!;

    const gameBoard =
        pageThimblerig.querySelector<HTMLElement>(
            ".thimblerig-game-board"
        )!;

    if (cupElements.length !== 3) {
        throw new Error(
            "Nie znaleziono 3 kubków gry Thimblerig"
        );
}

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
        Fizyczny kubek numer 2
        zawsze posiada kulkę.
    */
    const ballCupId = 2;

    let canChoose = false;

    /*
        Stawka używana podczas aktualnej rundy.

        Nie używamy bezpośrednio wartości inputa,
        bo gracz nie powinien jej zmienić
        podczas mieszania.
    */
    let currentBet = 1000;

    /*
        ===============================
        PROGI TRUDNOŚCI
        ===============================
    */

    function getDifficulty(
        bet: number
    ): DifficultyConfig {

        if (bet < 1000) {
            return {
                name: "BARDZO ŁATWY",
                moves: 3,
                swapDuration: 800,
                pauseDuration: 150
            };
        }

        if (bet < 5000) {
            return {
                name: "ŁATWY",
                moves: 8,
                swapDuration: 650,
                pauseDuration: 120
            };
        }

        if (bet < 20000) {
            return {
                name: "NORMALNY",
                moves: 10,
                swapDuration: 200,
                pauseDuration: 70
            };
        }

        if (bet < 50000) {
            return {
                name: "TRUDNY",
                moves: 20,
                swapDuration: 150,
                pauseDuration: 70
            };
        }

        if (bet < 100000) {
            return {
                name: "BARDZO TRUDNY",
                moves: 20,
                swapDuration: 90,
                pauseDuration: 30
            };
        }

        return {
            name: "EKSTREMALNY",
            moves: 200,
            swapDuration: 20,
            pauseDuration: 10
        };
    }

    function wait(
        ms: number
    ): Promise<void> {

        return new Promise(
            (resolve) => {
                setTimeout(resolve, ms);
            }
        );
    }

    function formatBP(
        value: number
    ): string {

        return `${value.toLocaleString("pl-PL")} BP`;
    }

    function getBetValue(): number {

        const value =
            Number(betInput.value);

        if (
            !Number.isFinite(value) ||
            value < 1
        ) {
            return 1;
        }

        return Math.floor(value);
    }

    function updateBetPanel(): void {

        const bet =
            getBetValue();

        const difficulty =
            getDifficulty(bet);

        const possibleWin =
            bet * 2;

        difficultyValue.textContent =
            difficulty.name;

        winValue.textContent =
            formatBP(possibleWin);
    }

    function updateCupPositions(): void {

        cups.forEach((cup) => {

            const x =
                POSITION_X[cup.position];

            cup.element.style.transform =
                `translateX(${x}px)`;
        });
    }

    /*
        CSS transition kubków jest ustawiany
        dynamicznie zależnie od poziomu trudności.
    */

    function setCupTransitionSpeed(
        duration: number
    ): void {

        cups.forEach((cup) => {

            cup.element.style.transition =
                `transform ${duration}ms cubic-bezier(0.45, 0, 0.55, 1)`;
        });
    }

    async function revealBall(): Promise<void> {

        const ballCup =
            cups.find(
                (cup) =>
                    cup.id === ballCupId
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

        cupVisual.classList.add(
            "revealed"
        );

        await wait(1500);

        cupVisual.classList.remove(
            "revealed"
        );

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

        cupVisual.classList.add(
            "revealed"
        );

        await wait(1300);
    }

    async function swapCups(
        firstCupId: number,
        secondCupId: number,
        difficulty: DifficultyConfig
    ): Promise<void> {

        const firstCup =
            cups.find(
                (cup) =>
                    cup.id === firstCupId
            );

        const secondCup =
            cups.find(
                (cup) =>
                    cup.id === secondCupId
            );

        if (
            !firstCup ||
            !secondCup
        ) {
            return;
        }

        const firstOldPosition =
            firstCup.position;

        const secondOldPosition =
            secondCup.position;

        firstCup.position =
            secondOldPosition;

        secondCup.position =
            firstOldPosition;

        const firstX =
            POSITION_X[firstCup.position];

        const secondX =
            POSITION_X[secondCup.position];

        /*
            Każda zamiana ma własną szybkość
            zależną od stawki.
        */

        setCupTransitionSpeed(
            difficulty.swapDuration
        );

        /*
            Jeden kubek przechodzi górą,
            drugi dołem.
        */

        firstCup.element.style.transform =
            `translate(${firstX}px, -35px)`;

        secondCup.element.style.transform =
            `translate(${secondX}px, 35px)`;

        await wait(
            difficulty.swapDuration
        );

        /*
            Wracamy na tę samą wysokość.
        */

        firstCup.element.style.transform =
            `translate(${firstX}px, 0px)`;

        secondCup.element.style.transform =
            `translate(${secondX}px, 0px)`;

        await wait(
            difficulty.pauseDuration
        );
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

            /*
                Nie wykonujemy tej samej
                zamiany dwa razy pod rząd.
            */

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

    async function shuffleCups(
        difficulty: DifficultyConfig
    ): Promise<void> {

        const sequence =
            generateShuffleSequence(
                difficulty.moves
            );

        console.log(
            "Sekwencja mieszania:",
            sequence
        );

        console.log(
            "Poziom:",
            difficulty
        );

        for (
            const [
                firstCup,
                secondCup
            ] of sequence
        ) {

            await swapCups(
                firstCup,
                secondCup,
                difficulty
            );
        }
    }

    /*
        ===============================
        WYBÓR KUBKA
        ===============================
    */

    cups.forEach((cup) => {

        cup.element.addEventListener(
            "click",
            async () => {

                if (!canChoose) {
                    return;
                }

                canChoose = false;

                gameBoard.classList.remove(
                    "choosing"
                );

                await revealChosenCup(
                    cup
                );

                if (
                    cup.id === ballCupId
                ) {

                    const reward =
                        currentBet * 2;

                    statusText.textContent =
                        `WYGRANA! ${formatBP(reward)}`;

                } else {

                    statusText.textContent =
                        `PRZEGRANA! -${formatBP(currentBet)}`;
                }

                /*
                    Przywracamy panel.
                */

                startButton.disabled =
                    false;

                betInput.disabled =
                    false;

                startButton.textContent =
                    "ZAGRAJ PONOWNIE";

                updateBetPanel();
            }
        );
    });

    /*
        ===============================
        PANEL STAWKI
        ===============================
    */

    betInput.addEventListener(
        "input",
        () => {

            updateBetPanel();
        }
    );

    /*
        ===============================
        START
        ===============================
    */

    startButton.addEventListener(
        "click",
        async () => {

            currentBet =
                getBetValue();

            if (currentBet < 1) {
                return;
            }

            const difficulty =
                getDifficulty(
                    currentBet
                );

            /*
                Blokujemy panel podczas rundy.
            */

            startButton.disabled =
                true;

            betInput.disabled =
                true;

            canChoose =
                false;

            gameBoard.classList.remove(
                "choosing"
            );

            statusText.textContent =
                "";

            /*
                Zamykamy kubki
                z poprzedniej rundy.
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
                Pokazujemy kulkę.
            */

            statusText.textContent =
                `ZAPAMIĘTAJ KUBEK — GRA O ${formatBP(currentBet * 2)}`;

            await revealBall();

            /*
                Mieszanie.
            */

            statusText.textContent =
                `MIESZANIE — ${difficulty.name}`;

            await shuffleCups(
                difficulty
            );

            /*
                Przywracamy wolniejszą
                transition na moment wyboru.
            */

            setCupTransitionSpeed(
                500
            );

            statusText.textContent =
                "WYBIERZ KUBEK";

            gameBoard.classList.add(
                "choosing"
            );

            canChoose =
                true;
        }
    );

    /*
        Pierwsze ustawienie panelu.
    */

    updateBetPanel();

    updateCupPositions();

    /*
        ===============================
        BACK
        ===============================
    */

    const backButton =
        document.createElement(
            "button"
        );

    backButton.className =
        "back-button";

    backButton.textContent =
        "← WRÓĆ DO GIER";

    backButton.addEventListener(
        "click",
        () => {

            createBananas();

            setTimeout(
                () => {
                    onBack();
                },
                1400
            );
        }
    );

    pageThimblerig.appendChild(
        backButton
    );

    return pageThimblerig;
}