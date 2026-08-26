import "./ThimblerigCard.css";

export function ThimblerigCard(onClick: () => void): HTMLElement {
    const card = document.createElement("div");

    card.className = "thimblerig-card";

    card.innerHTML = `
        <div class="thimblerig-board">

            <div class="thimblerig-ball"></div>

            <div class="thimblerig-cup cup-1"></div>
            <div class="thimblerig-cup cup-2"></div>
            <div class="thimblerig-cup cup-3"></div>

        </div>

        <h2 class="thimblerig-title">KUBECZKI</h2>
    `;

    card.addEventListener("click", () => {
        onClick();
    });

    return card;
}