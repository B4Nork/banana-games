import "./Home.css";
import { Background } from "../../components/Background/Background";
import { SidePanel } from "../../components/SidePanel/SidePanel";
import { Logo } from "./components/Logo/Logo";
import { StartButton } from "./components/StartButton/StartButton";

export function Home(onStart: () => void): HTMLElement {
    const home = document.createElement("main");

    home.className = "home";
    
    home.appendChild(Background());
    
    home.appendChild(Logo());

    home.appendChild(StartButton(onStart));

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