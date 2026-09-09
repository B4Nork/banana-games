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

                <button class="players-add-button">
                    DODAJ GRACZA
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

    const addButton =
        page.querySelector<HTMLButtonElement>(
            ".players-add-button"
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

    async function openPlayerProfile(
        playerName: string
    ): Promise<void> {
        try {
            const response = await fetch(
                `/api/players/${encodeURIComponent(playerName)}`
            );

            if (!response.ok) {
                result.innerHTML = `
                    <div class="player-error">
                        Nie udało się pobrać gracza
                    </div>
                `;

                return;
            }

            const data =
                await response.json() as PlayerResponse;

            result.innerHTML = `
                <div class="player-profile">

                    <button class="player-profile-close">
                        ← WRÓĆ DO LISTY
                    </button>

                    <h2>
                        ${data.player.display_name}
                    </h2>

                    <div class="player-profile-info">
                    s
                        <div>
                            <span>ID</span>
                            <strong>
                                ${data.player.id}
                            </strong>
                        </div>

                        <div>
                            <span>TWITCH</span>
                            <strong>
                                ${data.player.twitch_name}
                            </strong>
                        </div>

                        <div>
                            <span>BP</span>
                            <strong class="player-profile-balance">
                                ${data.balance.toLocaleString("pl-PL")} BP
                            </strong>
                        </div>

                    </div>

                    <div class="player-bp-controls">

                        <input
                            class="player-bp-input"
                            type="number"
                            min="1"
                            step="1"
                            placeholder="Ilość BP"
                        />

                        <button class="player-bp-add">
                            + DODAJ BP
                        </button>

                        <button class="player-bp-remove">
                            - ODEJMIJ BP
                        </button>

                    </div>

                    <div class="player-bp-message"></div>

                </div>
            `;

            playersList.style.display = "none";

            const closeButton =
                result.querySelector<HTMLButtonElement>(
                    ".player-profile-close"
                )!;
            
            const bpInput =
                result.querySelector<HTMLInputElement>(
                    ".player-bp-input"
            )!;

            const addBPButton =
                result.querySelector<HTMLButtonElement>(
                    ".player-bp-add"
                )!;

            const removeBPButton =
                result.querySelector<HTMLButtonElement>(
                    ".player-bp-remove"
                )!;

            const balanceElement =
                result.querySelector<HTMLElement>(
                    ".player-profile-balance"
                )!;

            const bpMessage =
                result.querySelector<HTMLElement>(
                    ".player-bp-message"
                )!;

            closeButton.addEventListener(
                "click",
                () => {
                    result.innerHTML = "";
                    playersList.style.display = "";
                }
            );

            async function changePlayerBP(
                type: "add" | "remove"
            ): Promise<void> {
                const amount =
                    Number(bpInput.value);

                if (
                    !Number.isInteger(amount) ||
                    amount <= 0
                ) {
                    bpMessage.textContent =
                        "Wpisz poprawną liczbę BP";

                    return;
                }

                try {
                    const response = await fetch(
                        `/api/players/${data.player.id}/bp/${type}`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type": "application/json"
                            },

                            body: JSON.stringify({
                                amount,
                                transactionType:
                                    type === "add"
                                        ? "manual_add"
                                        : "manual_remove",

                                description:
                                    type === "add"
                                        ? "Ręczne dodanie BP"
                                        : "Ręczne odjęcie BP"
                            })
                        }
                    );

                    const responseData =
                        await response.json();

                    if (!response.ok) {
                        bpMessage.textContent =
                            responseData.error ??
                            "Nie udało się zmienić BP";

                        return;
                    }

                    balanceElement.textContent =
                        `${responseData.balance.toLocaleString("pl-PL")} BP`;

                    bpMessage.textContent =
                        type === "add"
                            ? `Dodano ${amount.toLocaleString("pl-PL")} BP`
                            : `Odjęto ${amount.toLocaleString("pl-PL")} BP`;

                    bpInput.value = "";

                    await loadPlayers();

                } catch (error) {
                    console.error(error);

                    bpMessage.textContent =
                        "Błąd połączenia z API";
                }
            }

            addBPButton.addEventListener(
                "click",
                () => {
                    changePlayerBP("add");
                }
            );

            removeBPButton.addEventListener(
                "click",
                () => {
                    changePlayerBP("remove");
                }
            );

        } catch (error) {
            console.error(error);

            result.innerHTML = `
                <div class="player-error">
                    Błąd połączenia z API
                </div>
            `;
        }
    }

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

            const rows =
                playersList.querySelectorAll<HTMLElement>(
                    ".players-table-row"
                );

            rows.forEach(row => {
                row.addEventListener(
                    "click",
                    () => {
                        const playerName =
                            row.dataset.player;

                        if (!playerName) {
                            return;
                        }

                        openPlayerProfile(playerName);
                    }
                );
            });

        } catch (error) {
            console.error(error);

            playersList.innerHTML =
                "Błąd połączenia z API.";
        }
    }

    async function addPlayer(): Promise<void> {
        const displayName =
            input.value.trim();

        if (!displayName) {
            result.innerHTML = `
                <div class="player-error">
                    Wpisz nick gracza
                </div>
            `;

            return;
        }

        result.innerHTML =
            "Dodaję gracza...";

        try {
            const response = await fetch(
                "/api/players",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        displayName
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                result.innerHTML = `
                    <div class="player-error">
                        ${data.error ?? "Nie udało się dodać gracza"}
                    </div>
                `;

                return;
            }

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

            input.value = "";

            await loadPlayers();

        } catch (error) {
            console.error(error);

            result.innerHTML = `
                <div class="player-error">
                    Błąd połączenia z API
                </div>
            `;
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

    addButton.addEventListener(
        "click",
        addPlayer
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