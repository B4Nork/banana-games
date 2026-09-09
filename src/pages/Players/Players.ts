import "./Players.css";

type PlayerResponse = {
    player: {
        id: number;
        twitch_name: string;
        display_name: string;
    };
    balance: number;
    rank: number;
};

type PlayerListItem = {
    id: number;
    twitch_name: string;
    display_name: string;
    bp: number;
    created_at: string;
    rank: number;
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
        <div class="players-layout">

            <section class="ranking-section">

                <div class="ranking-header">
                    <div>
                        <div class="ranking-eyebrow">
                            BANANA GAMES
                        </div>

                        <h1>
                            BANANA RANKING
                        </h1>

                        <p>
                            Najbogatsi posiadacze Banana Points
                        </p>
                    </div>
                </div>

                <div class="ranking-podium">
                    <div class="podium-slot podium-second"></div>

                    <div class="podium-slot podium-first"></div>

                    <div class="podium-slot podium-third"></div>
                </div>

                <div class="ranking-list">
                    Ładowanie rankingu...
                </div>

            </section>

            <aside class="player-side-panel">

                <div class="player-panel-header">
                    <div>
                        <div class="player-panel-eyebrow">
                            PANEL
                        </div>

                        <h2>
                            GRACZ
                        </h2>
                    </div>
                </div>

                <div class="player-search-box">

                    <input
                        class="players-search-input"
                        type="text"
                        placeholder="Nick Twitch"
                    />

                    <button class="players-search-button">
                        SZUKAJ
                    </button>

                </div>

                <div class="player-panel-content">

                    <div class="player-panel-empty">
                        Wyszukaj gracza albo wybierz go z rankingu
                    </div>

                </div>

                <button class="players-add-button">
                    + DODAJ GRACZA
                </button>

            </aside>

            <button class="players-back">
                ← WRÓĆ DO GIER
            </button>

        </div>

        <div class="add-player-modal hidden">

            <div class="add-player-modal-card">

                <button class="add-player-close">
                    ×
                </button>

                <div class="modal-eyebrow">
                    BANANA GAMES
                </div>

                <h2>
                    DODAJ GRACZA
                </h2>

                <label>
                    Nick Twitch

                    <input
                        class="add-player-name"
                        type="text"
                        placeholder="np. B4Nork"
                    />
                </label>

                <label>
                    Początkowe BP

                    <input
                        class="add-player-bp"
                        type="number"
                        min="0"
                        step="1"
                        value="0"
                    />
                </label>

                <div class="add-player-message"></div>

                <div class="add-player-actions">

                    <button class="add-player-cancel">
                        ANULUJ
                    </button>

                    <button class="add-player-confirm">
                        DODAJ
                    </button>

                </div>

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

    const rankingPodium =
        page.querySelector<HTMLElement>(
            ".ranking-podium"
        )!;

    const rankingList =
        page.querySelector<HTMLElement>(
            ".ranking-list"
        )!;

    const playerPanelContent =
        page.querySelector<HTMLElement>(
            ".player-panel-content"
        )!;

    const addPlayerModal =
        page.querySelector<HTMLElement>(
            ".add-player-modal"
        )!;

    const addPlayerName =
        page.querySelector<HTMLInputElement>(
            ".add-player-name"
        )!;

    const addPlayerBP =
        page.querySelector<HTMLInputElement>(
            ".add-player-bp"
        )!;

    const addPlayerClose =
        page.querySelector<HTMLButtonElement>(
            ".add-player-close"
        )!;

    const addPlayerCancel =
        page.querySelector<HTMLButtonElement>(
            ".add-player-cancel"
        )!;

    const addPlayerConfirm =
        page.querySelector<HTMLButtonElement>(
            ".add-player-confirm"
        )!;

    const addPlayerMessage =
        page.querySelector<HTMLElement>(
            ".add-player-message"
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
                playerPanelContent.innerHTML = `
                    <div class="player-error">
                        Nie udało się pobrać gracza
                    </div>
                `;

                return;
            }

            const data =
                await response.json() as PlayerResponse;

            playerPanelContent.innerHTML = `
                <div class="player-profile">

                    <div class="player-profile-top">

                        <div>
                            <div class="player-profile-rank">
                                #${data.rank} W RANKINGU
                            </div>

                            <div class="player-profile-name">
                                ${data.player.display_name}
                            </div>

                            <div class="player-profile-twitch">
                                @${data.player.twitch_name}
                            </div>
                        </div>

                    </div>

                    <div class="player-profile-balance-box">

                        <div class="balance-label">
                            BANANA POINTS
                        </div>

                        <div class="player-profile-balance">
                            ${data.balance.toLocaleString("pl-PL")} BP
                        </div>

                    </div>

                    <div class="player-bp-edit">

                        <label>
                            Zmień saldo
                        </label>

                        <input
                            class="player-bp-input"
                            type="number"
                            min="1"
                            step="1"
                            placeholder="Ilość BP"
                        />

                        <div class="player-bp-buttons">

                            <button class="player-bp-add">
                                + DODAJ
                            </button>

                            <button class="player-bp-remove">
                                − ODEJMIJ
                            </button>

                        </div>

                        <div class="player-bp-message"></div>

                    </div>

                </div>
            `;
            
            const bpInput =
                playerPanelContent.querySelector<HTMLInputElement>(
                    ".player-bp-input"
            )!;

            const addBPButton =
                playerPanelContent.querySelector<HTMLButtonElement>(
                    ".player-bp-add"
                )!;

            const removeBPButton =
                playerPanelContent.querySelector<HTMLButtonElement>(
                    ".player-bp-remove"
                )!;

            const balanceElement =
                playerPanelContent.querySelector<HTMLElement>(
                    ".player-profile-balance"
                )!;

            const bpMessage =
                playerPanelContent.querySelector<HTMLElement>(
                    ".player-bp-message"
                )!;


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
                    await openPlayerProfile(
                        data.player.twitch_name
                    );

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

            playerPanelContent.innerHTML = `
                <div class="player-error">
                    Błąd połączenia z API
                </div>
            `;
        }
    }

    async function loadPlayers(): Promise<void> {
        try {
            const response = await fetch("/api/players");

            if (!response.ok) {
                rankingPodium.innerHTML =
                    "Nie udało się pobrać rankingu.";

                rankingList.innerHTML = "";

                return;
            }

            const data =
                await response.json() as PlayersResponse;

            if (data.players.length === 0) {
                rankingPodium.innerHTML =
                    "Brak graczy w rankingu.";

                rankingList.innerHTML = "";

                return;
            }

            const podiumPlayers =
                data.players.slice(0, 3);

            const listPlayers =
                data.players.slice(3);

            const first =
                podiumPlayers.find(
                    player => player.rank === 1
                );

            const second =
                podiumPlayers.find(
                    player => player.rank === 2
                );

            const third =
                podiumPlayers.find(
                    player => player.rank === 3
                );

            function podiumHTML(
                player: PlayerListItem | undefined,
                position: number
            ): string {
                if (!player) {
                    return "";
                }

                return `
                    <button
                        class="podium-player podium-player-${position}"
                        data-player="${player.twitch_name}"
                    >
                        <div class="podium-position">
                            #${position}
                        </div>

                        <div class="podium-name">
                            ${player.display_name}
                        </div>

                        <div class="podium-bp">
                            ${player.bp.toLocaleString("pl-PL")} BP
                        </div>
                    </button>
                `;
            }

            rankingPodium.innerHTML = `
                <div class="podium-slot podium-second">
                    ${podiumHTML(second, 2)}
                </div>

                <div class="podium-slot podium-first">
                    ${podiumHTML(first, 1)}
                </div>

                <div class="podium-slot podium-third">
                    ${podiumHTML(third, 3)}
                </div>
            `;

            rankingList.innerHTML =
                listPlayers
                    .map(player => `
                        <button
                            class="ranking-row"
                            data-player="${player.twitch_name}"
                        >
                            <div class="ranking-position">
                                #${player.rank}
                            </div>

                            <div class="ranking-player-name">
                                ${player.display_name}
                            </div>

                            <div class="ranking-player-bp">
                                ${player.bp.toLocaleString("pl-PL")} BP
                            </div>
                        </button>
                    `)
                    .join("");

            const rankingPlayers =
                page.querySelectorAll<HTMLElement>(
                    "[data-player]"
                );

            rankingPlayers.forEach(
                playerElement => {
                    playerElement.addEventListener(
                        "click",
                        () => {
                            const playerName =
                                playerElement.dataset.player;

                            if (!playerName) {
                                return;
                            }

                            openPlayerProfile(
                                playerName
                            );
                        }
                    );
                }
            );

        } catch (error) {
            console.error(error);

            rankingPodium.innerHTML =
                "Błąd połączenia z API.";

            rankingList.innerHTML = "";
        }
    }

    async function searchPlayer(): Promise<void> {
        const name =
            input.value.trim();

        if (!name) {
            return;
        }

        playerPanelContent.innerHTML =
            "Szukam gracza...";

        await openPlayerProfile(name);
    }

    function openAddPlayerModal(): void {
        addPlayerName.value = "";
        addPlayerBP.value = "0";
        addPlayerMessage.textContent = "";

        addPlayerModal.classList.remove(
            "hidden"
        );

        addPlayerName.focus();
    }

    function closeAddPlayerModal(): void {
        addPlayerModal.classList.add(
            "hidden"
        );
    }

    searchButton.addEventListener(
        "click",
        searchPlayer
    );

    addButton.addEventListener(
        "click",
        openAddPlayerModal
    );

    addPlayerClose.addEventListener(
        "click",
        closeAddPlayerModal
    );

    addPlayerCancel.addEventListener(
        "click",
        closeAddPlayerModal
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