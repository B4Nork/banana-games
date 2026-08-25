import "./Plinko.css";
import Matter from "matter-js"

import { createBananas } from "../../utils/createBananas";

export function Plinko(onBack: () => void): HTMLElement {
    const plinkoPage = document.createElement("main");

    plinkoPage.className = "plinko-page";

    const title = document.createElement("h1");

    title.className = "plinko-game-title";
    title.textContent = "PLINKO";

    plinkoPage.appendChild(title);

    const gameContainer = document.createElement("div");

    gameContainer.className = "plinko-game";

    plinkoPage.appendChild(gameContainer);

    const physicsContainer = document.createElement("div");

    physicsContainer.className = "plinko-physics";

    gameContainer.appendChild(physicsContainer);

    const controls = document.createElement("div");
    controls.className = "plinko-controls";

    const ballsLabel = document.createElement("span");
    ballsLabel.textContent = "LICZBA KULEK";

    const ballsInput = document.createElement("input");
    ballsInput.type = "number";
    ballsInput.min = "1";
    ballsInput.max = "50";
    ballsInput.value = "1";

    const dropButton = document.createElement("button");
    dropButton.textContent = "DROP";

    controls.appendChild(ballsLabel);
    controls.appendChild(ballsInput);
    controls.appendChild(dropButton);

    const result = document.createElement("div");

    result.className = "plinko-result";

    result.innerHTML = `
        <span>WYGRANA</span>
        <strong>1000</strong>
        <small>PKT</small>
    `;

    controls.appendChild(result);

    const resultValue =
        result.querySelector("strong") as HTMLElement;
    
    const progress = document.createElement("div");

    progress.className = "plinko-progress";
    progress.textContent = "KULKI: 0 / 0";

    controls.appendChild(progress);

    gameContainer.appendChild(controls);

    const engine = Matter.Engine.create();

    engine.gravity.y = 1;

    const balls: Matter.Body[] = [];

    const rewardedBalls = new Set<number>();

    const BASE_POINTS = 1000;

    let totalPoints = BASE_POINTS;
    let completedBalls = 0;
    let currentDropCount = 0;

    resultValue.textContent =
        totalPoints.toString();

    const pins = createPins(
        11, // liczba rzędów: 4 → 14
        3, // pierwszy rząd ma 4 kołki
        325, // środek planszy
        100, // wysokość pierwszego rzędu
        45, // odstęp poziomy
        45 // odstęp pionowy
    );

    const firstCollisions = new Set<number>();

    Matter.Events.on(engine, "collisionStart", (event) => {

        for (const pair of event.pairs) {

            const ball = balls.find(
                ball =>
                    ball === pair.bodyA ||
                    ball === pair.bodyB
            );

            if (!ball) {
                continue;
            }

            const hitGround =
                pair.bodyA === ground ||
                pair.bodyB === ground;

            if (hitGround) {

                Matter.Body.setVelocity(ball, {
                    x: ball.velocity.x,
                    y: 0
                });

                continue;
            }

            const hitPin =
                pins.includes(pair.bodyA) ||
                pins.includes(pair.bodyB);

            if (!hitPin) {
                continue;
            }

            if (firstCollisions.has(ball.id)) {
                continue;
            }

            firstCollisions.add(ball.id);

            const randomOffset =
                (Math.random() * 2 - 1) * 0.5;

            Matter.Body.setVelocity(ball, {
                x: randomOffset,
                y: ball.velocity.y
            });
        }
    });

    const ground = Matter.Bodies.rectangle(
        325, // środek postokąta gdzie jest na x
        660, // środek prostokąta gdzie jest na y
        700, // szerokość x
        20, // wysokość y
        {
            isStatic: true,
            restitution: 0,
            friction: 1,
            
            collisionFilter: {
                category: 0x0004
            }
        }
    );

    const leftWallTriangle = createWall(
        150,
        325,
        700,
        -63.4 * Math.PI / 180
    );

    const rightWallTriangle = createWall(
        500,
        325,
        700,
        63.4 * Math.PI / 180
    );

    const leftWall = Matter.Bodies.rectangle(
        0,
        325,
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
        325,
        15,
        700,
        {
            isStatic: true,
            render:{
                visible: false
            }
        }
    );

    const slotRewards = [
        0,
        8,
        3,
        1.5,
        1,
        0.75,
        0.5,
        0.5,
        0.75,
        1,
        1.5,
        3,
        8,
        0,
    ];

    const slotWalls = createSlotWalls();

    const slotLabels = createSlotLabels(
        slotWalls,
        slotRewards
    );

    physicsContainer.appendChild(slotLabels);

    Matter.Events.on(engine, "afterUpdate", () => {

        for (const ball of balls) {

            if (rewardedBalls.has(ball.id)) {
                continue;
            }

            if (ball.position.y < 600) {
                continue;
            }

            const slotIndex = getBallSlot(
                ball,
                slotWalls
            );

            if (slotIndex === -1) {
                continue;
            }

            const reward = slotRewards[slotIndex];

            totalPoints *= reward;

            completedBalls++;

            progress.textContent =
                `KULKI: ${completedBalls} / ${currentDropCount}`;

            rewardedBalls.add(ball.id);

            resultValue.textContent =
                Math.ceil(totalPoints).toLocaleString("pl-PL");

            console.log(
                `Kulka ${ball.id} → slot ${slotIndex + 1} → x${reward} → aktualnie ${totalPoints} pkt`
            );

            if (completedBalls === currentDropCount) {
                console.log(`Koniec rundy! Wygrana: ${Math.ceil(totalPoints)} pkt`);

                showFinalResult(totalPoints);
            }
        }
    });

    Matter.Composite.add(engine.world, [
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

    dropButton.addEventListener("click", () => {

        const count = Number(ballsInput.value);

        if (count < 1 || count > 50) {
            return;
        }

        clearBalls(
            engine,
            balls,
            rewardedBalls,
            firstCollisions
        );

        totalPoints = BASE_POINTS;
        completedBalls = 0;
        currentDropCount = count;

        resultValue.textContent =
            totalPoints.toString();
        
        progress.textContent =
            `KULKI: 0 / ${currentDropCount}`;

        dropBalls(
            count,
            engine,
            balls
        );
    });

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
        10,
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
        20,
        30,
        50,
        50,
        50,
        50,
        50,
        50,
        50,
        50,
        50,
        50,
        30,
        20,
        0
    ];

    let x = 25;

    for (const width of slotWidths) {

        const wall = Matter.Bodies.rectangle(
            x,
            635,
            2,
            70,
            {
                isStatic: true
            }
        );

        walls.push(wall);

        x += width;
    }

    return walls;
}

function getBallSlot(
    ball: Matter.Body,
    slotWalls: Matter.Body[]
): number {

    const ballX = ball.position.x;

    for (let i = 0; i < slotWalls.length - 1; i++) {

        const leftWall = slotWalls[i].position.x;
        const rightWall = slotWalls[i + 1].position.x;

        if (ballX >= leftWall && ballX < rightWall) {
            return i;
        }
    }

    return -1;
}

function createBall(x: number, y: number): Matter.Body {

    return Matter.Bodies.circle(
        x,
        y,
        9,
        {
            restitution: 0.9,
            friction: 0,

            collisionFilter: {
                category: 0x0002,
                mask: 0x0001 | 0x0004
            }
        }
    );
}

function dropBalls(
    count: number,
    engine: Matter.Engine,
    balls: Matter.Body[]
): void {

    const minX = 300;
    const maxX = 350;

    for (let i = 0; i < count; i++) {

        setTimeout(() => {

            const randomX =
                minX + Math.random() * (maxX - minX);

            const ball = createBall(
                randomX,
                60
            );

            balls.push(ball);

            Matter.Composite.add(
                engine.world,
                ball
            );

        }, i * 150);
    }
}

function clearBalls(
    engine: Matter.Engine,
    balls: Matter.Body[],
    rewardedBalls: Set<number>,
    firstCollisions: Set<number>
): void {

    for (const ball of balls) {
        Matter.Composite.remove(engine.world, ball);
    }

    balls.length = 0;
    rewardedBalls.clear();
    firstCollisions.clear();
}

function createSlotLabels(
    slotWalls: Matter.Body[],
    slotRewards: number[]
): HTMLElement {

    const container = document.createElement("div");

    container.className = "plinko-slot-labels";

    for (let i = 0; i < slotWalls.length - 1; i++) {

        const leftX =
            slotWalls[i].position.x;

        const rightX =
            slotWalls[i + 1].position.x;

        const width =
            rightX - leftX;

        const reward =
            slotRewards[i];

        const label =
            document.createElement("div");

        label.className = "plinko-slot-label";

        label.textContent = `×${reward}`;

        label.style.left = `${leftX}px`;
        label.style.width = `${width}px`;

        container.appendChild(label);
    }

    return container;
}

function showFinalResult(
    points: number
): void {

    const overlay = document.createElement("div");

    overlay.className = "plinko-final-overlay";

    overlay.innerHTML = `
        <div class="plinko-final-result">

            <span>KONIEC RUNDY</span>

            <strong>
                ${Math.ceil(points).toLocaleString("pl-PL")}
            </strong>

            <small>PKT</small>

            <button>
                DALEJ
            </button>

        </div>
    `;

    document.body.appendChild(overlay);

    const button =
        overlay.querySelector<HTMLButtonElement>("button");

    button?.addEventListener("click", () => {
        overlay.remove();
    });
}