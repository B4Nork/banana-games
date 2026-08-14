import "./Home.css";

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

    return home;
}