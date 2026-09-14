import "./Wheel.css";
import { createBananas } from "../../utils/createBananas";
import { ActivePlayerPanel } from "../../components/ActivePlayer/ActivePlayer";

let rewardContainer: HTMLElement;
let rewardTotal: HTMLElement;

let wheelRotation = 0;
let isSpinning = false;

interface Reward {
    name: string;
    chance: number;
    color: string;
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
        name: "Bananowy Łup",
        chance: 0.25,
        color: getWheelColor(0)
    },
    {
        name: "Prezent dla czatu",
        chance: 25,
        color: getWheelColor(1)
    },
    {
        name: "100k BP",
        chance: 3,
        color: getWheelColor(2)
    },
    {
        name: "Ukradnij 10 000 BP",
        chance: 5,
        color: getWheelColor(3)
    },
    {
        name: "Timeout challenge dla widza",
        chance: 15,
        color: getWheelColor(4)
    },
    {
        name: "Jackpot",
        chance: 0.5,
        color: getWheelColor(5)
    },
    {
        name: "Timeout challenge dla streamera",
        chance: 15,
        color: getWheelColor(6)
    },
    {
        name: "Pompki 30",
        chance: 15,
        color: getWheelColor(7)
    },
    {
        name: "Ściana Legend",
        chance: 1,
        color: getWheelColor(8)
    },
    {
        name: "Darmowa gra w banan games",
        chance: 20.25,
        color: getWheelColor(9)
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
                    ZAKRĘĆ
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

    wheelPage.appendChild(
        ActivePlayerPanel()
    );

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
                spinButton
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

    resultClose.addEventListener(
        "click",
        () => {
            resultOverlay.classList.remove(
                "show"
            );
        }
    );

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
                )
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

    let lines =
        splitRewardName(
            reward.name
        );

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

function spinWheel(
    wheel: HTMLElement,
    wheelPage: HTMLElement,
    spinButton: HTMLButtonElement
): void {

    if (
        isSpinning
    ) {
        return;
    }

    const svg =
        wheel.querySelector<SVGSVGElement>(
            ".wheel-svg"
        );

    if (!svg) {
        return;
    }

    const totalChance =
        getTotalChance();

    if (
        Math.abs(
            totalChance -
            100
        ) >
        0.001
    ) {
        const status =
            wheelPage.querySelector<HTMLElement>(
                ".spin-status"
            );

        if (status) {
            status.textContent =
                `Suma musi wynosić 100%. Teraz: ${
                    formatChance(
                        totalChance
                    )
                }%`;
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

    const winningReward =
        getRandomReward();

    const visualWinner =
        visualRewards.find(
            (reward) =>
                reward.name ===
                winningReward.name
        );

    if (
        !visualWinner
    ) {
        return;
    }

    isSpinning =
        true;

    spinButton.disabled =
        true;

    spinButton.textContent =
        "KRĘCĘ...";

    const status =
        wheelPage.querySelector<HTMLElement>(
            ".spin-status"
        );

    if (status) {
        status.textContent =
            "Koło się kręci...";
    }

    /*
        Losujemy punkt WEWNĄTRZ
        wybranego segmentu.

        Dzięki temu koło nie zatrzymuje
        się zawsze dokładnie na środku.
    */

    const segmentSize =
        visualWinner.endAngle -
        visualWinner.startAngle;

    const safeMargin =
        Math.min(
            3,
            segmentSize *
            0.15
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
        normalizeAngle(
            delta
        );

    const extraSpins =
        6 *
        360;

    wheelRotation +=
        extraSpins +
        delta;

    svg.style.transition =
        "transform 5s cubic-bezier(0.12, 0.76, 0.15, 1)";

    svg.style.transform =
        `rotate(${wheelRotation}deg)`;

    setTimeout(
        () => {

            showResult(
                wheelPage,
                winningReward
            );

            isSpinning =
                false;

            spinButton.disabled =
                false;

            spinButton.textContent =
                "ZAKRĘĆ";

            if (status) {
                status.textContent =
                    `Wynik: ${
                        winningReward.name
                    }`;
            }

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

    resultReward.textContent =
        reward.name;

    resultChance.textContent =
        `Szansa na trafienie: ${
            reward.chance
        }%`;

    overlay.classList.add(
        "show"
    );
}