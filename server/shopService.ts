import { db } from "./database.ts";
import { getBalance, removeBP } from "./playerService.ts";

export type ShopProduct = {
    id: number;
    name: string;
    description: string;
    price: number;
    available: number;
};

export type ShopPurchase = {
    id: number;
    player_id: number;
    product_id: number;
    product_name: string;
    price: number;
    created_at: string;
};

const initialProducts = [
    {
        id: 1,
        name: "Podpis na profilu Steam",
        description: "",
        price: 500000
    },
    {
        id: 2,
        name: "Wybierz grę na stream",
        description: "Wybierz, jaką grę mam ograć na streamie.",
        price: 100000000
    },
    {
        id: 3,
        name: "Challenge dla streamera",
        description: "Daj challenge w jakiejś grze.",
        price: 150000000
    },
    {
        id: 4,
        name: "Gotowanie z Norkiem",
        description: "Stream z kuchni.",
        price: 50000000
    },
    {
        id: 5,
        name: "Mam przebiec półmaraton",
        description: "",
        price: 10000000
    },
    {
        id: 6,
        name: "VIP",
        description:
            "Streamer może odebrać VIP-a, jeśli widz jest nieaktywny lub z innego powodu.",
        price: 100000000
    },
    {
        id: 7,
        name: "50 Pompeczek",
        description:
            "Strimer Robi 50 pompeczek",
        price: 100000
    }
];

const insertProduct = db.prepare(`
    INSERT INTO shop_products (
        id,
        name,
        description,
        price
    )
    VALUES (?, ?, ?, ?)

    ON CONFLICT(id) DO UPDATE SET
        name = excluded.name,
        description = excluded.description,
        price = excluded.price
`);

const seedProducts = db.transaction(() => {
    for (const product of initialProducts) {
        insertProduct.run(
            product.id,
            product.name,
            product.description,
            product.price
        );
    }
});

seedProducts();

export function getShopProducts(): ShopProduct[] {
    return db.prepare(`
        SELECT *
        FROM shop_products
        WHERE available = 1
        ORDER BY price ASC, id ASC
    `).all() as ShopProduct[];
}

export function purchaseProduct(
    playerId: number,
    productId: number
): {
    purchase: ShopPurchase;
    balance: number;
} {
    const transaction = db.transaction(() => {
        const product = db.prepare(`
            SELECT *
            FROM shop_products
            WHERE id = ?
              AND available = 1
        `).get(productId) as ShopProduct | undefined;

        if (!product) {
            throw new Error(
                "Produkt nie istnieje lub jest niedostępny"
            );
        }

        const balance = getBalance(playerId);

        if (balance < product.price) {
            throw new Error(
                "Nie masz wystarczającej liczby BP"
            );
        }

        const newBalance = removeBP(
            playerId,
            product.price,
            "shop_purchase",
            `Sklep: ${product.name}`
        );

        const result = db.prepare(`
            INSERT INTO shop_purchases (
                player_id,
                product_id,
                product_name,
                price
            )
            VALUES (?, ?, ?, ?)
        `).run(
            playerId,
            product.id,
            product.name,
            product.price
        );

        const purchase = db.prepare(`
            SELECT *
            FROM shop_purchases
            WHERE id = ?
        `).get(result.lastInsertRowid) as ShopPurchase;

        return {
            purchase,
            balance: newBalance
        };
    });

    return transaction();
}

export function getShopPurchases(): ShopPurchase[] {
    return db.prepare(`
        SELECT *
        FROM shop_purchases
        ORDER BY id DESC
        LIMIT 100
    `).all() as ShopPurchase[];
}