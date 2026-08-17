import "./RandomCard.css";

export function RandomCard(): HTMLElement {
    const card = document.createElement("div");

    card.className = "random-card";

    card.innerHTML = `
        <div class="random-symbol">
        <div class="dice">
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
        </div>
    </div>

        <h2 class="random-title">LOSOWE</h2>
    `;

    return card;
}