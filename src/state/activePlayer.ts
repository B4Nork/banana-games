export type ActivePlayer = {
    id: number;
    twitchName: string;
    displayName: string;
    balance: number;
    rank: number;
};

let activePlayer: ActivePlayer | null = null;

const listeners = new Set<() => void>();

function notifyListeners(): void {
    listeners.forEach(listener => listener());
}

export function setActivePlayer(
    player: ActivePlayer
): void {
    activePlayer = player;
    notifyListeners();
}

export function getActivePlayer(): ActivePlayer | null {
    return activePlayer;
}

export function clearActivePlayer(): void {
    activePlayer = null;
    notifyListeners();
}

export function subscribeActivePlayer(
    listener: () => void
): () => void {
    listeners.add(listener);

    return () => {
        listeners.delete(listener);
    };
}