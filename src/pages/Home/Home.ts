import "./Home.css";
import { Background } from "../../components/Background/Background";
import { SidePanel } from "../../components/SidePanel/SidePanel";

export function Home(): HTMLElement {
    const home = document.createElement("main");

    home.className = "home";

    home.innerHTML = `
        <div class="home-content">
            <h1>BANANA GAMES</h1>

            <p>Nie pytaj po co to istnieje.</p>

            <button>ZACZNIJ</button>
        </div>
    `;

    home.appendChild(Background());
    
    home.appendChild(
        SidePanel({
            side: "left",
            gif: "/gif/PeanutButterDancing.gif"
        })
    );

    home.appendChild(
        SidePanel({
            side: "right",
            gif: "/gif/PeanutButterDancing.gif"
        })
    );

    return home;
}