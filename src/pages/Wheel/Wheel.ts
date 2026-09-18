import "./Wheel.css";
import { createBananas } from "../../utils/createBananas";
import { ActivePlayerPanel } from "../../components/ActivePlayer/ActivePlayer";
import { openChallengeWheel } from "../../components/ChallengeWheel/ChallengeWheel";

import {
    getActivePlayer,
    setActivePlayer
} from "../../state/activePlayer";

let rewardContainer: HTMLElement;
let rewardTotal: HTMLElement;

let wheelRotation = 0;
let isSpinning = false;

const WHEEL_COST = 5000;

let currentSessionId: number | null = null;

interface Reward {
    name: string;
    chance: number;
    color: string;

    type: string;
    value: number | null;
    text: string | null;
}

interface VisualReward extends Reward {
    visualWeight: number;
    startAngle: number;
    endAngle: number;
    centerAngle: number;
}

const WHEEL_COLORS = [
    "#7c3aed",
    "#10b981",
    "#ef4444",
    "#2563eb",
    "#f97316",
    "#0891b2",
    "#d946ef",
    "#d97706",
    "#4f46e5",
    "#16a34a",
    "#dc2626",
    "#0284c7",
    "#a855f7",
    "#84cc16",
    "#e11d48"
];

const rewards: Reward[] = [
    {
        name: "Jackpot — 1 mln BP",
        chance: 1,
        color: "#FACC15",
        type: "bp",
        value: 1000000,
        text: "JACKPOT! Wygrywasz 1 000 000 BP."
    },
    {
        name: "Wybierz mi grę",
        chance: 0.5,
        color: "#EAB308",
        type: "game_choice",
        value: null,
        text: "Wybierasz grę, którą B4Nork ma ograć."
    },
    {
        name: "Bananowy łup",
        chance: 0.2,
        color: "#F59E0B",
        type: "physical",
        value: null,
        text: "Wygrywasz tajemniczą paczkę!"
    },
    {
        name: "Ukradnij 10k BP",
        chance: 10,
        color: "#DC2626",
        type: "steal_bp",
        value: 10000,
        text: "Kradniesz maksymalnie 10 000 BP losowemu graczowi."
    },
    {
        name: "50k BP",
        chance: 5,
        color: "#16A34A",
        type: "bp",
        value: 50000,
        text: "Wygrywasz 50 000 BP."
    },
    {
        name: "Podpis Steam",
        chance: 3,
        color: "#2563EB",
        type: "steam_signature",
        value: null,
        text: "B4Nork podpisuje Twój profil Steam."
    },
    {
        name: "20 przysiadów",
        chance: 12,
        color: "#9333EA",
        type: "stream",
        value: 20,
        text: "B4Nork robi 20 przysiadów."
    },
    {
        name: "Pompki ręce",
        chance: 4,
        color: "#7C3AED",
        type: "stream",
        value: null,
        text: "B4Nork podejmuje jedną próbę pompek w staniu na rękach."
    },
    {
        name: "Timeout dla widza",
        chance: 12.3,
        color: "#DB2777",
        type: "challenge",
        value: null,
        text: "Losowanie wyzwania timeout dla widza."
    },
    {
        name: "Timeout dla streamera",
        chance: 8,
        color: "#BE185D",
        type: "challenge",
        value: null,
        text: "Losowanie wyzwania timeout dla streamera."
    },
    {
        name: "BAN czy ułaskawienie?",
        chance: 10,
        color: "#991B1B",
        type: "ban_or_pardon",
        value: null,
        text: "Losowanie 50/50! Timeout na 10 minut albo ułaskawienie."
    },
    {
        name: "Pusta skórka",
        chance: 13,
        color: "#64748B",
        type: "empty",
        value: null,
        text: "Niestety, nic nie wygrywasz."
    },
    {
        name: "10 pompek / 10k BP",
        chance: 11,
        color: "#0891B2",
        type: "choice",
        value: 10000,
        text: "Wybierz: 10 pompek dla B4Norka albo 10 000 BP dla siebie."
    },
    {
        name: "Przymusowe kubeczki",
        chance: 10,
        color: "#CA8A04",
        type: "forced_cups",
        value: 5000,
        text: "Grasz w Trzy Kubki na koncie B4Norka za 5 000 BP. Wygrana: dostajesz 10 000 BP. Przegrana: timeout na 3 minuty."
    }
];

export function Wheel(onBack: () => void): HTMLElement {
    wheelRotation = 0;
    isSpinning = false;

    const wheelPage = document.createElement("main");

    wheelPage.className = "wheel-page";

    wheelPage.innerHTML = `
        <h1 class="wheel-page-title">
            KOŁO FORTUNY
        </h1>

        <div class="wheel-content">

            <section class="wheel-section">

                <div class="wheel-wrapper">

                    <div class="wheel-pointer">
                        <div class="wheel-pointer-inner"></div>
                    </div>

                    <div class="wheel-placeholder">

                        <svg
                            class="wheel-svg"
                            viewBox="0 0 500 500"
                        ></svg>

                        <div class="wheel-tooltip"></div>

                    </div>

                </div>

                <button class="spin-button">
                    ZAKRĘĆ — 5 000 BP
                </button>

                <div class="spin-status">
                    Kliknij i sprawdź swoje szczęście
                </div>

                <div class="spin-result-overlay">

                    <div class="spin-result-modal">

                        <div class="result-banana">
                            🍌
                        </div>

                        <h2>
                            WYGRAŁEŚ!
                        </h2>

                        <div class="spin-result-reward"></div>

                        <div class="spin-result-chance"></div>

                        <div class="spin-steal-panel" hidden>
                            <div class="spin-steal-message"></div>

                            <button
                                type="button"
                                class="spin-steal-draw"
                            >
                                LOSUJ OFIARĘ
                            </button>

                            <button
                                type="button"
                                class="spin-steal-execute"
                                hidden
                            >
                                WYKONAJ KRADZIEŻ
                            </button>
                        </div>

                        <button class="spin-result-close">
                            ZAMKNIJ
                        </button>

                    </div>

                </div>

            </section>

            <section class="rewards-panel">

                <h2>
                    NAGRODY
                </h2>

                <div class="reward-container"></div>

                <button class="add-reward-button">
                    + DODAJ NAGRODĘ
                </button>

                <div class="reward-total"></div>

            </section>

        </div>
    `;

    let activePlayerPanel =
        ActivePlayerPanel();

    wheelPage.appendChild(
        activePlayerPanel
    );

    function refreshActivePlayerPanel(): void {
        const newPanel =
            ActivePlayerPanel();

        activePlayerPanel.replaceWith(
            newPanel
        );

        activePlayerPanel =
            newPanel;
    }

    rewardContainer =
        wheelPage.querySelector<HTMLElement>(
            ".reward-container"
        )!;

    rewardTotal =
        wheelPage.querySelector<HTMLElement>(
            ".reward-total"
        )!;

    const wheelElement =
        wheelPage.querySelector<HTMLElement>(
            ".wheel-placeholder"
        );

    const spinButton =
        wheelPage.querySelector<HTMLButtonElement>(
            ".spin-button"
        );

    if (
        !rewardContainer ||
        !rewardTotal ||
        !wheelElement ||
        !spinButton
    ) {
        throw new Error(
            "Nie znaleziono elementów Koła Fortuny"
        );
    }

    updateRewards(
        wheelElement
    );

    updateWheel(
        wheelElement
    );

    spinButton.addEventListener(
        "click",
        () => {
            spinWheel(
                wheelElement,
                wheelPage,
                spinButton,
                refreshActivePlayerPanel
            );
        }
    );

    const resultOverlay =
        wheelPage.querySelector<HTMLElement>(
            ".spin-result-overlay"
        );

    const resultClose =
        wheelPage.querySelector<HTMLButtonElement>(
            ".spin-result-close"
        );

    if (
        !resultOverlay ||
        !resultClose
    ) {
        throw new Error(
            "Nie znaleziono okna wyniku"
        );
    }

    resultClose.addEventListener("click", () => {
        resultOverlay.classList.remove("show");

        const pendingTarget = resultOverlay.dataset.challengeTarget;

        delete resultOverlay.dataset.challengeTarget;

        if (pendingTarget === "viewer" || pendingTarget === "streamer") {
            spinButton.disabled = true;

            openChallengeWheel(pendingTarget, () => {
                spinButton.disabled = false;
            });
        }
    });

    const addRewardButton =
        wheelPage.querySelector<HTMLButtonElement>(
            ".add-reward-button"
        );

    if (!addRewardButton) {
        throw new Error(
            "Nie znaleziono przycisku dodawania nagrody"
        );
    }

    addRewardButton.addEventListener(
        "click",
        () => {
            if (isSpinning) {
                return;
            }

            rewards.push({
                name: "NOWA NAGRODA",
                chance: 0,
                color: getWheelColor(
                    rewards.length
                ),

                type: "custom",
                value: null,
                text: null
            });

            updateRewards(
                wheelElement
            );

            updateWheel(
                wheelElement
            );
        }
    );

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
            if (isSpinning) {
                return;
            }

            createBananas();

            setTimeout(
                () => {
                    onBack();
                },
                1400
            );
        }
    );

    wheelPage.appendChild(
        backButton
    );

    return wheelPage;
}

/* ========================================
   CHANCE
   ======================================== */

function getTotalChance(): number {
    return rewards.reduce(
        (total, reward) =>
            total +
            Math.max(
                0,
                reward.chance
            ),
        0
    );
}

function getWheelColor(
    index: number
): string {
    return WHEEL_COLORS[
        index %
        WHEEL_COLORS.length
    ];
}

function getRandomReward(): Reward {
    const activeRewards =
        rewards.filter(
            (reward) =>
                reward.chance > 0
        );

    if (
        activeRewards.length === 0
    ) {
        throw new Error(
            "Brak aktywnych nagród"
        );
    }

    const totalChance =
        activeRewards.reduce(
            (total, reward) =>
                total +
                reward.chance,
            0
        );

    let random =
        Math.random() *
        totalChance;

    for (
        const reward
        of activeRewards
    ) {
        if (
            random <
            reward.chance
        ) {
            return reward;
        }

        random -=
            reward.chance;
    }

    return activeRewards[
        activeRewards.length - 1
    ];
}

/* ========================================
   VISUAL WEIGHTS

   Nie pokazujemy procentów 1:1.

   Używamy logarytmicznego skalowania:
   - ultra rare jest małe
   - common jest duże
   - ale wszystko pozostaje czytelne
   ======================================== */

function getVisualWeight(
    chance: number
): number {
    if (chance <= 0) {
        return 0;
    }

    /*
        SQRT daje dobre spłaszczenie.

        Przykładowo:

        0.25%  -> 0.50
        0.50%  -> 0.71
        1%     -> 1
        3%     -> 1.73
        5%     -> 2.23
        15%    -> 3.87
        25%    -> 5

        Dzięki temu różnica jest widoczna,
        ale Bananowy Łup nie staje się
        niewidzialną kreską.
    */

    const sqrtWeight =
        Math.sqrt(chance);

    /*
        Minimalna wizualna wartość.

        Jeśli coś ma 0.01%,
        nadal będzie widoczne.
    */

    return Math.max(
        0.55,
        sqrtWeight
    );
}

function getVisualRewards(): VisualReward[] {
    const activeRewards =
        rewards.filter(
            (reward) =>
                reward.chance > 0
        );

    const weightedRewards =
        activeRewards.map(
            (reward) => ({
                ...reward,
                visualWeight:
                    getVisualWeight(
                        reward.chance
                    )
            })
        );

    const totalWeight =
        weightedRewards.reduce(
            (total, reward) =>
                total +
                reward.visualWeight,
            0
        );

    let currentAngle =
        -90;

    return weightedRewards.map(
        (reward) => {

            const angle =
                reward.visualWeight /
                totalWeight *
                360;

            const startAngle =
                currentAngle;

            const endAngle =
                currentAngle +
                angle;

            const centerAngle =
                startAngle +
                angle / 2;

            currentAngle =
                endAngle;

            return {
                ...reward,
                startAngle,
                endAngle,
                centerAngle
            };
        }
    );
}

/* ========================================
   DRAW WHEEL
   ======================================== */

function updateWheel(
    wheel: HTMLElement
): void {
    const svg =
        wheel.querySelector<SVGSVGElement>(
            ".wheel-svg"
        );

    if (!svg) {
        return;
    }

    svg.innerHTML =
        "";

    const visualRewards =
        getVisualRewards();

    if (
        visualRewards.length === 0
    ) {
        return;
    }

    const centerX =
        250;

    const centerY =
        250;

    const radius =
        235;

    for (
        const reward
        of visualRewards
    ) {

        const angle =
            reward.endAngle -
            reward.startAngle;

        const startPoint =
            polarToCartesian(
                centerX,
                centerY,
                radius,
                reward.endAngle
            );

        const endPoint =
            polarToCartesian(
                centerX,
                centerY,
                radius,
                reward.startAngle
            );

        const largeArcFlag =
            angle > 180
                ? 1
                : 0;

        const pathData = [
            `M ${centerX} ${centerY}`,
            `L ${startPoint.x} ${startPoint.y}`,
            `A ${radius} ${radius} 0 ${largeArcFlag} 0 ${endPoint.x} ${endPoint.y}`,
            "Z"
        ].join(" ");

        const segment =
            document.createElementNS(
                "http://www.w3.org/2000/svg",
                "path"
            );

        segment.setAttribute(
            "class",
            "wheel-segment"
        );

        segment.setAttribute(
            "d",
            pathData
        );

        segment.setAttribute(
            "fill",
            reward.color
        );

        segment.setAttribute(
            "stroke",
            "#111"
        );

        segment.setAttribute(
            "stroke-width",
            "4"
        );

        addSegmentTooltip(
            wheel,
            segment,
            reward
        );

        svg.appendChild(
            segment
        );

        createSegmentLabel(
            svg,
            reward
        );
    }

    createWheelRings(
        svg
    );

    createWheelCenter(
        svg
    );
}

function getWheelLabel(name: string): string {
    const labels: Record<string, string> = {
        "Jackpot — 1 mln BP": "JACKPOT",
        "Wybierz mi grę": "WYBIERZ GRĘ",
        "Bananowy łup 📦": "BANANOWY ŁUP",
        "Ukradnij 10k BP": "UKRADNIJ 10K",
        "50k BP": "50K BP",
        "Podpis Steam": "PODPIS STEAM",
        "30 pompek": "30 POMPEK",
        "Fikołek": "FIKOŁEK",
        "Pompki na rękach": "POMPKI NA RĘKACH",
        "Timeout dla widza": "TIMEOUT WIDZ",
        "Timeout dla streamera": "TIMEOUT STREAMER",
        "Pusta skórka": "PUSTA SKÓRKA",
        "10 pompek / 10k BP": "POMPKI / 10K"
    };

    return labels[name] ?? name;
}

/* ========================================
   LABEL
   ======================================== */

function createSegmentLabel(
    svg: SVGSVGElement,
    reward: VisualReward
): void {

    const centerX =
        250;

    const centerY =
        250;

    const angleSize =
        reward.endAngle -
        reward.startAngle;

    /*
        Im węższy segment,
        tym bliżej środka tekst.
    */

    let textRadius =
        150;

    if (
        angleSize < 25
    ) {
        textRadius =
            165;
    }

    if (
        angleSize < 15
    ) {
        textRadius =
            175;
    }

    const position =
        polarToCartesian(
            centerX,
            centerY,
            textRadius,
            reward.centerAngle
        );

    const text =
        document.createElementNS(
            "http://www.w3.org/2000/svg",
            "text"
        );

    text.setAttribute(
        "class",
        "wheel-label"
    );

    if (angleSize < 12) {
        text.setAttribute("font-size", "10");
    } else if (angleSize < 20) {
        text.setAttribute("font-size", "12");
    } else {
        text.setAttribute("font-size", "14");
    }

    text.setAttribute(
        "x",
        String(position.x)
    );

    text.setAttribute(
        "y",
        String(position.y)
    );

    text.setAttribute(
        "text-anchor",
        "middle"
    );

    text.setAttribute(
        "dominant-baseline",
        "middle"
    );

    /*
        Tekst promieniowo.

        Czyli jest obrócony zgodnie
        z kierunkiem segmentu.
    */

    let rotation =
        reward.centerAngle;

    const normalized =
        normalizeAngle(
            reward.centerAngle
        );

    /*
        Jeśli tekst byłby do góry nogami,
        obracamy go o 180 stopni.
    */

    if (
        normalized > 90 &&
        normalized < 270
    ) {
        rotation +=
            180;
    }

    text.setAttribute(
        "transform",
        `rotate(${rotation} ${position.x} ${position.y})`
    );

    /*
        Małe segmenty:
        krótsza nazwa.
    */

    let lines = splitRewardName(getWheelLabel(reward.name));

    if (
        angleSize < 18
    ) {
        lines =
            lines.slice(
                0,
                2
            );
    }

    lines.forEach(
        (line, index) => {

            const tspan =
                document.createElementNS(
                    "http://www.w3.org/2000/svg",
                    "tspan"
                );

            tspan.setAttribute(
                "x",
                String(position.x)
            );

            tspan.setAttribute(
                "dy",
                index === 0
                    ? String(
                        -(
                            lines.length -
                            1
                        ) *
                        7
                    )
                    : "15"
            );

            tspan.textContent =
                line;

            text.appendChild(
                tspan
            );
        }
    );

    svg.appendChild(
        text
    );
}

function splitRewardName(
    name: string
): string[] {

    const maxLength =
        16;

    if (
        name.length <=
        maxLength
    ) {
        return [
            name
        ];
    }

    const words =
        name.split(" ");

    const lines: string[] =
        [];

    let currentLine =
        "";

    for (
        const word
        of words
    ) {
        const testLine =
            currentLine
                ? `${currentLine} ${word}`
                : word;

        if (
            testLine.length >
                maxLength &&
            currentLine
        ) {
            lines.push(
                currentLine
            );

            currentLine =
                word;
        } else {
            currentLine =
                testLine;
        }
    }

    if (
        currentLine
    ) {
        lines.push(
            currentLine
        );
    }

    return lines.slice(
        0,
        3
    );
}

/* ========================================
   RINGS
   ======================================== */

function createWheelRings(
    svg: SVGSVGElement
): void {

    const outerRing =
        document.createElementNS(
            "http://www.w3.org/2000/svg",
            "circle"
        );

    outerRing.setAttribute(
        "cx",
        "250"
    );

    outerRing.setAttribute(
        "cy",
        "250"
    );

    outerRing.setAttribute(
        "r",
        "238"
    );

    outerRing.setAttribute(
        "fill",
        "none"
    );

    outerRing.setAttribute(
        "stroke",
        "#dedede"
    );

    outerRing.setAttribute(
        "stroke-width",
        "9"
    );

    outerRing.setAttribute(
        "pointer-events",
        "none"
    );

    svg.appendChild(
        outerRing
    );

    const centerRing =
        document.createElementNS(
            "http://www.w3.org/2000/svg",
            "circle"
        );

    centerRing.setAttribute(
        "cx",
        "250"
    );

    centerRing.setAttribute(
        "cy",
        "250"
    );

    centerRing.setAttribute(
        "r",
        "55"
    );

    centerRing.setAttribute(
        "fill",
        "#111"
    );

    centerRing.setAttribute(
        "stroke",
        "#eeeeee"
    );

    centerRing.setAttribute(
        "stroke-width",
        "5"
    );

    centerRing.setAttribute(
        "pointer-events",
        "none"
    );

    svg.appendChild(
        centerRing
    );
}

function createWheelCenter(
    svg: SVGSVGElement
): void {

    const center =
        document.createElementNS(
            "http://www.w3.org/2000/svg",
            "circle"
        );

    center.setAttribute(
        "cx",
        "250"
    );

    center.setAttribute(
        "cy",
        "250"
    );

    center.setAttribute(
        "r",
        "34"
    );

    center.setAttribute(
        "fill",
        "#050505"
    );

    center.setAttribute(
        "stroke",
        "#facc15"
    );

    center.setAttribute(
        "stroke-width",
        "4"
    );

    center.setAttribute(
        "pointer-events",
        "none"
    );

    svg.appendChild(
        center
    );

    const logo =
        document.createElementNS(
            "http://www.w3.org/2000/svg",
            "text"
        );

    logo.setAttribute(
        "x",
        "250"
    );

    logo.setAttribute(
        "y",
        "253"
    );

    logo.setAttribute(
        "class",
        "wheel-center-logo"
    );

    logo.setAttribute(
        "text-anchor",
        "middle"
    );

    logo.setAttribute(
        "dominant-baseline",
        "middle"
    );

    logo.setAttribute(
        "pointer-events",
        "none"
    );

    logo.textContent =
        "B";

    svg.appendChild(
        logo
    );
}

/* ========================================
   TOOLTIP
   ======================================== */

function addSegmentTooltip(
    wheel: HTMLElement,
    segment: SVGPathElement,
    reward: Reward
): void {

    segment.addEventListener(
        "mouseenter",
        () => {

            const tooltip =
                wheel.querySelector<HTMLElement>(
                    ".wheel-tooltip"
                );

            if (!tooltip) {
                return;
            }

            tooltip.innerHTML = `
                <strong>
                    ${reward.name}
                </strong>

                <span>
                    Szansa: ${reward.chance}%
                </span>
            `;

            tooltip.style.display =
                "flex";
        }
    );

    segment.addEventListener(
        "mousemove",
        (event) => {

            const tooltip =
                wheel.querySelector<HTMLElement>(
                    ".wheel-tooltip"
                );

            if (!tooltip) {
                return;
            }

            const rect =
                wheel.getBoundingClientRect();

            tooltip.style.left =
                `${
                    event.clientX -
                    rect.left +
                    18
                }px`;

            tooltip.style.top =
                `${
                    event.clientY -
                    rect.top +
                    18
                }px`;
        }
    );

    segment.addEventListener(
        "mouseleave",
        () => {

            const tooltip =
                wheel.querySelector<HTMLElement>(
                    ".wheel-tooltip"
                );

            if (!tooltip) {
                return;
            }

            tooltip.style.display =
                "none";
        }
    );
}

/* ========================================
   CARTESIAN
   ======================================== */

function polarToCartesian(
    centerX: number,
    centerY: number,
    radius: number,
    angleInDegrees: number
): {
    x: number;
    y: number;
} {

    const angleInRadians =
        angleInDegrees *
        Math.PI /
        180;

    return {
        x:
            centerX +
            radius *
            Math.cos(
                angleInRadians
            ),

        y:
            centerY +
            radius *
            Math.sin(
                angleInRadians
            )
    };
}

/* ========================================
   REWARD LIST
   ======================================== */

function createRewardList(
    wheelElement: HTMLElement
): HTMLElement {

    const list =
        document.createElement(
            "div"
        );

    list.className =
        "reward-list";

    rewards.forEach(
        (reward, index) => {

            const row =
                document.createElement(
                    "div"
                );

            row.className =
                "reward-row";

            const nameInput =
                document.createElement(
                    "input"
                );

            nameInput.className =
                "reward-name-input";

            nameInput.type =
                "text";

            nameInput.value =
                reward.name;

            const chanceInput =
                document.createElement(
                    "input"
                );

            chanceInput.className =
                "reward-chance-input";

            chanceInput.type =
                "number";

            chanceInput.min =
                "0";

            chanceInput.max =
                "100";

            chanceInput.step =
                "0.01";

            chanceInput.value =
                String(
                    reward.chance
                );

            const percent =
                document.createElement(
                    "span"
                );

            percent.className =
                "reward-percent";

            percent.textContent =
                "%";

            const colorElement =
                document.createElement(
                    "div"
                );

            colorElement.className =
                "reward-color";

            colorElement.style.backgroundColor =
                reward.color;

            const removeButton =
                document.createElement(
                    "button"
                );

            removeButton.className =
                "remove-reward-button";

            removeButton.textContent =
                "×";

            nameInput.addEventListener(
                "input",
                () => {

                    reward.name =
                        nameInput.value;

                    updateWheel(
                        wheelElement
                    );
                }
            );

            chanceInput.addEventListener(
                "input",
                () => {

                    const value =
                        Number(
                            chanceInput.value
                        );

                    reward.chance =
                        Number.isFinite(
                            value
                        )
                            ? Math.max(
                                0,
                                value
                            )
                            : 0;

                    updateRewardTotal();

                    updateWheel(
                        wheelElement
                    );
                }
            );

            removeButton.addEventListener(
                "click",
                () => {

                    if (
                        isSpinning
                    ) {
                        return;
                    }

                    rewards.splice(
                        index,
                        1
                    );

                    rewards.forEach(
                        (
                            item,
                            rewardIndex
                        ) => {

                            item.color =
                                getWheelColor(
                                    rewardIndex
                                );
                        }
                    );

                    updateRewards(
                        wheelElement
                    );

                    updateWheel(
                        wheelElement
                    );
                }
            );

            row.append(
                nameInput,
                chanceInput,
                percent,
                colorElement,
                removeButton
            );

            list.appendChild(
                row
            );
        }
    );

    return list;
}

/* ========================================
   TOTAL
   ======================================== */

function updateRewardTotal(): void {
    const total =
        getTotalChance();

    rewardTotal.textContent =
        `SUMA: ${
            formatChance(
                total
            )
        }%`;

    rewardTotal.classList.toggle(
        "invalid",
        Math.abs(
            total -
            100
        ) >
        0.001
    );
}

function formatChance(
    value: number
): string {

    return Number.isInteger(
        value
    )
        ? value.toString()
        : value.toFixed(
            2
        );
}

function updateRewards(
    wheelElement: HTMLElement
): void {

    rewardContainer.innerHTML =
        "";

    rewardContainer.appendChild(
        createRewardList(
            wheelElement
        )
    );

    updateRewardTotal();
}

/* ========================================
   SPIN
   ======================================== */

async function spinWheel(
    wheel: HTMLElement,
    wheelPage: HTMLElement,
    spinButton: HTMLButtonElement,
    refreshActivePlayerPanel: () => void
): Promise<void> {

    if (isSpinning) {
        return;
    }

    const status =
        wheelPage.querySelector<HTMLElement>(
            ".spin-status"
        );

    const svg =
        wheel.querySelector<SVGSVGElement>(
            ".wheel-svg"
        );

    if (!svg) {
        return;
    }

    /* =========================
       SPRAWDZENIE GRACZA
       ========================= */

    const activePlayer =
        getActivePlayer();

    if (!activePlayer) {
        if (status) {
            status.textContent =
                "NAJPIERW WYBIERZ GRACZA";
        }

        return;
    }

    if (
        activePlayer.balance <
        WHEEL_COST
    ) {
        if (status) {
            status.textContent =
                `ZA MAŁO BP — POTRZEBA ${WHEEL_COST.toLocaleString("pl-PL")} BP`;
        }

        return;
    }

    /* =========================
       SPRAWDZENIE %
       ========================= */

    const totalChance =
        getTotalChance();

    if (
        Math.abs(
            totalChance - 100
        ) > 0.001
    ) {
        if (status) {
            status.textContent =
                `Suma musi wynosić 100%. Teraz: ${formatChance(totalChance)}%`;
        }

        return;
    }

    const visualRewards =
        getVisualRewards();

    if (
        visualRewards.length === 0
    ) {
        return;
    }

    /* =========================
       START RUNDY W BAZIE
       ========================= */

    spinButton.disabled =
        true;

    spinButton.textContent =
        "START...";

    if (status) {
        status.textContent =
            "Pobieram 5 000 BP...";
    }

    let startData;

    try {

        const response =
            await fetch(
                "/api/games/wheel/start",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        playerId:
                            activePlayer.id
                    })
                }
            );

        startData =
            await response.json();

        if (!response.ok) {

            if (status) {
                status.textContent =
                    startData.error ??
                    "BŁĄD STARTU KOŁA";
            }

            spinButton.disabled =
                false;

            spinButton.textContent =
                "ZAKRĘĆ — 5 000 BP";

            return;
        }

    } catch (error) {

        console.error(error);

        if (status) {
            status.textContent =
                "BŁĄD POŁĄCZENIA Z API";
        }

        spinButton.disabled =
            false;

        spinButton.textContent =
            "ZAKRĘĆ — 5 000 BP";

        return;
    }

    currentSessionId =
        startData.sessionId;

    /* =========================
       AKTUALIZACJA SALDA
       ========================= */

    const currentPlayer =
        getActivePlayer();

    if (
        currentPlayer &&
        currentPlayer.id ===
            activePlayer.id
    ) {
        setActivePlayer({
            ...currentPlayer,

            balance:
                startData.balance,

            rank:
                startData.rank ??
                currentPlayer.rank
        });

        refreshActivePlayerPanel();
    }

    /* =========================
       LOSOWANIE NAGRODY
       ========================= */

    const winningReward =
        getRandomReward();

    const visualWinner =
        visualRewards.find(
            (reward) =>
                reward.name ===
                winningReward.name
        );

    if (!visualWinner) {

        if (status) {
            status.textContent =
                "BŁĄD LOSOWANIA NAGRODY";
        }

        spinButton.disabled =
            false;

        spinButton.textContent =
            "ZAKRĘĆ — 5 000 BP";

        return;
    }

    isSpinning =
        true;

    spinButton.textContent =
        "KRĘCĘ...";

    if (status) {
        status.textContent =
            "Koło się kręci...";
    }

    /* =========================
       LOSOWE MIEJSCE W SEGMENCIE
       ========================= */

    const segmentSize =
        visualWinner.endAngle -
        visualWinner.startAngle;

    const safeMargin =
        Math.min(
            3,
            segmentSize * 0.15
        );

    const minAngle =
        visualWinner.startAngle +
        safeMargin;

    const maxAngle =
        visualWinner.endAngle -
        safeMargin;

    let targetSegmentAngle =
        visualWinner.centerAngle;

    if (
        maxAngle >
        minAngle
    ) {
        targetSegmentAngle =
            minAngle +
            Math.random() *
            (
                maxAngle -
                minAngle
            );
    }

    const pointerAngle =
        -90;

    const desiredRotation =
        pointerAngle -
        targetSegmentAngle;

    const currentNormalized =
        normalizeAngle(
            wheelRotation
        );

    const desiredNormalized =
        normalizeAngle(
            desiredRotation
        );

    let delta =
        desiredNormalized -
        currentNormalized;

    delta =
        normalizeAngle(delta);

    const extraSpins =
        6 * 360;

    wheelRotation +=
        extraSpins +
        delta;

    svg.style.transition =
        "transform 5s cubic-bezier(0.12, 0.76, 0.15, 1)";

    svg.style.transform =
        `rotate(${wheelRotation}deg)`;

    /* =========================
       PO ZATRZYMANIU KOŁA
       ========================= */

    setTimeout(
        async () => {

            if (
                currentSessionId === null
            ) {
                if (status) {
                    status.textContent =
                        "BRAK AKTYWNEJ RUNDY";
                }

                isSpinning =
                    false;

                spinButton.disabled =
                    false;

                spinButton.textContent =
                    "ZAKRĘĆ — 5 000 BP";

                return;
            }

            /* =========================
               ZAPIS WYNIKU
               ========================= */

            try {

                const response =
                    await fetch(
                        `/api/games/wheel/${currentSessionId}/finish`,
                        {
                            method:
                                "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify({
                                    rewardName:
                                        winningReward.name,

                                    rewardType:
                                        winningReward.type,

                                    rewardValue:
                                        winningReward.value,

                                    rewardText:
                                        winningReward.text
                                })
                        }
                    );

                const data =
                    await response.json();

                if (!response.ok) {

                    console.error(
                        "Błąd zapisu Wheel:",
                        data
                    );

                    if (status) {
                        status.textContent =
                            `WYLOSOWANO: ${winningReward.name} — BŁĄD ZAPISU`;
                    }

                    isSpinning =
                        false;

                    spinButton.disabled =
                        false;

                    spinButton.textContent =
                        "ZAKRĘĆ — 5 000 BP";

                    return;
                }

                currentSessionId =
                    null;

                /* =========================
                   POKAŻ WYNIK
                   ========================= */

                showResult(
                    wheelPage,
                    winningReward
                );

                if (winningReward.type === "steal_bp") {
                    setupSteal(wheelPage, data.sessionId);
                }

                if (status) {
                    status.textContent =
                        `Wynik: ${winningReward.name}`;
                }

            } catch (error) {

                console.error(error);

                if (status) {
                    status.textContent =
                        `WYLOSOWANO: ${winningReward.name} — BŁĄD POŁĄCZENIA Z BAZĄ`;
                }

                /*
                    NIE zerujemy currentSessionId,
                    bo wynik nie został zapisany.
                */
            }

            isSpinning =
                false;

            spinButton.disabled =
                false;

            spinButton.textContent =
                "ZAKRĘĆ — 5 000 BP";
        },
        5000
    );
}

function normalizeAngle(
    angle: number
): number {

    return (
        (
            angle %
            360
        ) +
        360
    ) %
    360;
}

/* ========================================
   RESULT
   ======================================== */

function showResult(
    wheelPage: HTMLElement,
    reward: Reward
): void {

    const overlay =
        wheelPage.querySelector<HTMLElement>(
            ".spin-result-overlay"
        );

    const resultReward =
        wheelPage.querySelector<HTMLElement>(
            ".spin-result-reward"
        );

    const resultChance =
        wheelPage.querySelector<HTMLElement>(
            ".spin-result-chance"
        );

    if (
        !overlay ||
        !resultReward ||
        !resultChance
    ) {
        return;
    }

    const stealPanel = wheelPage.querySelector<HTMLElement>(
        ".spin-steal-panel"
    );

    if (stealPanel) {
        stealPanel.hidden = true;
    }

    resultReward.textContent =
        reward.text;
    
    if (reward.type === "challenge") {
        if (reward.name === "Timeout dla widza") {
            overlay.dataset.challengeTarget = "viewer";
        } else if (reward.name === "Timeout dla streamera") {
            overlay.dataset.challengeTarget = "streamer";
        }
    } else {
        delete overlay.dataset.challengeTarget;
    }

    resultChance.textContent =
        `Szansa na trafienie: ${
            reward.chance
        }%`;

    overlay.classList.add(
        "show"
    );
}

function setupSteal(
    wheelPage: HTMLElement,
    sessionId: number
): void {
    const panel = wheelPage.querySelector<HTMLElement>(
        ".spin-steal-panel"
    );

    const message = wheelPage.querySelector<HTMLElement>(
        ".spin-steal-message"
    );

    const drawButton = wheelPage.querySelector<HTMLButtonElement>(
        ".spin-steal-draw"
    );

    const executeButton = wheelPage.querySelector<HTMLButtonElement>(
        ".spin-steal-execute"
    );

    if (
        !panel ||
        !message ||
        !drawButton ||
        !executeButton
    ) {
        return;
    }

    let victimId: number | null = null;
    let completed = false;

    panel.hidden = false;
    message.textContent = "Kto straci 10 000 BP? 🍌";

    drawButton.hidden = false;
    drawButton.disabled = false;

    executeButton.hidden = true;
    executeButton.disabled = false;

    drawButton.onclick = async () => {
        drawButton.disabled = true;
        message.textContent = "Losowanie ofiary...";

        try {
            const response = await fetch(
                `/api/games/wheel/${sessionId}/steal/draw`,
                {
                    method: "POST"
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error ?? "Nie udało się wylosować gracza"
                );
            }

            victimId = data.victim.id;

            message.textContent =
                `Wylosowano: ${data.victim.displayName}! ` +
                `Saldo: ${data.victim.balance.toLocaleString("pl-PL")} BP.`;

            drawButton.hidden = true;
            executeButton.hidden = false;

        } catch (error) {
            message.textContent =
                error instanceof Error
                    ? error.message
                    : "Błąd losowania";

            drawButton.disabled = false;
        }
    };

    executeButton.onclick = async () => {
        if (victimId === null || completed) {
            return;
        }

        executeButton.disabled = true;
        message.textContent = "Przenoszenie 10 000 BP...";

        try {
            const response = await fetch(
                `/api/games/wheel/${sessionId}/steal/execute`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        victimId
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error ?? "Nie udało się wykonać kradzieży"
                );
            }

            completed = true;

            message.textContent =
                `UKRADZIONO 10 000 BP! 🍌 ` +
                `${data.victimName} stracił punkty, ` +
                `a zwycięzca je otrzymał.`;

            executeButton.hidden = true;

            // Jeśli masz funkcję odświeżającą panel gracza
            // i ranking, wywołaj ją tutaj.

        } catch (error) {
            message.textContent =
                error instanceof Error
                    ? error.message
                    : "Błąd kradzieży";

            executeButton.disabled = false;
        }
    };
}