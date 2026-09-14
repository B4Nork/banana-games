export type ActivePlayer = {
    id: number;
    twitchName: string;
    displayName: string;
    balance: number;
    rank: number;
};

let activePlayer: ActivePlayer | null = null;

export function setActivePlayer(
    player: ActivePlayer
): void {
    activePlayer = player;
}

export function getActivePlayer(): ActivePlayer | null {
    return activePlayer;
}

export function clearActivePlayer(): void {
    activePlayer = null;
}
