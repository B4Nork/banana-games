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
        300, // szerokość
        10, // wysokiść
        9, // promień
        {
            restitution: 0.9,
            friction: 0
        }
    );

    const pins = createPins(
        11, // liczba rzędów: 4 → 14
        4, // pierwszy rząd ma 4 kołki
        300, // środek planszy
        100, // wysokość pierwszego rzędu
        45, // odstęp poziomy
        45 // odstęp pionowy
    );

    let firstCollision = true;

    Matter.Events.on(engine, "collisionStart", (event) => {

        for (const pair of event.pairs) {

            const hitPin =
                pins.includes(pair.bodyA) ||
                pins.includes(pair.bodyB);

            const isBallAndPin =
                (pair.bodyA === ball || pair.bodyB === ball) &&
                hitPin;

            if (!isBallAndPin || !firstCollision) {
                continue;
            }

            firstCollision = false;

            const randomOffset =
                (Math.random() * 2 - 1) * 0.5;

            Matter.Body.setVelocity(ball, {
                x: randomOffset,
                y: ball.velocity.y
            });
        }
    });

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
        ground,
        ... pins
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

function createPin(x: number, y: number): Matter.Body {
    return Matter.Bodies.circle(
        x,
        y,
        7,
        {
            isStatic: true,
            restitution: 0.9,
            friction: 0
        }
    );
}

function createPins(
    rows: number,
    firstRowPins: number,
    centerX: number,
    startY: number,
    horizontalSpacing: number,
    verticalSpacing: number
): Matter.Body[] {

    const pins: Matter.Body[] = [];

    for (let row = 0; row < rows; row++) {

        const pinsInRow = firstRowPins + row;

        const rowWidth =
            (pinsInRow - 1) * horizontalSpacing;

        const startX =
            centerX - rowWidth / 2;

        for (let column = 0; column < pinsInRow; column++) {

            const x =
                startX + column * horizontalSpacing;

            const y =
                startY + row * verticalSpacing;

            pins.push(
                createPin(x, y)
            );
        }
    }

    return pins;
}