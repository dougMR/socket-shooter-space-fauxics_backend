import {
    stopSound,
    emitTime,
    emitGameState,
    emitPlayers,
    ships,
    missiles,
    mines,
    shockwaves,
    obstacles,
    debris,
    asteroids,
    emitEndGame,
} from "./server.js";
import {
    checkCirclesHitRectangles,
    checkHitObjects,
} from "./module-collision.js";
import { players, playersInGame } from "./module-players.js";
import { degreesToRadians } from "./module-angles.js";
import { stopCircleRectOverlap } from "./module-circle-rect-intersect.js";
import { explode } from "./module-explosions.js";

const keepInBounds = (obj) => {
    if (obj.x >= 100 - obj.radius || obj.x <= obj.radius) {
        if (obj.x > obj.radius) {
            obj.x = 100 - obj.radius - obj.vx;
        } else {
            obj.x = 0 + obj.radius - obj.vx;
        }
        // bounce
        obj.moveAngle = 180 - obj.moveAngle;
    }
    if (obj.y > 100 - obj.radius || obj.y <= obj.radius) {
        if (obj.y > obj.radius) {
            obj.y = 100 - obj.radius;
        } else {
            obj.y = 0 + obj.radius;
        }
        obj.y -= obj.vy;
        obj.moveAngle = 360 - obj.moveAngle;
    }
};

const checkOutOfBounds = (obj) => {
    if (obj.x >= 100 - obj.radius || obj.x <= obj.radius) {
        return true;
    }
    if (obj.y > 100 - obj.radius || obj.y <= obj.radius) {
        return true;
    }
    return false;
};

// obstacleRot and w based on obstacle creation in generate-game-pieces
let obstacleRot = 90;
const radius = 35;
const w = 20;
// const h = 6;
const rotateObstacles = () => {
    obstacleRot += 0.1;
    // console.log("obstacleRot:",obstacleRot);

    for (let o = 0; o < obstacles.length; o++) {
        const angle = obstacleRot + (360 / obstacles.length) * o;
        // const x = 50 + getCos(angle) * radius - getCos(angle + 90) * w * 0.5;
        // const y = 50 + getSin(angle) * radius - getSin(angle + 90) * w * 0.5;
        const x =
            50 +
            Math.cos(degreesToRadians(angle)) * radius -
            Math.cos(degreesToRadians(angle + 90)) * w * 0.5;
        const y =
            50 +
            Math.sin(degreesToRadians(angle)) * radius -
            Math.sin(degreesToRadians(angle + 90)) * w * 0.5;
        const rot = (angle + 90) % 360;
        obstacles[o].x = x;
        obstacles[o].y = y;
        obstacles[o].rotation = rot;
    }
};

// let lastTime;
let fps = 0;
let frames = 0;
const getFps = () => {
    return fps;
};
function gameLoop() {
    const timeStamp = performance.now();
    if (!startTime) {
        startTime = timeStamp;
        // lastTime = timeStamp;
    }
    // const elapsed = timeStamp - lastTime;
    // console.log('elapsed: ',elapsed);
    // lastTime = timeStamp;
    // oldTimeStamp = timeStamp;

    // Keys.checkKeys();

    // clearCanvas();

    // draw obstacles
    // for (const o of obstacles) {
    // o.draw();
    // }

    // Check Collision
    
    checkHitObjects();
    checkCirclesHitRectangles();
    rotateObstacles();

    // move asteroids
    for (const a of asteroids) {
        const oldV = a.velocity;
        const isNum = !isNaN(a.x);
        a.move();
        keepInBounds(a);
        // check asteroid hit obstacles
        for (const o of obstacles) {
            // undo overlaps
            stopCircleRectOverlap(a, o);
        }
    }

    // move debris
    for (const d of debris) {
        // move this to the GameObject (Circle) class?
        if (timeStamp - d.bornTime > d.lifeSpan || checkOutOfBounds(d)) {
            d.destroy();
        }
        d.move();
    }

    // move missiles
    for (const m of missiles) {
        m.move();
        // move this to the GameObject (Circle) class?
        for (const o of obstacles) {
            // undo overlaps
            stopCircleRectOverlap(m, o);
        }
        if (timeStamp - m.bornTime > m.lifeSpan || checkOutOfBounds(m)) {
            m.destroy();
        }
    }

    // move mines
    for (const m of mines) {
        m.move();
        keepInBounds(m);
        // do this with all circles and obstacles altogether?
        for (const o of obstacles) {
            // undo overlaps
            stopCircleRectOverlap(m, o);
        }
    }

    // move ships
    for (const ship of ships) {
        ship.move();
        keepInBounds(ship);
        for (const o of obstacles) {
            // undo overlaps
            stopCircleRectOverlap(ship, o);
        }
    }

    // move shockwaves
    for (const sw of shockwaves) {
        sw.move();
        for (const gO of [...asteroids, ...ships, ...missiles, ...mines]) {
            if (gO !== sw.myShip && sw.checkCollision(gO)) {
                // destroy gO
                const minePlayer = players.find(
                    (p) => p.id === sw.myShip.playerId
                );
                minePlayer.score += gO.value;
                explode(gO);
                gO.destroy();
            }
        }
    }

    const timePassed = (timeStamp - startTime) / 1000;
    let secondsLeft = Math.max(0, Math.floor(totalSeconds - timePassed));

    if (ships.length === 0 || playersInGame().length === 0 ||(ships.length === 1 && !timingOut && playersInGame().length > 1)) {
        // Last player.  Give them 1 points for each remaining second (times num players), and end game.
        timingOut = true;
        setTimeout(() => {
            if (ships.length > 0) {
                // award seconds left times num players
                players.find((p) => p.ship === ships[0]).score += Math.floor(
                    secondsLeft * players.length
                );
            }
            timedOut = true;
        }, 1000);
    } 
    // else if (ships.length === 0 || playersInGame().length === 0) {
    //     // No players left.  End game.
    //     console.log("no ships, set secondsLeft to 0");
    //     setTimeout(() => {

    //         timedOut = true;
    //     }, 1000);
    // }
    frames++;
    if (secondsLeft !== prevSecondsLeft) {
        prevSecondsLeft = secondsLeft;
        emitTime(Math.floor(secondsLeft));
        // console.log("secondsLeft (main loop):",secondsLeft);
        fps = frames;
        frames = 0;
    }
    emitGameState();
    if (secondsLeft > 0 && !timedOut) {
        // setImmediate(gameLoop);
        setTimeout(gameLoop, 16);
    } else {
        // End Game
        stopSound("themeMusic");
        console.log("secs left", secondsLeft);
        console.log("timePassed", timePassed);
        secondsLeft = 0;
        stopGame();
    }
}

const stopGame = () => {
    gameInProgress = false;
    // Change onDeck players to ready
    players.forEach((p) => (p.onDeck = false));
    emitEndGame();
    emitPlayers();
};

const startGameLoop = () => {
    startTime = null;
    timedOut = timingOut = false;
    gameInProgress = true;
    gameLoop();
};

const setGameInProgress = (value) => {
    if (typeof value === "boolean") gameInProgress = value;
};
// how best to stop game loop

let totalSeconds = 61;
let startTime = null;
let prevSecondsLeft = 0;
let timingOut = false;
let timedOut = false;
let gameInProgress = false;

export { startGameLoop, getFps, gameInProgress, setGameInProgress };
