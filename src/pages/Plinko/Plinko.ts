import "./Plinko.css";
import Matter from "matter-js"

import { createBananas } from "../../utils/createBananas";
import { ActivePlayerPanel } from "../../components/ActivePlayer/ActivePlayer";

import {
    getActivePlayer,
    setActivePlayer
} from "../../state/activePlayer";

export function Plinko(onBack: () => void): HTMLElement {
    const plinkoPage = document.createElement("main");

    plinkoPage.className = "plinko-page";

    let activePlayerPanel = ActivePlayerPanel();

    plinkoPage.appendChild(
        activePlayerPanel
    );

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

    const betLabel = document.createElement("span");
    betLabel.textContent = "STAWKA";

    const betInput = document.createElement("input");
    betInput.className = "plinko-bet-input";
    betInput.type = "number";
    betInput.min = "1";
    betInput.step = "1";
    betInput.value = "1000";

    const ballsLabel = document.createElement("span");
    ballsLabel.textContent = "LICZBA KULEK MAX 50";

    const ballsInput = document.createElement("input");
    ballsInput.type = "number";
    ballsInput.min = "1";
    ballsInput.max = "50";
    ballsInput.value = "1";

    const dropButton = document.createElement("button");
    dropButton.textContent = "DROP";

    controls.appendChild(betLabel);
    controls.appendChild(betInput);

    controls.appendChild(ballsLabel);
    controls.appendChild(ballsInput);

    controls.appendChild(dropButton);   

    const result = document.createElement("div");

    result.className = "plinko-result";

    result.innerHTML = `
        <span>AKTUALNA PULA</span>
        <strong>1000</strong>
        <small>BP</small>
    `;

    controls.appendChild(result);

    const resultValue =
        result.querySelector("strong") as HTMLElement;
    
    const progress = document.createElement("div");

    progress.className = "plinko-progress";
    progress.textContent = "KULKI: 0 / 0";

    controls.appendChild(progress);

    const message =
        document.createElement("div");

    message.className =
        "plinko-message";

    controls.appendChild(
        message
    );

    gameContainer.appendChild(controls);

    const engine = Matter.Engine.create();

    engine.gravity.y = 1;

    const balls: Matter.Body[] = [];

    const rewardedBalls = new Set<number>();

    let currentBet = 1000;

    let totalPoints =
        currentBet;

    let completedBalls = 0;

    let currentDropCount = 0;

    let roundRunning = false;

    let currentSessionId: number | null =
        null;

    let bestMultiplier: number | null =
        null;

    function refreshActivePlayerPanel(): void {

        const newPanel =
            ActivePlayerPanel();

        activePlayerPanel.replaceWith(
            newPanel
        );

        activePlayerPanel =
            newPanel;
    }

    
    async function startRoundInDatabase(
        playerId: number,
        bet: number,
        ballsCount: number
    ): Promise<boolean> {

        try {

            const response =
                await fetch(
                    "/api/games/plinko/start",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type":
                                "application/json"
                        },
                        body: JSON.stringify({
                            playerId,
                            bet,
                            ballsCount
                        })
                    }
                );

            const data =
                await response.json();

            if (!response.ok) {

                message.textContent =
                    data.error ??
                    "BŁĄD STARTU RUNDY";

                return false;
            }

            currentSessionId =
                data.sessionId;

            const currentPlayer =
                getActivePlayer();

            if (
                currentPlayer &&
                currentPlayer.id === playerId
            ) {

                setActivePlayer({
                    ...currentPlayer,
                    balance: data.balance,
                    rank:
                        data.rank ??
                        currentPlayer.rank
                });

                refreshActivePlayerPanel();
            }

            return true;

        } catch (error) {

            console.error(error);

            message.textContent =
                "BŁĄD POŁĄCZENIA Z API";

            return false;
        }
    }

    async function finishRoundInDatabase(
        payout: number
    ): Promise<boolean> {

        if (currentSessionId === null) {

            message.textContent =
                "BRAK AKTYWNEJ RUNDY";

            return false;
        }

        try {

            const response =
                await fetch(
                    `/api/games/plinko/${currentSessionId}/finish`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type":
                                "application/json"
                        },
                        body: JSON.stringify({
                            payout,
                            bestMultiplier
                        })
                    }
                );

            const data =
                await response.json();

            if (!response.ok) {

                message.textContent =
                    data.error ??
                    "BŁĄD ZAPISU RUNDY";

                return false;
            }

            const currentPlayer =
                getActivePlayer();

            if (
                currentPlayer &&
                currentPlayer.id ===
                    data.playerId
            ) {

                setActivePlayer({
                    ...currentPlayer,
                    balance:
                        data.balance,
                    rank:
                        data.rank ??
                        currentPlayer.rank
                });

                refreshActivePlayerPanel();
            }

            currentSessionId =
                null;

            return true;

        } catch (error) {

            console.error(error);

            message.textContent =
                "BŁĄD ZAPISU WYNIKU";

            return false;
        }
    }

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
        5,
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
        5,
        0,
    ];

    const slotWalls = createSlotWalls();

    const slotLabels = createSlotLabels(
        slotWalls,
        slotRewards
    );

    physicsContainer.appendChild(slotLabels);

    Matter.Events.on(engine, "afterUpdate", async() => {

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

            const reward =
                slotRewards[slotIndex];

            if (
                bestMultiplier === null ||
                reward > bestMultiplier
            ) {
                bestMultiplier =
                    reward;
            }

            totalPoints *= reward;

            completedBalls++;

            progress.textContent =
                `KULKI: ${completedBalls} / ${currentDropCount}`;

            rewardedBalls.add(ball.id);

            resultValue.textContent =
                Math.ceil(totalPoints).toLocaleString("pl-PL");

            console.log(
                `Kulka ${ball.id} → slot ${slotIndex + 1} → x${reward} → aktualnie ${totalPoints} BP`
            );

           if (completedBalls === currentDropCount) {

                const finalPoints =
                    Math.ceil(totalPoints);

                console.log(
                    `Koniec rundy! Wypłata: ${finalPoints} BP`
                );

                const saved =
                    await finishRoundInDatabase(
                        finalPoints
                    );

                if (!saved) {

                    message.textContent =
                        "BŁĄD ZAPISU RUNDY";

                    return;
                }

                roundRunning = false;

                betInput.disabled =
                    false;

                ballsInput.disabled =
                    false;

                dropButton.disabled =
                    false;

                showFinalResult(
                    finalPoints,
                    currentBet
                );
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

    dropButton.addEventListener(
        "click",
        async() => {

            if (roundRunning) {
                return;
            }

            message.textContent =
                "";

            const activePlayer =
                getActivePlayer();

            if (!activePlayer) {

                message.textContent =
                    "NAJPIERW WYBIERZ GRACZA";

                return;
            }

            const bet =
                Math.floor(
                    Number(betInput.value)
                );

            if (
                !Number.isFinite(bet) ||
                bet < 1
            ) {

                message.textContent =
                    "WPISZ POPRAWNĄ STAWKĘ";

                return;
            }

            if (
                bet >
                activePlayer.balance
            ) {

                message.textContent =
                    "GRACZ NIE MA TYLE BP";

                return;
            }

            const count =
                Math.floor(
                    Number(ballsInput.value)
                );

            if (
                !Number.isFinite(count) ||
                count < 1 ||
                count > 50
            ) {

                message.textContent =
                    "LICZBA KULEK: 1-50";

                return;
            }

            const roundStarted =
                await startRoundInDatabase(
                    activePlayer.id,
                    bet,
                    count
                );

            if (!roundStarted) {
                return;
            }

            currentBet =
                bet;

            roundRunning =
                true;

            betInput.disabled =
                true;

            ballsInput.disabled =
                true;

            dropButton.disabled =
                true;


            clearBalls(
                engine,
                balls,
                rewardedBalls,
                firstCollisions
            );

            totalPoints =
                currentBet;

            completedBalls =
                0;

            currentDropCount =
                count;

            resultValue.textContent =
                totalPoints.toLocaleString(
                    "pl-PL"
                );

            progress.textContent =
                `KULKI: 0 / ${currentDropCount}`;

            dropBalls(
                count,
                engine,
                balls
            );
        }
    );

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
    payout: number,
    bet: number
): void {

    const overlay =
        document.createElement("div");

    overlay.className =
        "plinko-final-overlay";

    const profit =
        payout - bet;

    const profitText =
        profit > 0
            ? `+${profit.toLocaleString("pl-PL")}`
            : profit.toLocaleString("pl-PL");

    overlay.innerHTML = `
        <div class="plinko-final-result">

            <span>
                KONIEC RUNDY
            </span>

            <small>
                STAWKA
            </small>

            <strong>
                ${bet.toLocaleString("pl-PL")} BP
            </strong>

            <small>
                WYPŁATA
            </small>

            <strong>
                ${payout.toLocaleString("pl-PL")} BP
            </strong>

            <small>
                ZYSK / STRATA
            </small>

            <strong>
                ${profitText} BP
            </strong>

            <button>
                DALEJ
            </button>

        </div>
    `;

    document.body.appendChild(
        overlay
    );

    const button =
        overlay.querySelector<HTMLButtonElement>(
            "button"
        );

    button?.addEventListener(
        "click",
        () => {
            overlay.remove();
        }
    );
}
