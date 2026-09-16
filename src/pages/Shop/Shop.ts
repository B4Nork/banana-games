import "./Shop.css";

import { Background } from "../../components/Background/Background";
import { ActivePlayerPanel } from "../../components/ActivePlayer/ActivePlayer";
import { createBananas } from "../../utils/createBananas";

import {
    getActivePlayer,
    setActivePlayer
} from "../../state/activePlayer";

type ShopProduct = {
    id: number;
    name: string;
    description: string;
    price: number;
    available: number;
};

type ProductsResponse = {
    products: ShopProduct[];
};

type PurchaseResponse = {
    purchase: {
        id: number;
        product_name: string;
        price: number;
    };
    balance: number;
    rank: number;
};

const productIcons: Record<string, string> = {
    "Podpis na profilu Steam": "✍️",
    "Wybierz grę na stream": "🎮",
    "Challenge dla streamera": "🎯",
    "Gotowanie z Norkiem": "👨‍🍳",
    "Mam przebiec półmaraton": "🏃",
    "VIP": "👑",
    "50 Pompeczek": "🏋️",
};

function formatBP(amount: number): string {
    return amount.toLocaleString("pl-PL") + " BP";
}

export function Shop(onBack: () => void): HTMLElement {
    const page = document.createElement("main");
    page.className = "shop-page";

    page.appendChild(Background());

    const backButton = document.createElement("button");

    backButton.className = "back-button";
    backButton.textContent = "← WRÓĆ DO GIER";

    backButton.addEventListener("click", () => {
        createBananas();

        setTimeout(() => {
            onBack();
        }, 1400);
    });

    page.appendChild(backButton);
    page.appendChild(ActivePlayerPanel());

    const content = document.createElement("section");
    content.className = "shop-content";

    const title = document.createElement("h1");
    title.className = "shop-title";
    title.textContent = "🍌 BANANA SHOP";

    const subtitle = document.createElement("p");
    subtitle.className = "shop-subtitle";
    subtitle.textContent =
        "Wydaj Banana Points i uprzykrz życie Norkowi!";

    const message = document.createElement("div");
    message.className = "shop-message";
    message.setAttribute("role", "status");
    message.setAttribute("aria-live", "polite");

    const grid = document.createElement("div");
    grid.className = "shop-grid";

    content.append(
        title,
        subtitle,
        message,
        grid
    );

    page.appendChild(content);

    function showMessage(
        text: string,
        type: "success" | "error" | "info"
    ): void {
        message.textContent = text;
        message.className = `shop-message ${type}`;
    }

    async function purchase(
        product: ShopProduct,
        button: HTMLButtonElement
    ): Promise<void> {
        const player = getActivePlayer();

        if (!player) {
            showMessage(
                "Najpierw wybierz gracza!",
                "error"
            );
            return;
        }

        if (player.balance < product.price) {
            showMessage(
                "Nie masz wystarczającej liczby BP!",
                "error"
            );
            return;
        }

        const confirmed = window.confirm(
            `Kupić "${product.name}" za ${formatBP(product.price)}?`
        );

        if (!confirmed) {
            return;
        }

        button.disabled = true;
        button.textContent = "KUPOWANIE...";

        try {
            const response = await fetch(
                "/api/shop/purchase",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        playerId: player.id,
                        productId: product.id
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error ?? "Nie udało się kupić produktu"
                );
            }

            const result = data as PurchaseResponse;

            const currentPlayer = getActivePlayer();

            if (
                currentPlayer &&
                currentPlayer.id === player.id
            ) {
                setActivePlayer({
                    ...currentPlayer,
                    balance: result.balance,
                    rank: result.rank
                });
            }

            showMessage(
                `Kupiono: ${result.purchase.product_name}!`,
                "success"
            );

        } catch (error) {
            showMessage(
                error instanceof Error
                    ? error.message
                    : "Błąd połączenia z serwerem",
                "error"
            );

        } finally {
            button.disabled = false;
            button.textContent = "KUP";
        }
    }

    function renderProduct(product: ShopProduct): HTMLElement {
        const card = document.createElement("article");
        card.className = "shop-card";

        const icon = document.createElement("div");
        icon.className = "shop-card-icon";
        icon.textContent =
            productIcons[product.name] ?? "🍌";

        const name = document.createElement("h2");
        name.className = "shop-card-name";
        name.textContent = product.name;

        const description = document.createElement("p");
        description.className = "shop-card-description";
        description.textContent =
            product.description || "Nagroda Banana Shop";

        const price = document.createElement("div");
        price.className = "shop-card-price";
        price.textContent = formatBP(product.price);

        const button = document.createElement("button");
        button.className = "shop-buy";
        button.textContent = "KUP";

        button.addEventListener("click", () => {
            void purchase(product, button);
        });

        card.append(
            icon,
            name,
            description,
            price,
            button
        );

        return card;
    }

    async function loadProducts(): Promise<void> {
        grid.textContent = "Ładowanie produktów...";

        try {
            const response = await fetch(
                "/api/shop/products"
            );

            if (!response.ok) {
                throw new Error(
                    "Nie udało się pobrać produktów"
                );
            }

            const data =
                await response.json() as ProductsResponse;

            grid.replaceChildren();

            if (data.products.length === 0) {
                grid.textContent =
                    "Sklep jest obecnie pusty.";
                return;
            }

            for (const product of data.products) {
                grid.appendChild(
                    renderProduct(product)
                );
            }

        } catch (error) {
            grid.textContent =
                error instanceof Error
                    ? error.message
                    : "Błąd połączenia z API";
        }
    }

    void loadProducts();

    return page;
}