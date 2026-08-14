import "./Background.css";

export function Background(): HTMLElement {
    const background = document.createElement("div");

    background.className = "background";

    function createParticle() {
        const particle = document.createElement("div");

        particle.className = "particle";

        // LOSOWA POZYCJA STARTOWA
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;

        // LOSOWY KIERUNEK
        const angle = Math.random() * Math.PI * 2;

        // LOSOWA ODLEGŁOŚĆ
        const distance = 1000 + Math.random() * 1000;

        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance;

        particle.style.setProperty("--move-x", `${x}px`);
        particle.style.setProperty("--move-y", `${y}px`);

        // LOSOWA PRĘDKOŚĆ
        const duration = 3 + Math.random() * 3;
        particle.style.animationDuration = `${duration}s`;

        // LOSOWY ROZMIAR
        const size = 10 + Math.random() * 5;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;

        // LOSOWY KOLOR
        if (Math.random() > 0.5) {
            particle.classList.add("green");
        } else {
            particle.classList.add("purple");
        }

        // KULKA KOŃCZY LOT → TWORZYMY NOWĄ
        particle.addEventListener("animationend", () => {
            particle.remove();
            createParticle();
        });

        background.appendChild(particle);
    }

    // Tworzymy pierwsze 60 kulek
    for (let i = 0; i < 60; i++) {
        createParticle();
    }

    return background;
}