import "./SidePanel.css";

interface SidePanelOptions {
    side: "left" | "right";
    gif: string;
}

export function SidePanel({ side, gif }: SidePanelOptions): HTMLElement {
    const panel = document.createElement("div");

    panel.className = `side-panel ${side}`;

    panel.innerHTML = `
        <img
            class="side-panel-gif"
            src="${gif}"
            alt="Banana"
        >
    `;

    return panel;
}