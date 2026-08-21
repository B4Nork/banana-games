import "./Wheel.css";
import { createBananas } from "../../utils/createBananas";


let rewardContainer: HTMLElement;
let rewardTotal: HTMLElement;

interface Reward {
    name: string;
    chance: number;
    color: string;
}

const rewards: Reward[] = [
    {
        name: "100 PUNKTÓW",
        chance: 50,
        color: getRandomColor()
    },
    {
        name: "VIP",
        chance: 25,
        color: getRandomColor()
    },
    {
        name: "BAN",
        chance: 20,
        color: getRandomColor()
    },
    {
        name: "???",
        chance: 5,
        color: getRandomColor()
    }
];


export function Wheel(onBack: () => void): HTMLElement {
    const wheelPage = document.createElement("main");
    

    wheelPage.className = "wheel-page";

    wheelPage.innerHTML = `
        <h1 class="wheel-page-title">KOŁO FORTUNY</h1>

        <div class="wheel-content">

            <section class="wheel-section">

                <div class="wheel-placeholder">
                    <span>KOŁO</span>
                </div>

                <button class="spin-button">
                    ZAKRĘĆ
                </button>

            </section>

            <section class="rewards-panel">

                <h2>NAGRODY</h2>

                <div class="reward-container"></div>

                <button class="add-reward-button">
                    + DODAJ NAGRODĘ
                </button>

                <div class="reward-total"></div>

            </section>

        </div>
    `;

    rewardContainer =
        wheelPage.querySelector<HTMLDivElement>(".reward-container")!;

    rewardTotal =
        wheelPage.querySelector<HTMLDivElement>(".reward-total")!;

    const wheelElement =
        wheelPage.querySelector<HTMLElement>(".wheel-placeholder");

    if (!rewardContainer || !rewardTotal || !wheelElement) {
        throw new Error("Nie znaleziono elementów koła lub panelu nagród");
    }

    updateRewards(wheelElement);
    updateWheel(wheelElement);

    const addRewardButton =
        wheelPage.querySelector<HTMLButtonElement>(".add-reward-button");

    if (!addRewardButton) {
        throw new Error("Nie znaleziono przycisku dodawania nagrody");
    }

    addRewardButton.addEventListener("click", () => {
        rewards.push({
            name: "NOWA NAGRODA",
            chance: 0,
            color: getRandomColor()
        });

        updateRewards(wheelElement);
        updateWheel(wheelElement);
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

    wheelPage.appendChild(backButton);

    return wheelPage;
}

function getTotalChance(): number {
    return rewards.reduce(
        (total, reward) => total + reward.chance,
        0
    );
}

function getRandomColor(): string {
    const hue = Math.floor(Math.random() * 360);

    return `hsl(${hue}, 60%, 40%)`;
}

function createWheelGradient(): string {
    let currentAngle = 0;

    const segments: string[] = [];

    rewards.forEach((reward) => {
        const angle = (reward.chance / 100) * 360;

        const startAngle = currentAngle;
        const endAngle = currentAngle + angle;

        segments.push(
            `${reward.color} ${startAngle}deg ${endAngle}deg`
        );

        currentAngle = endAngle;
    });

    return `conic-gradient(${segments.join(", ")})`;
}

function updateWheel(wheel: HTMLElement): void {
    wheel.style.background = createWheelGradient();
}

function createRewardList(wheelElement: HTMLElement): HTMLElement {
    const list = document.createElement("div");

    list.className = "reward-list";

    rewards.forEach((reward, index) => {
        const row = document.createElement("div");

        row.className = "reward-row";

        row.innerHTML = `
            <input
                class="reward-name-input"
                type="text"
                value="${reward.name}"
            >

            <input
                class="reward-chance-input"
                type="number"
                min="0"
                max="100"
                value="${reward.chance}"
            >

            <button class="remove-reward-button">
                ×
            </button>
        `;

        const nameInput =
            row.querySelector<HTMLInputElement>(".reward-name-input");

        const chanceInput =
            row.querySelector<HTMLInputElement>(".reward-chance-input");

        const removeButton =
            row.querySelector<HTMLButtonElement>(".remove-reward-button");

        if (!nameInput || !chanceInput || !removeButton) {
            throw new Error("Nie znaleziono elementów nagrody");
        }

        nameInput.addEventListener("input", () => {
            reward.name = nameInput.value;
        });

        chanceInput.addEventListener("input", () => {
            reward.chance = Number(chanceInput.value);

            updateRewardTotal();
            updateWheel(wheelElement);
        });

        removeButton.addEventListener("click", () => {
            rewards.splice(index, 1);

            updateRewards(wheelElement);
            updateWheel(wheelElement);
        });

        list.appendChild(row);
    });

    return list;
}

function updateRewardTotal(): void {
    rewardTotal.textContent =
        `SUMA: ${getTotalChance()}%`;
}

function updateRewards(wheelElement: HTMLElement): void {
    rewardContainer.innerHTML = "";

    rewardContainer.appendChild(
        createRewardList(wheelElement)
    );

    updateRewardTotal();
}