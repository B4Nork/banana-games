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
/*
    setTimeout(() => {
        onComplete();

        setTimeout(() => {
            transition.classList.add("hide");

            setTimeout(() => {
                transition.remove();
            }, 300);
        }, 100);
    }, 4100);
*/

// TESTY - nie przechodzimy na stronę Plinko
    // Po 10 sekundach usuwamy animację
    setTimeout(() => {
        transition.remove();
    }, 5000);
}