import { checkHit, sortCirclesByLeft } from "./module-circle-circle-sweep.js";
import {
    asteroids,
    missiles,
    mines,
    ships,
    debris,
    obstacles,
    emitShipDestroyed,
} from "./server.js";
import { explode } from "./module-explosions.js";
import { checkCircleCollideRect } from "./module-circle-rect-collision.js";
import { Circle } from "./module-class-circle.js";

// Collision
//
////////////////

const checkHitObjects = () => {
    // this checks collision during the frame, transfers momentum, moves objects to point of contact plus new velocity
    // this needs to become more generic.  specifying asteroids, missiles etc should happen in game-loop or elsewhere, not here
    const exploders = checkHit([...asteroids, ...missiles, ...ships, ...mines]);
    for (const gO of exploders) {
        // if (gO.type !== "missile") {
        explode(gO);
        // }
        if(gO.type==="ship"){
            emitShipDestroyed(gO.playerId);
        }
        gO.destroy();
    }
};

function checkNoCircleRectXmotionOverlap(circle, rect) {
    // is circle's leftmost position this move > than rect's rightmost position?
    const circleL =
        Math.min(circle.x, circle.x - circle.vx, circle.x + circle.vx) -
        circle.radius;
    const rectR = rect.rightMostX;
    return circleL > rectR;
}

const checkCirclesHitRectangles = () => {
    const circles = [...asteroids, ...missiles, ...ships, ...debris, ...mines];
    sortCirclesByLeft(circles);
    const rectangles = [...obstacles];
    for (const r of rectangles) {
        for (const c of circles) {
            if (checkNoCircleRectXmotionOverlap(c, r)) break;
            checkCircleCollideRect(c, r);
        }
    }
};

const checkCirclesOverlap = (A, B) => {
    if (
        Math.pow(B.x - A.x, 2) + Math.pow(B.y - A.y, 2) <=
        Math.pow(A.radius + B.radius, 2)
    ) {
        return true;
    }
    return false;
};

const checkAsteroidsOverlap = (checkCircle) => {
    for (const d of asteroids) {
        if (checkCirclesOverlap(checkCircle, d)) {
            return true;
        }
    }
    return false;
};
export {
    checkAsteroidsOverlap,
    checkCirclesHitRectangles,
    checkCirclesOverlap,
    checkHitObjects,
};
