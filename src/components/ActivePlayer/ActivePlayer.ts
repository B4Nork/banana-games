import "./ActivePlayer.css";

import {
    getActivePlayer,
    setActivePlayer
} from "../../state/activePlayer";

type PlayerResponse = {
    player: {
        id: number;
        twitch_name: string;
        display_name: string;
    };
    balance: number;
    rank: number;
};

export function ActivePlayerPanel(): HTMLElement {
    const panel = document.createElement("div");

    panel.className = "active-player-panel";

    function render(): void {
        const player = getActivePlayer();

        if (!player) {
            panel.innerHTML = `
                <div class="active-player-empty">

                    <span>
                        BRAK GRACZA
                    </span>

                    <button class="active-player-select">
                        WYBIERZ GRACZA
                    </button>

                </div>
            `;

            const selectButton =
                panel.querySelector<HTMLButtonElement>(
                    ".active-player-select"
                )!;

            selectButton.addEventListener(
                "click",
                showPlayerSearch
            );

            return;
        }

        panel.innerHTML = `
            <div class="active-player-info">

                <div class="active-player-label">
                    AKTYWNY GRACZ
                </div>

                <div class="active-player-name">
                    ${player.displayName}
                </div>

                <div class="active-player-stats">

                    <span>
                        #${player.rank}
                    </span>

                    <strong>
                        ${player.balance.toLocaleString("pl-PL")} BP
                    </strong>

                </div>

            </div>

            <button class="active-player-select">
                ZMIEŃ GRACZA
            </button>
        `;

        const selectButton =
            panel.querySelector<HTMLButtonElement>(
                ".active-player-select"
            )!;

        selectButton.addEventListener(
            "click",
            showPlayerSearch
        );
    }

    function showPlayerSearch(): void {
        panel.innerHTML = `
            <div class="active-player-search">

                <div class="active-player-label">
                    WYBIERZ GRACZA
                </div>

                <input
                    class="active-player-search-input"
                    type="text"
                    placeholder="Nick Twitch"
                />

                <button class="active-player-search-button">
                    WYBIERZ
                </button>

                <button class="active-player-cancel">
                    ANULUJ
                </button>

                <div class="active-player-message"></div>

            </div>
        `;

        const input =
            panel.querySelector<HTMLInputElement>(
                ".active-player-search-input"
            )!;

        const searchButton =
            panel.querySelector<HTMLButtonElement>(
                ".active-player-search-button"
            )!;

        const cancelButton =
            panel.querySelector<HTMLButtonElement>(
                ".active-player-cancel"
            )!;

        const message =
            panel.querySelector<HTMLElement>(
                ".active-player-message"
            )!;

        async function selectPlayer(): Promise<void> {
            const name = input.value.trim();

            if (!name) {
                message.textContent =
                    "Wpisz nick gracza";

                return;
            }

            searchButton.disabled = true;
            message.textContent = "Szukam...";

            try {
                const response = await fetch(
                    `/api/players/${encodeURIComponent(name)}`
                );

                if (!response.ok) {
                    message.textContent =
                        "Nie znaleziono gracza";

                    return;
                }

                const data =
                    await response.json() as PlayerResponse;

                setActivePlayer({
                    id: data.player.id,
                    twitchName:
                        data.player.twitch_name,
                    displayName:
                        data.player.display_name,
                    balance:
                        data.balance,
                    rank:
                        data.rank
                });

                render();

            } catch (error) {
                console.error(error);

                message.textContent =
                    "Błąd połączenia z API";

            } finally {
                searchButton.disabled = false;
            }
        }

        searchButton.addEventListener(
            "click",
            selectPlayer
        );

        cancelButton.addEventListener(
            "click",
            render
        );

        input.addEventListener(
            "keydown",
            event => {
                if (event.key === "Enter") {
                    selectPlayer();
                }
            }
        );

        input.focus();
    }

    render();

    return panel;
}