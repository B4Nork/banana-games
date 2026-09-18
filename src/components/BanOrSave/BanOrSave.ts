import "./BanOrSave.css";

type CoinResult = "ban" | "save";

let activeOverlay: HTMLElement | null = null;

export function openBanOrSave(
    onClose?: () => void
): void {
    // Zabezpieczenie przed otwarciem dwóch minigier.
    if (activeOverlay) {
        return;
    }

    const overlay = document.createElement("div");
    overlay.className = "ban-save-overlay";

    overlay.innerHTML = `
        <div class="ban-save-modal">
            <h2 class="ban-save-title">
                BAN CZY SAVE?
            </h2>

            <p class="ban-save-subtitle">
                Czaszka = timeout 10 minut.
                Tarcza = ułaskawienie.
            </p>

            <div class="ban-save-scene">
                <div class="ban-save-coin">
                    <div class="ban-save-face ban-save-front">
                        <span class="ban-save-symbol">☠</span>
                        <span class="ban-save-face-label">BAN</span>
                    </div>

                    <div class="ban-save-face ban-save-back">
                        <span class="ban-save-symbol">🛡</span>
                        <span class="ban-save-face-label">SAVE</span>
                    </div>
                </div>
            </div>

            <div class="ban-save-result" aria-live="polite">
                Los zadecyduje o Twoim losie...
            </div>

            <button
                class="ban-save-flip"
                type="button"
            >
                RZUĆ MONETĄ
            </button>

            <button
                class="ban-save-close"
                type="button"
                hidden
            >
                ZAMKNIJ
            </button>
        </div>
    `;

    document.body.appendChild(overlay);
    activeOverlay = overlay;

    const coin = overlay.querySelector<HTMLElement>(
        ".ban-save-coin"
    )!;

    const resultElement = overlay.querySelector<HTMLElement>(
        ".ban-save-result"
    )!;

    const flipButton = overlay.querySelector<HTMLButtonElement>(
        ".ban-save-flip"
    )!;

    const closeButton = overlay.querySelector<HTMLButtonElement>(
        ".ban-save-close"
    )!;

    let hasFlipped = false;

    flipButton.addEventListener("click", () => {
        if (hasFlipped) {
            return;
        }

        hasFlipped = true;
        flipButton.disabled = true;
        flipButton.hidden = true;

        resultElement.textContent = "MONETA W POWIETRZU...";

        // Losujemy tylko raz. Animacja nie wpływa na wynik.
        const result: CoinResult =
            Math.random() < 0.5 ? "ban" : "save";

        // 6 pełnych obrotów + ewentualne pół obrotu.
        const finalRotation =
            2160 + (result === "save" ? 180 : 0);

        coin.style.transform =
            `rotateY(${finalRotation}deg)`;

        window.setTimeout(() => {
            if (result === "ban") {
                resultElement.textContent =
                    "☠ BAN! TIMEOUT NA 10 MINUT!";

                resultElement.classList.add("is-ban");
            } else {
                resultElement.textContent =
                    "🛡 SAVE! URATOWANY!";

                resultElement.classList.add("is-save");
            }

            closeButton.hidden = false;
        }, 4000);
    });

    closeButton.addEventListener("click", () => {
        overlay.remove();
        activeOverlay = null;
        onClose?.();
    });
}