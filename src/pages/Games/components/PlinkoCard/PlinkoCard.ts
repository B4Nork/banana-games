import "./PlinkoCard.css";

export function PlinkoCard(): HTMLElement {
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

    return card;
}