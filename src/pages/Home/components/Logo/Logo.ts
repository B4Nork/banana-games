import "./Logo.css";

export function Logo(): HTMLElement {
    const logo = document.createElement("div");

    logo.className = "logo";

    logo.innerHTML = `
        <div class="logo-line banana">BANANA</div>
        <div class="logo-line games">GAMES</div>
    `;

    return logo;
}