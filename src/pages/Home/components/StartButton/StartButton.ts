import "./StartButton.css";

export function StartButton(onStart: () => void): HTMLElement {
    const button = document.createElement("button");

    button.className = "start-button";
    button.textContent = "ZACZNIJ";

    button.addEventListener("click", () => {
        createBananas();

        setTimeout(() => {
            onStart();
        }, 1500);
    });

    return button;
}

function createBananas(): void {
    for (let i = 0; i < 1200; i++) {
        const banana = document.createElement("div");

        banana.className = "falling-banana";
        banana.textContent = "🍌";

        banana.style.left = `${Math.random() * 100}%`;
        banana.style.animationDelay = `${Math.random() * 1.5}s`;
        banana.style.animationDuration = `${1 + Math.random() * 2}s`;

        document.body.appendChild(banana);

        banana.addEventListener("animationend", () => {
            banana.remove();
        });
    }
}