import "./Wheel.css";

export function Wheel(): HTMLElement {
    const wheel = document.createElement("main");

    wheel.className = "wheel-page";

    wheel.innerHTML = `
        <h1>KOŁO FORTUNY</h1>
    `;

    return wheel;
}