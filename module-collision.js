import { checkHit } from "./module-circle-circle-sweep.js";
import { asteroids, missiles, ships, debris, obstacles } from "./server.js";
import { explode } from "./module-explosions.js";
import { checkCircleCollideRect } from "./module-circle-rect-collision.js";
import { Circle } from "./module-class-circle.js";

// Collision
//
////////////////

const checkHitObjects = () => {
    // this checks collision during the frame, transfers momentum, moves objects to point of contact plus new velocity
    // this needs to become more generic.  specifying asteroids, missiles etc should happen in game-loop or elsewhere, not here
    const exploders = checkHit([...asteroids, ...missiles, ...ships]);
    for (const gO of exploders) {
        // break up asteroids
        if (gO.type === "asteroid") {
            if (gO.radius > 2) {
                const newR = gO.radius - 1;
                let startX = gO.x - newR * 0.5;
                let startY = gO.y - newR * 0.5;
                for (let i = 0; i < 2; i++) {
                    let newCircle = new Circle(
                        startX,
                        startY,
                        newR,
                        (newR * newR) / 8,
                        // 3,1,
                        0,
                        gO.velocity*.7,
                        "gradient"
                    );
                    newCircle.type = "asteroid";
                    newCircle.moveAngle = gO.moveAngle;
                    asteroids.push(newCircle);
                    newCircle.myArray = asteroids;
                    newCircle.deceleration = 0.999;
                    startX += newR;
                    startY += newR;
                }
            }
        }
        explode(gO);
        // if (gO === ShipA) {
        //     ShipA = null;
        // } else
        // if (gO.type === "asteroid") {
        //     // with multiple players, figure out who shot the asteroid?
        //     addScore(1);
        // }
        gO.destroy();
    }
};

const checkCirclesHitRectangles = () => {
    const circles = [...asteroids, ...missiles, ...ships, ...debris];
    const rectangles = [...obstacles];

    for (const c of circles) {
        for (const r of rectangles) {
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
