import "./Plinko.css";
import { createBananas } from "../../utils/createBananas";

export function Plinko(onBack: () => void): HTMLElement {
    const plinkoPage = document.createElement("main");

    plinkoPage.className = "plinko-page";

    plinkoPage.innerHTML = `
        <h1 class="plinko-page-title">PLINKO</h1>

        <div class="plinko-content">

            <section class="plinko-section">

                <div class="plinko-board">
                    <canvas class="plinko-canvas"></canvas>
                </div>

                <div class="plinko-controls">

                    <div class="ball-count">
                        <span>KULKI</span>

                        <input
                            class="ball-count-input"
                            type="number"
                            min="1"
                            max="25"
                            value="1"
                        >
                    </div>

                    <button class="drop-button">
                        PUŚĆ KULKI
                    </button>

                </div>

            </section>

            <aside class="plinko-result">

                <h2>WYNIK</h2>

                <div class="current-multiplier">
                    ×0
                </div>

                <div class="current-points">
                    0 PKT
                </div>

            </aside>

        </div>
    `;

    const board =
        plinkoPage.querySelector<HTMLElement>(".plinko-board");

    const canvas =
        plinkoPage.querySelector<HTMLCanvasElement>(".plinko-canvas");

    const dropButton =
        plinkoPage.querySelector<HTMLButtonElement>(".drop-button");

    if (!board || !canvas || !dropButton) {
        throw new Error("Nie znaleziono elementów Plinko");
    }

    drawBoard(canvas);

    dropButton.addEventListener("click", () => {
        console.log("PUŚĆ KULKI");
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

    plinkoPage.appendChild(backButton);

    return plinkoPage;
}

function drawBoard(canvas: HTMLCanvasElement): void {
    const width = 700;
    const height = 800;

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");

    if (!ctx) {
        return;
    }

    ctx.clearRect(0, 0, width, height);

    const rows = 8;

    const spacingX = 70;
    const spacingY = 70;

    const startY = 130;

    for (let row = 0; row < rows; row++) {
        const pegCount = row + 1;

        const rowWidth = (pegCount - 1) * spacingX;

        const startX =
            width / 2 - rowWidth / 2;

        for (let col = 0; col < pegCount; col++) {
            const x =
                startX + col * spacingX;

            const y =
                startY + row * spacingY;

            drawPeg(ctx, x, y);
        }
    }

    drawBottomSlots(ctx, width, height);
}

function drawPeg(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number
): void {
    ctx.beginPath();

    ctx.arc(
        x,
        y,
        8,
        0,
        Math.PI * 2
    );

    ctx.fillStyle = "#888";
    ctx.fill();

    ctx.strokeStyle = "#111";
    ctx.lineWidth = 2;
    ctx.stroke();
}

function drawBottomSlots(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
): void {
    const slotCount = 9;
    const slotWidth = 70;
    const slotHeight = 80;

    const totalWidth =
        slotCount * slotWidth;

    const startX =
        (width - totalWidth) / 2;

    const y =
        height - slotHeight;

    for (let i = 0; i < slotCount; i++) {
        const x =
            startX + i * slotWidth;

        ctx.strokeStyle = "#888";
        ctx.lineWidth = 3;

        ctx.strokeRect(
            x,
            y,
            slotWidth,
            slotHeight
        );

        ctx.fillStyle = "#111";

        ctx.fillRect(
            x,
            y,
            slotWidth,
            slotHeight
        );
    }
}