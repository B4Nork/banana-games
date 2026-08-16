import "./WheelCard.css";

export function WheelCard(): HTMLElement {
    const card = document.createElement("div");

    card.className = "wheel-card";

    card.innerHTML = `
        <div class="wheel">

            <div class="wheel-segment segment-1"></div>
            <div class="wheel-segment segment-2"></div>
            <div class="wheel-segment segment-3"></div>
            <div class="wheel-segment segment-4"></div>
            <div class="wheel-segment segment-5"></div>
            <div class="wheel-segment segment-6"></div>

            <div class="wheel-center">🍌</div>
        </div>

        <h2 class="wheel-title">KOŁO</h2>
    `;

    return card;
}