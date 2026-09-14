import "./Admin.css";

type AdminHistoryRow = {
    transaction_id: number;

    player_id: number;

    twitch_name: string;
    display_name: string;

    amount: number;
    transaction_type: string;
    description: string | null;
    created_at: string;

    current_balance: number;

    game_session_id: number | null;
    game_type: string | null;

    reward_name: string | null;
    reward_type: string | null;
    reward_value: number | null;
    reward_text: string | null;
};

type FilterType =
    | "all"
    | "wheel"
    | "plinko"
    | "thimblerig"
    | "manual"
    | "other";

let historyRows: AdminHistoryRow[] = [];

export function Admin(
    onBack: () => void
): HTMLElement {

    const page =
        document.createElement("main");

    page.className =
        "admin-page";

    page.innerHTML = `
        <section class="admin-header">

            <div>
                <div class="admin-kicker">
                    BANANA GAMES
                </div>

                <h1>
                    ADMIN
                </h1>

                <p>
                    Historia zmian Banana Points i wyników gier
                </p>
            </div>

            <button class="admin-refresh-button">
                ODŚWIEŻ
            </button>

        </section>

        <section class="admin-stats">

            <div class="admin-stat-card">

                <span>
                    TRANSAKCJE
                </span>

                <strong class="admin-stat-transactions">
                    -
                </strong>

            </div>

            <div class="admin-stat-card">

                <span>
                    WHEEL SPINY
                </span>

                <strong class="admin-stat-wheel">
                    -
                </strong>

            </div>

            <div class="admin-stat-card">

                <span>
                    BP WYDANE
                </span>

                <strong class="admin-stat-spent">
                    -
                </strong>

            </div>

            <div class="admin-stat-card">

                <span>
                    BP DODANE
                </span>

                <strong class="admin-stat-added">
                    -
                </strong>

            </div>

        </section>

        <section class="admin-controls">

            <div class="admin-control-group">

                <label>
                    SZUKAJ GRACZA
                </label>

                <input
                    class="admin-search-input"
                    type="text"
                    placeholder="np. B4Nork"
                >

            </div>

            <div class="admin-control-group">

                <label>
                    TYP
                </label>

                <select class="admin-filter-select">

                    <option value="all">
                        WSZYSTKIE
                    </option>

                    <option value="wheel">
                        WHEEL
                    </option>

                    <option value="plinko">
                        PLINKO
                    </option>

                    <option value="thimblerig">
                        THIMBLERIG
                    </option>

                    <option value="manual">
                        RĘCZNE
                    </option>

                    <option value="other">
                        INNE
                    </option>

                </select>

            </div>

        </section>

        <section class="admin-history">

            <div class="admin-history-header">

                <h2>
                    HISTORIA BP
                </h2>

                <div class="admin-history-count">
                    0 wpisów
                </div>

            </div>

            <div class="admin-table-wrapper">

                <table class="admin-table">

                    <thead>

                        <tr>
                            <th>DATA</th>
                            <th>GRACZ</th>
                            <th>ZMIANA</th>
                            <th>SALDO</th>
                            <th>TYP</th>
                            <th>OPIS / NAGRODA</th>
                        </tr>

                    </thead>

                    <tbody class="admin-table-body">

                        <tr>
                            <td
                                colspan="6"
                                class="admin-loading"
                            >
                                Ładowanie historii...
                            </td>
                        </tr>

                    </tbody>

                </table>

            </div>

        </section>
    `;

    const backButton =
        document.createElement("button");

    backButton.className =
        "back-button";

    backButton.textContent =
        "← WRÓĆ";

    backButton.addEventListener(
        "click",
        onBack
    );

    page.appendChild(
        backButton
    );

    const refreshButton =
        page.querySelector<HTMLButtonElement>(
            ".admin-refresh-button"
        )!;

    const searchInput =
        page.querySelector<HTMLInputElement>(
            ".admin-search-input"
        )!;

    const filterSelect =
        page.querySelector<HTMLSelectElement>(
            ".admin-filter-select"
        )!;

    refreshButton.addEventListener(
        "click",
        async () => {
            await loadHistory(page);
        }
    );

    searchInput.addEventListener(
        "input",
        () => {
            renderHistory(page);
        }
    );

    filterSelect.addEventListener(
        "change",
        () => {
            renderHistory(page);
        }
    );

    loadHistory(page);

    return page;
}

/* ========================================
   LOAD
   ======================================== */

async function loadHistory(
    page: HTMLElement
): Promise<void> {

    const tableBody =
        page.querySelector<HTMLElement>(
            ".admin-table-body"
        )!;

    tableBody.innerHTML = `
        <tr>
            <td
                colspan="6"
                class="admin-loading"
            >
                Ładowanie historii...
            </td>
        </tr>
    `;

    try {

        const response =
            await fetch(
                "/api/admin/history"
            );

        const data =
            await response.json();

        if (!response.ok) {
            throw new Error(
                data.error ??
                "Nie udało się pobrać historii"
            );
        }

        historyRows =
            data as AdminHistoryRow[];

        renderStats(page);
        renderHistory(page);

    } catch (error) {

        console.error(error);

        tableBody.innerHTML = `
            <tr>
                <td
                    colspan="6"
                    class="admin-error"
                >
                    Błąd pobierania historii
                </td>
            </tr>
        `;
    }
}

/* ========================================
   FILTER
   ======================================== */

function getFilteredRows(
    page: HTMLElement
): AdminHistoryRow[] {

    const searchInput =
        page.querySelector<HTMLInputElement>(
            ".admin-search-input"
        )!;

    const filterSelect =
        page.querySelector<HTMLSelectElement>(
            ".admin-filter-select"
        )!;

    const query =
        searchInput.value
            .trim()
            .toLowerCase();

    const filter = filterSelect.value as FilterType;

    return historyRows.filter(
        (row) => {

            const matchesSearch =
                query === "" ||
                row.twitch_name
                    .toLowerCase()
                    .includes(query) ||
                row.display_name
                    .toLowerCase()
                    .includes(query);

            if (!matchesSearch) {
                return false;
            }

            if (
                filter === "all"
            ) {
                return true;
            }

            if (
                filter === "wheel"
            ) {
                return (
                    row.transaction_type ===
                    "wheel_spin"
                );
            }

            if (
                filter === "plinko"
            ) {
                return row.transaction_type
                    .startsWith("plinko");
            }

            if (
                filter === "thimblerig"
            ) {
                return row.transaction_type
                    .startsWith("thimblerig");
            }

            if (
                filter === "manual"
            ) {
                return (
                    row.transaction_type ===
                    "manual_add" ||
                    row.transaction_type ===
                    "manual_remove" ||
                    row.transaction_type ===
                    "starting_balance"
                );
            }

            if (
                filter === "other"
            ) {
                return (
                    row.transaction_type !==
                    "wheel_spin" &&
                    !row.transaction_type
                        .startsWith("plinko") &&
                    !row.transaction_type
                        .startsWith("thimblerig") &&
                    row.transaction_type !==
                    "manual_add" &&
                    row.transaction_type !==
                    "manual_remove" &&
                    row.transaction_type !==
                    "starting_balance"
                );
            }

            return true;
        }
    );
}

/* ========================================
   RENDER HISTORY
   ======================================== */

function renderHistory(
    page: HTMLElement
): void {

    const tableBody =
        page.querySelector<HTMLElement>(
            ".admin-table-body"
        )!;

    const historyCount =
        page.querySelector<HTMLElement>(
            ".admin-history-count"
        )!;

    const rows =
        getFilteredRows(page);

    historyCount.textContent =
        `${rows.length} wpisów`;

    if (
        rows.length === 0
    ) {
        tableBody.innerHTML = `
            <tr>
                <td
                    colspan="6"
                    class="admin-empty"
                >
                    Brak pasujących wpisów
                </td>
            </tr>
        `;

        return;
    }

    tableBody.innerHTML =
        "";

    for (
        const row
        of rows
    ) {

        const tr =
            document.createElement(
                "tr"
            );

        if (
            row.transaction_type ===
            "wheel_spin"
        ) {
            tr.classList.add(
                "admin-row-wheel"
            );
        }

        const amountClass =
            row.amount > 0
                ? "positive"
                : row.amount < 0
                    ? "negative"
                    : "neutral";

        const rewardHtml =
            getRewardHtml(row);

        tr.innerHTML = `
            <td class="admin-date-cell">
                ${formatDate(row.created_at)}
            </td>

            <td>
                <div class="admin-player">

                    <strong>
                        ${escapeHtml(row.display_name)}
                    </strong>

                    <span>
                        @${escapeHtml(row.twitch_name)}
                    </span>

                </div>
            </td>

            <td>
                <span
                    class="admin-amount ${amountClass}"
                >
                    ${formatAmount(row.amount)}
                </span>
            </td>

            <td>
                <span class="admin-balance">
                    ${formatBP(row.current_balance)} BP
                </span>
            </td>

            <td>
                ${getTypeBadge(row)}
            </td>

            <td>
                ${rewardHtml}
            </td>
        `;

        tableBody.appendChild(
            tr
        );
    }
}

/* ========================================
   REWARD / DESCRIPTION
   ======================================== */

function getRewardHtml(
    row: AdminHistoryRow
): string {

    if (
        row.transaction_type ===
        "wheel_spin"
    ) {

        if (
            row.reward_name
        ) {

            const valueLine =
                row.reward_value !== null
                    ? `
                        <div class="admin-reward-value">
                            ${formatBP(row.reward_value)} BP
                        </div>
                    `
                    : "";

            const textLine =
                row.reward_text
                    ? `
                        <div class="admin-reward-text">
                            ${escapeHtml(row.reward_text)}
                        </div>
                    `
                    : "";

            return `
                <div class="admin-wheel-result">

                    <div class="admin-wheel-cost">
                        🎡 SPIN
                        <span>
                            -5 000 BP
                        </span>
                    </div>

                    <div class="admin-wheel-win">

                        <span class="admin-wheel-win-label">
                            WYGRAŁ:
                        </span>

                        <strong>
                            ${escapeHtml(row.reward_name)}
                        </strong>

                        ${valueLine}

                        ${textLine}

                    </div>

                </div>
            `;
        }

        return `
            <div class="admin-wheel-result">

                <div class="admin-wheel-cost">
                    🎡 SPIN
                    <span>
                        -5 000 BP
                    </span>
                </div>

                <div class="admin-wheel-pending">
                    Brak zapisanego wyniku
                </div>

            </div>
        `;
    }

    return `
        <div class="admin-description">
            ${
                escapeHtml(
                    row.description ??
                    "-"
                )
            }
        </div>
    `;
}

/* ========================================
   TYPE BADGE
   ======================================== */

function getTypeBadge(
    row: AdminHistoryRow
): string {

    const type =
        row.transaction_type;

    if (
        type === "wheel_spin"
    ) {
        return `
            <span class="admin-type-badge admin-type-wheel">
                WHEEL
            </span>
        `;
    }

    if (
        type.startsWith("plinko")
    ) {
        return `
            <span class="admin-type-badge plinko">
                PLINKO
            </span>
        `;
    }

    if (
        type.startsWith("thimblerig")
    ) {
        return `
            <span class="admin-type-badge thimblerig">
                THIMBLERIG
            </span>
        `;
    }

    if (
        type === "starting_balance"
    ) {
        return `
            <span class="admin-type-badge starting">
                START
            </span>
        `;
    }

    if (
        type.includes("manual")
    ) {
        return `
            <span class="admin-type-badge manual">
                RĘCZNE
            </span>
        `;
    }

    return `
        <span class="admin-type-badge other">
            ${escapeHtml(type)}
        </span>
    `;
}

/* ========================================
   STATS
   ======================================== */

function renderStats(
    page: HTMLElement
): void {

    const transactionElement =
        page.querySelector<HTMLElement>(
            ".admin-stat-transactions"
        )!;

    const wheelElement =
        page.querySelector<HTMLElement>(
            ".admin-stat-wheel"
        )!;

    const spentElement =
        page.querySelector<HTMLElement>(
            ".admin-stat-spent"
        )!;

    const addedElement =
        page.querySelector<HTMLElement>(
            ".admin-stat-added"
        )!;

    const transactionCount =
        historyRows.length;

    const wheelCount =
        historyRows.filter(
            (row) =>
                row.transaction_type ===
                "wheel_spin"
        ).length;

    const spent =
        historyRows
            .filter(
                (row) =>
                    row.amount < 0
            )
            .reduce(
                (sum, row) =>
                    sum +
                    Math.abs(row.amount),
                0
            );

    const added =
        historyRows
            .filter(
                (row) =>
                    row.amount > 0
            )
            .reduce(
                (sum, row) =>
                    sum +
                    row.amount,
                0
            );

    transactionElement.textContent =
        transactionCount.toLocaleString(
            "pl-PL"
        );

    wheelElement.textContent =
        wheelCount.toLocaleString(
            "pl-PL"
        );

    spentElement.textContent =
        `${formatBP(spent)} BP`;

    addedElement.textContent =
        `${formatBP(added)} BP`;
}

/* ========================================
   FORMAT
   ======================================== */

function formatBP(
    value: number
): string {

    return value.toLocaleString(
        "pl-PL"
    );
}

function formatAmount(
    value: number
): string {

    const prefix =
        value > 0
            ? "+"
            : "";

    return `${prefix}${formatBP(value)} BP`;
}

function formatDate(
    value: string
): string {

    const date =
        new Date(
            value.replace(
                " ",
                "T"
            ) + "Z"
        );

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return value;
    }

    return date.toLocaleString(
        "pl-PL",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",

            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
        }
    );
}

function escapeHtml(
    value: string
): string {

    return value
        .replaceAll(
            "&",
            "&amp;"
        )
        .replaceAll(
            "<",
            "&lt;"
        )
        .replaceAll(
            ">",
            "&gt;"
        )
        .replaceAll(
            '"',
            "&quot;"
        )
        .replaceAll(
            "'",
            "&#039;"
        );
}