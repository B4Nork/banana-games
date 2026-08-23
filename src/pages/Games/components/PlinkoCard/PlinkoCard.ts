import "./PlinkoCard.css";

export function PlinkoCard(onClick: () => void): HTMLElement {
    const card = document.createElement("div");

    card.className = "plinko-card";

    card.innerHTML = `
        <div class="plinko-board">

            <div class="plinko-pins">
                <span></span>
                <span></span>

                <span></span>
                <span></span>
                <span></span>

                <span></span>
                <span></span>
                <span></span>
                <span></span>
            </div>

            <div class="plinko-ball"></div>

            <div class="plinko-slots">
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
            </div>

        </div>

        <h2 class="plinko-title">PLINKO</h2>
    `;

    card.addEventListener("click", () => {
        createPlinkoTransition(onClick);
    });

    return card;
}

function createPlinkoTransition(onComplete: () => void): void {
    

    const transition = document.createElement("div");

    transition.className = "plinko-transition";

    transition.innerHTML = `
        <div class="transition-board">
            <div class="transition-pins">
                ${Array.from({ length: 6 }, (_, index) => `
                    <span class="pin-${index + 1}"></span>
                `).join("")}
            </div>
            <div class="transition-ball"></div>
        </div>

        
    `;

    document.body.appendChild(transition);

    requestAnimationFrame(() => {
        transition.classList.add("show");
    });

    // Kulka startuje po 1 sekundzie
    setTimeout(() => {
        animateBall();
    }, 1000);

    // W połowie animacji zmieniamy stronę
    setTimeout(() => {
        onComplete();
    }, 3500);

    // Pod koniec zamykamy planszę
    setTimeout(() => {
        const board =
            transition.querySelector<HTMLElement>(".transition-board");

        board?.classList.add("close");
    }, 4000);

    // Kończymy przejście po zakończeniu kulki
    setTimeout(() => {
        transition.classList.add("hide");

        setTimeout(() => {
            transition.remove();
        }, 300);
    }, 5000);
    
    

}

function animateBall(): void {
    const ball =
        document.querySelector<HTMLElement>(".transition-ball");

    const board =
        document.querySelector<HTMLElement>(".transition-board");

    if (!ball || !board) {
        return;
    }

    const duration = 3000;

    const points = [
        { x: 500, y: 0.05 },
        { x: 435, y: 0.27 },
        { x: 25, y: 0.60 },
        { x: 130, y: 0.73 },
        { x: 25, y: 1.00 }
    ];

    const boardWidth = board.clientWidth;
    const boardHeight = board.clientHeight;

    const convertedPoints = points.map((point) => ({
        x: point.x < 1
            ? boardWidth * point.x
            : point.x,

        y: point.y * boardHeight
    }));

    const distances = [0];
    let totalDistance = 0;

    for (let i = 1; i < convertedPoints.length; i++) {
        const previous = convertedPoints[i - 1];
        const current = convertedPoints[i];

        const dx = current.x - previous.x;
        const dy = current.y - previous.y;

        const distance = Math.sqrt(
            dx * dx + dy * dy
        );

        totalDistance += distance;
        distances.push(totalDistance);
    }

    const keyframes = convertedPoints.map((point, index) => ({
        left: `${point.x}px`,
        top: `${point.y}px`,
        offset: distances[index] / totalDistance
    }));

    ball.animate(
        keyframes,
        {
            duration,
            easing: "linear",
            fill: "forwards"
        }
    );
}