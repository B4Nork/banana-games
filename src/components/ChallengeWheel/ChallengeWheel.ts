import "./ChallengeWheel.css";

type ChallengeTarget = "viewer" | "streamer";

interface Challenge {
    name: string;
    description: string;
    color: string;
    isPaint?: boolean;
}

const challenges: Challenge[] = [
    {
        name: "SAPER",
        description: "Ukończ poziom średni.",
        color: "#7c3aed"
    },
    {
        name: "SNAKE",
        description: "Zdobądź 25 punktów.",
        color: "#16a34a"
    },
    {
        name: "TETRIS",
        description: "Zdobądź 8 000 punktów.",
        color: "#dc2626"
    },
    {
        name: "FLAPPY BIRD",
        description: "Pokonaj 25 rur w jednej próbie.",
        color: "#2563eb"
    },
    {
        name: "DINOZAUR",
        description: "Zdobądź 1000 punktów w Chrome Dino.",
        color: "#ea580c"
    },
    {
        name: "2048",
        description: "Stwórz kafelek 512.",
        color: "#0891b2"
    },
    {
        name: "PAINT",
        description: "Narysuj wylosowany temat.",
        color: "#db2777",
        isPaint: true
    }
];

const paintTopics = [
    "Banan na siłowni",
    "Garfield i lazania",
    "Ziemniak na wakacjach",
    "Shrek w kosmosie",
    "Geralt pracujący w McDonald's",
    "Shrek grający w League of Legends",
    "Twój najgorszy koszmar z gry",
    "Banan jadący na jednorożcu",
    "Geralt z bananami zamiast mieczy",
    "Shrek jako trener piłkarski",
    "Pikachu z wielkim wąsem",
    "Spongbob sprzedający towar Myszce Miki",
    "Tom łapie Jerrego",
    "Steve z Minecrafta kopiący diamenty",
    "Pan Krab liczący pieniądze",
    "Kubuś Puchatek je miodek",
    "Shrek jako papież",
    "Minecraftowy Creeper na randce z TNT",
    "Pingwiny z Madagaskaru",
    "Spiderman pokonuje Batmana",
    "Garfield kradnący pizzę Żółwiom Ninja",
    "Minionek z mieczem świetlnym",
    "Teletubisie mówią papa"
];

const SPIN_DURATION = 5000;

export function openChallengeWheel(
    target: ChallengeTarget,
    onClose: () => void
): void {
    const overlay = document.createElement("div");

    overlay.className = "challenge-overlay";

    overlay.innerHTML = `
        <div class="challenge-modal" role="dialog" aria-modal="true">
            <h2>KOŁO WYZWAŃ</h2>

            <p class="challenge-target"></p>

            <div class="challenge-wheel-wrapper">
                <div class="challenge-pointer"></div>
                <div class="challenge-wheel"></div>
            </div>

            <button class="challenge-spin-button">
                LOSUJ WYZWANIE
            </button>

            <div class="challenge-result" hidden>
                <h3 class="challenge-result-name"></h3>
                <p class="challenge-result-description"></p>

                <div class="challenge-paint" hidden>
                    <button class="challenge-paint-button">
                        LOSUJ TEMAT PAINTA
                    </button>

                    <p class="challenge-paint-topic"></p>
                </div>
            </div>

            <button class="challenge-close-button" disabled>
                ZAMKNIJ
            </button>
        </div>
    `;

    document.body.appendChild(overlay);

    const wheel = overlay.querySelector<HTMLElement>(
        ".challenge-wheel"
    )!;

    const targetLabel = overlay.querySelector<HTMLElement>(
        ".challenge-target"
    )!;

    const spinButton = overlay.querySelector<HTMLButtonElement>(
        ".challenge-spin-button"
    )!;

    const result = overlay.querySelector<HTMLElement>(
        ".challenge-result"
    )!;

    const resultName = overlay.querySelector<HTMLElement>(
        ".challenge-result-name"
    )!;

    const resultDescription = overlay.querySelector<HTMLElement>(
        ".challenge-result-description"
    )!;

    const paintSection = overlay.querySelector<HTMLElement>(
        ".challenge-paint"
    )!;

    const paintButton = overlay.querySelector<HTMLButtonElement>(
        ".challenge-paint-button"
    )!;

    const paintTopic = overlay.querySelector<HTMLElement>(
        ".challenge-paint-topic"
    )!;

    const closeButton = overlay.querySelector<HTMLButtonElement>(
        ".challenge-close-button"
    )!;

    targetLabel.textContent =
        target === "viewer"
            ? "WYZWANIE DLA WIDZA"
            : "WYZWANIE DLA STREAMERA";

    const segmentAngle = 360 / challenges.length;

    const gradient = challenges.map((challenge, index) => {
        const start = index * segmentAngle;
        const end = (index + 1) * segmentAngle;

        return `${challenge.color} ${start}deg ${end}deg`;
    }).join(", ");

    wheel.style.background = `conic-gradient(${gradient})`;

    challenges.forEach((challenge, index) => {
        const label = document.createElement("span");

        label.className = "challenge-wheel-label";
        label.textContent = challenge.name;

        const angle = index * segmentAngle + segmentAngle / 2;

        label.style.transform =
            `translate(-50%, -50%) rotate(${angle}deg) translateY(-125px) rotate(${-angle}deg)`;

        wheel.appendChild(label);
    });

    let spinning = false;
    let rotation = 0;
    let topicSelected = false;

    spinButton.addEventListener("click", () => {
        if (spinning) return;

        spinning = true;
        spinButton.disabled = true;

        const winnerIndex = Math.floor(
            Math.random() * challenges.length
        );

        const winner = challenges[winnerIndex];

        const centerAngle =
            winnerIndex * segmentAngle + segmentAngle / 2;

        const desiredRotation = (360 - centerAngle) % 360;
        const currentRotation = ((rotation % 360) + 360) % 360;

        const delta =
            (desiredRotation - currentRotation + 360) % 360;

        rotation += 360 * 6 + delta;

        wheel.style.transition =
            `transform ${SPIN_DURATION}ms cubic-bezier(0.12, 0.76, 0.15, 1)`;

        wheel.style.transform = `rotate(${rotation}deg)`;

        window.setTimeout(() => {
            result.hidden = false;

            resultName.textContent = winner.name;
            resultDescription.textContent = winner.description;

            paintSection.hidden = !winner.isPaint;

            closeButton.disabled = Boolean(winner.isPaint);

            spinning = false;
        }, SPIN_DURATION);
    });

    paintButton.addEventListener("click", () => {
        if (topicSelected) return;

        topicSelected = true;

        const index = Math.floor(
            Math.random() * paintTopics.length
        );

        paintTopic.textContent = paintTopics[index];

        paintButton.disabled = true;
        closeButton.disabled = false;
    });

    closeButton.addEventListener("click", () => {
        if (spinning || closeButton.disabled) return;

        overlay.remove();
        onClose();
    });
}