import "./StartButton.css";

export function StartButton(): HTMLElement {
    const button = document.createElement("button");

    button.className = "start-button";
    button.textContent = "ZACZNIJ";

    return button;
}