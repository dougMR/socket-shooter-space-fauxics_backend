import {
    stopSound,
    emitTime,
    emitGameState,
    ships,
    missiles,
    obstacles,
    debris,
    asteroids,
    emitEndGame,
} from "./server.js";
import {
    checkCirclesHitRectangles,
    checkHitObjects,
} from "./module-collision.js";
import { players } from "./module-players.js";

import { stopCircleRectOverlap } from "./module-circle-rect-intersect.js";

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

function gameLoop() {
    const timeStamp = performance.now();
    if (!startTime) {
        startTime = timeStamp;
    }
    // oldTimeStamp = timeStamp;

    // Keys.checkKeys();

    // clearCanvas();

    // draw obstacles
    for (const o of obstacles) {
        // o.draw();
    }

    // Check Collision
    checkHitObjects();
    checkCirclesHitRectangles();

    // draw asteroids
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
        // a.draw();
    }

    // move debris
    for (const d of debris) {
        // move this to the GameObject (Circle) class?
        if (timeStamp - d.bornTime > d.lifeSpan || checkOutOfBounds(d)) {
            d.destroy();
        }

        d.move();

        // check asteroid hit obstacles
        // for (const o of obstacles) {
        //     // undo overlaps
        //     stopCircleRectOverlap(d, o);
        // }
        // d.draw();
    }

    // move missiles
    for (const m of missiles) {
        m.move();
        // console.log("move missile: ", m.x, m.y, m.velocity);
        // m.draw();
        // move this to the GameObject (Circle) class?
        // console.log("move m: ",m);
        if (timeStamp - m.bornTime > m.lifeSpan || checkOutOfBounds(m)) {
            m.destroy();
        }
    }

    // move / draw ships
    // console.log("ships: ", ships);
    for (const ship of ships) {
        ship.move();
        keepInBounds(ship);
        for (const o of obstacles) {
            // undo overlaps
            stopCircleRectOverlap(ship, o);
        }
        // ship.draw();
    }
    const timePassed = (timeStamp - startTime) / 1000;
    let secondsLeft = Math.max(0, Math.floor(totalSeconds - timePassed));
    

    if (ships.length === 1 && !timingOut && players.length > 1) {
        // Last player.  Give them 1 point for each remaining second, and end game.
        timingOut = true;
        console.log("One Alive!!");
        setTimeout(() => {
            console.log("End the Game");
            console.log("#ships:", ships.length);
            console.log("#players:", players.length);
            if (ships.length > 0) {
                players.find((p) => p.ship === ships[0]).score +=
                    Math.floor(secondsLeft);
                    console.log("secondsLeft (to award to surviving player):",secondsLeft);
                    // emitTime(Math.floor(secondsLeft));
            }
            timedOut = true;
        }, 1000);
    } else if (ships.length === 0) {
        // No players left.  End game.
        secondsLeft = 0;
    }

    if (secondsLeft !== prevSecondsLeft) {
        prevSecondsLeft = secondsLeft;
        emitTime(Math.floor(secondsLeft));
        console.log("secondsLeft (main loop):",secondsLeft);
    }
    emitGameState();
    if (secondsLeft > 0 && !timedOut) {
        // setImmediate(gameLoop);
        setTimeout(gameLoop, 17);
    } else {
        // End Game
        stopSound("themeMusic");
        console.log("secs left", secondsLeft);
        emitEndGame();
    }
}

const startGameLoop = () => {
    startTime = null;
    timedOut = timingOut = false;
    gameLoop();
};
// how best to stop game loop

let totalSeconds = 61;
let startTime = null;
let prevSecondsLeft = 0;
let timingOut = false;
let timedOut = false;

export { startGameLoop };
