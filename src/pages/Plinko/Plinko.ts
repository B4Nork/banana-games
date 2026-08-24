import "./Plinko.css";
import Matter from "matter-js"

import { createBananas } from "../../utils/createBananas";

export function Plinko(onBack: () => void): HTMLElement {
    const plinkoPage = document.createElement("main");

    plinkoPage.className = "plinko-page";

    const physicsContainer = document.createElement("div");

    physicsContainer.className = "plinko-physics";

    plinkoPage.appendChild(physicsContainer);

    const engine = Matter.Engine.create();

    engine.gravity.y = 1;

    const ball = Matter.Bodies.circle(
        300,
        100,
        25
    );

    const pin = Matter.Bodies.circle(
        300,
        350,
        15,
        {
            isStatic: true,
            restitution: 1
        }
    );

    const ground = Matter.Bodies.rectangle(
        300,
        600,
        600,
        40,
        {
            isStatic: true
        }
    );

    Matter.Composite.add(engine.world, [
        ball,
        pin,
        ground
    ]);

    const render = Matter.Render.create({
        element: physicsContainer,
        engine: engine,
        options: {
            width: 600,
            height: 600,
            wireframes: false,
            background: "#111"
        }
    });

    Matter.Render.run(render);

    const runner = Matter.Runner.create();

    Matter.Runner.run(runner, engine);

    const backButton = document.createElement("button");

    backButton.className = "back-button";
    backButton.textContent = "← WRÓĆ DO GIER";

    backButton.addEventListener("click", () => {
        createBananas();

        setTimeout(() => {
            onBack();
        }, 1400);
    });

    plinkoPage.appendChild(backButton);

    return plinkoPage;
}