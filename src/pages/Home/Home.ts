import "./Home.css";
import { Background } from "../../components/Background/Background";
import { SidePanel } from "../../components/SidePanel/SidePanel";
import { Logo } from "../../components/Logo/Logo";

export function Home(): HTMLElement {
    const home = document.createElement("main");

    home.className = "home";

    

    home.innerHTML = `
        <div class="home-content">
            
            <p>Nie pytaj po co to istnieje.</p>

            <button>ZACZNIJ</button>
        </div>
    `;

    home.appendChild(Logo());
    
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