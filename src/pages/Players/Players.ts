import "./Players.css";

type PlayerResponse = {
    player: {
        id: number;
        twitch_name: string;
        display_name: string;
    };
    balance: number;
};

type PlayerListItem = {
    id: number;
    twitch_name: string;
    display_name: string;
    bp: number;
    created_at: string;
};


type PlayersResponse = {
    players: PlayerListItem[];
};

export function Players(
    onBack: () => void
): HTMLElement {
    const page = document.createElement("div");

    page.className = "players-page";

    page.innerHTML = `
        <div class="players-panel">

            <button class="players-back">
                ← WRÓĆ
            </button>

            <h1>GRACZE</h1>

            <div class="players-search">
                <input
                    class="players-search-input"
                    type="text"
                    placeholder="Nick Twitch"
                />

                <button class="players-search-button">
                    SZUKAJ
                </button>
            </div>

            <div class="players-result"></div>

            <div class="players-list">
                Ładowanie graczy...
            </div>

        </div>
    `;

    const backButton =
        page.querySelector<HTMLButtonElement>(
            ".players-back"
        )!;

    const input =
        page.querySelector<HTMLInputElement>(
            ".players-search-input"
        )!;

    const searchButton =
        page.querySelector<HTMLButtonElement>(
            ".players-search-button"
        )!;

    const result =
        page.querySelector<HTMLElement>(
            ".players-result"
        )!;
    
    const playersList =
        page.querySelector<HTMLElement>(
            ".players-list"
        )!;

    backButton.addEventListener(
        "click",
        onBack
    );

    async function loadPlayers(): Promise<void> {
        try {
            const response = await fetch(
                "/api/players"
            );

            if (!response.ok) {
                playersList.innerHTML =
                    "Nie udało się pobrać graczy.";

                return;
            }

            const data =
                await response.json() as PlayersResponse;

            if (data.players.length === 0) {
                playersList.innerHTML =
                    "Brak graczy w bazie.";

                return;
            }

            playersList.innerHTML = `
                <div class="players-table-header">
                    <div>ID</div>
                    <div>GRACZ</div>
                    <div>BP</div>
                </div>

                ${data.players.map(player => `
                    <div
                        class="players-table-row"
                        data-player="${player.twitch_name}"
                    >
                        <div>
                            ${player.id}
                        </div>

                        <div class="table-player-name">
                            ${player.display_name}
                        </div>

                        <div class="table-player-bp">
                            ${player.bp.toLocaleString("pl-PL")} BP
                        </div>
                    </div>
                `).join("")}
            `;
        } catch (error) {
            console.error(error);

            playersList.innerHTML =
                "Błąd połączenia z API.";
        }
    }


    async function searchPlayer(): Promise<void> {
        const name =
            input.value.trim();

        if (!name) {
            return;
        }

        result.innerHTML =
            "Szukam gracza...";

        try {
            const response = await fetch(
                `/api/players/${encodeURIComponent(name)}`
            );

            if (!response.ok) {
                result.innerHTML = `
                    <div class="player-not-found">
                        Nie znaleziono gracza
                    </div>
                `;

                return;
            }

            const data = await response.json() as PlayerResponse;

            result.innerHTML = `
                <div class="player-card">
                    <div class="player-name">
                        ${data.player.display_name}
                    </div>

                    <div class="player-balance">
                        ${data.balance.toLocaleString("pl-PL")} BP
                    </div>

                    <div class="player-id">
                        ID: ${data.player.id}
                    </div>
                </div>
            `;
        } catch (error) {
            console.error(error);

            result.innerHTML = `
                <div class="player-error">
                    Błąd połączenia z API
                </div>
            `;
        }
    }

    searchButton.addEventListener(
        "click",
        searchPlayer
    );

    input.addEventListener(
        "keydown",
        event => {
            if (event.key === "Enter") {
                searchPlayer();
            }
        }
    );

    loadPlayers();

    return page;
}