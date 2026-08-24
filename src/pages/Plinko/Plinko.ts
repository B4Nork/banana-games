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
        350, // szerokość
        30, // wysokiść
        9, // promień
        {
            restitution: 0.9,
            friction: 0
        }
    );

    const pins = createPins(
        12, // liczba rzędów: 4 → 14
        4, // pierwszy rząd ma 4 kołki
        350, // środek planszy
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
        350, // środek postokąta gdzie jest na x
        700, // środek prostokąta gdzie jest na y
        700, // szerokość x
        20, // wysokość y
        {
            isStatic: true
        }
    );

    const leftWallTriangle = createWall(
        150,
        350,
        580,
        -63.5 * Math.PI / 180
    );

    const rightWallTriangle = createWall(
        550,
        350,
        580,
        63.5 * Math.PI / 180
    );

    const leftWall = Matter.Bodies.rectangle(
        0,
        350,
        1,
        700,
        {
            isStatic: true,
            render:{
                visible: false
            }
        }
    );

    const rightWall = Matter.Bodies.rectangle(
        699,
        350,
        15,
        700,
        {
            isStatic: true,
            render:{
                visible: false
            }
        }
    );

    const slotWalls = createSlotWalls();

    Matter.Composite.add(engine.world, [
        ball,
        leftWall,
        rightWall,
        leftWallTriangle ,
        rightWallTriangle,
        ground,
        ... pins,
        ... slotWalls
    ]);

    const render = Matter.Render.create({
        element: physicsContainer,
        engine: engine,
        options: {
            width: 700,
            height: 800,
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

function createWall(
    x: number,
    y: number,
    length: number,
    angle: number
): Matter.Body {

    return Matter.Bodies.rectangle(
        x,
        y,
        length,
        1,
        {
            isStatic: true,
            angle,
            render:{
                visible: false
            }
        }
    );
}

function createSlotWalls(): Matter.Body[] {

    const walls: Matter.Body[] = [];

    const slotWidths = [
        40,
        20,
        60,
        45,
        65,
        35,
        25,
        50,
        20,
        50,
        25,
        35,
        65,
        45,
        60,
        20,
        40,
        0
    ];

    let x = 0;

    for (const width of slotWidths) {

        const wall = Matter.Bodies.rectangle(
            x,
            665,
            2,
            50,
            {
                isStatic: true
            }
        );

        walls.push(wall);

        x += width;
    }

    return walls;
}