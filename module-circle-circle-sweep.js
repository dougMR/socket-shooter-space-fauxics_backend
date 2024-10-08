import { getCos, getSin, radiansToDegrees } from "./module-angles.js";
import { players } from "./module-players.js";

const handlePoints = (missile, target) => {
    // console.log("handlePoints() target type:",target.type);
    // console.log("missile.playerId",missile.myShip.playerId);
    // console.log('playerIds: ',players.map(p=>p.id));
    // console.log('playerUUIDs: ',players.map(p=>p.uuid));

    // !!! Make point value property of gameObject (circle).
    const missilePlayer = players.find((p) => p.id === missile.myShip.playerId);
    missilePlayer.score += target.value;
    // switch (target.type) {
    //     case "ship":
    //         // IS this the only place we can know who shot the ship?
    //         missilePlayer.score += 5;
    //         break;
    //     case "asteroid":
    //         // v Very hacky way to get asteroid points
    //         missilePlayer.score += 5-target.radius;
    //         // console.log(missilePlayer.name + " - " + missilePlayer.score);
    //         break;
    // }
};

// ===============================

function sortByLeft(circles) {
    circles.sort((a, b) => {
        /* 
        !! This doesn't work with motion, only with static current position
        Instead, we would have to find leftmost and rightmost position for each circle in current frame's movement.
        Count those as circle's bounds
        */
        const aL = Math.min(a.x, a.x + a.vx) - a.radius;
        const bL = Math.min(b.x, b.x + b.vx) - b.radius;
        return aL - bL;
    });
}
function checkNoXmotionOverlap(a, b) {
    // is b's leftmost position this move > than a's rightmost position?
    const bL = Math.min(b.x, b.x + b.vx) - b.radius;
    const aR = Math.max(a.x, a.x + a.vx) + a.radius;
    return bL > aR;
}

function checkHit(circles) {
    sortByLeft(circles)
    // All circles vs all circles
    const exploders = [];
    for (let i = 0; i < circles.length; i++) {
        const A = circles[i];
        for (var j = i + 1; j < circles.length; j++) {
            const B = circles[j];
            // prune list of circles
            if (checkNoXmotionOverlap(A, B)) break;
            // this needs to become more generic.  checking whether a circle is a missile shouldn't happen here
            if (A.type !== "missile" && B.type !== "missile") {
                stopOverlap(A, B);
            }
            let hit = runHitTest(A, B);
            if (hit === 0) {
                // missile hit something or mine hit something other than asteroid
                // destroy both
                // console.log("DESTORY");

                if (A.type === "missile") {
                    handlePoints(A, B);
                    // move one last time
                    A.x += A.vx;
                    A.y += A.vy;
                    // transfer missile's movement direction to target, for directional explosion
                    B.vx += A.vx * 0.4;
                    B.vy += A.vy * 0.4;
                } else if (B.type === "missile") {
                    handlePoints(B, A);
                    // move one last time
                    B.x += B.vx;
                    B.y += B.vy;
                    // transfer missile's movement direction to target, for directional explosion
                    A.vx += B.vx * 0.4;
                    A.vy += B.vy * 0.4;
                }

                exploders.push(A, B);
                break;
            } else if (hit.hit) {
                break;
            }
        }
    }
    return exploders;
}

const collide = (A, B, hitTime) => {
    // Move to point of collision
    A.x = A.x + A.vx * hitTime;
    A.y = A.y + A.vy * hitTime;
    B.x = B.x + B.vx * hitTime;
    B.y = B.y + B.vy * hitTime;

    var transferResults = transferMomentum(A, B);

    const dampen = 0.95;
    A.vx = transferResults.a.x * dampen;
    A.vy = transferResults.a.y * dampen;
    B.vx = transferResults.b.x * dampen;
    B.vy = transferResults.b.y * dampen;

    // Move the bounce distance
    // A.x += A.vx * (1 - hitTime);
    // A.y += A.vy * (1 - hitTime);
    // B.x += B.vx * (1 - hitTime);
    // B.y += B.vy * (1 - hitTime);
};

function runHitTest(A, B) {
    var hitTime = circleSweepTest(A, B);
    var hit = hitTime <= 1 && hitTime >= 0;

    if (hit) {
        // x, y, radius, mass, facing, velocity, color, label
        if (
            (A.type === "missile" && A.myShip != B) ||
            (B.type === "missile" && B.myShip != A) ||
            (A.type === "mine" && B.type === "ship") ||
            (B.type === "mine" && A.type === "ship")
        ) {
            // missile or mine hit something
            return 0;
        }
        collide(A, B, hitTime);
    } else {
        return false;
    }
    return { hit, hitTime };
}

//  --------------- UTILITY Functions ---------------
function stopOverlap(A, B) {
    // A and B are sprites
    var xd = B.x - A.x;
    var yd = B.y - A.y;
    var d = Math.sqrt(xd * xd + yd * yd);
    var overlap = A.radius + B.radius - d;
    if (overlap > 0) {
        var angleB = radiansToDegrees(Math.atan2(yd, xd));
        var halfx = getCos(angleB) * overlap * 0.5;
        var halfy = getSin(angleB) * overlap * 0.5;
        B.x += halfx;
        B.y += halfy;
        A.x += 0 - halfx;
        A.y += 0 - halfy;
    }
}
function getCollisionPoint(A, B) {
    // A and B are Unit objects
    var firstBall = A;
    var secondBall = B;
    const collisionPointX =
        (firstBall.sprite.x * secondBall.radius +
            secondBall.sprite.x * firstBall.radius) /
        (firstBall.radius + secondBall.radius);

    const collisionPointY =
        (firstBall.sprite.y * secondBall.radius +
            secondBall.sprite.y * firstBall.radius) /
        (firstBall.radius + secondBall.radius);

    if (!outOfBounds(collisionPointX, collisionPointY)) {
        var dot = scene.Sprite(false, {
            layer: backgroundLayer,
            x: collisionPointX - 5,
            size: [10, 10],
            y: collisionPointY - 5,
        });

        dot.setColor("#FF00FF"); //firstBall.color );
        dot.dom.style.width = dot.dom.style.height = "10px";
        dot.dom.style.backgroundColor = firstBall.color;
        dot.dom.style.left = collisionPointX - 5 + "px";
        dot.dom.style.top = collisionPointY - 5 + "px";
        dot.position(collisionPointX - 5, collisionPointY - 5);
        dot.dom.style.borderRadius = "50%";
        dot.dom.timeout = setTimeout(function () {
            dot.remove();
        }, 7000);
    }
    return { x: collisionPointX, y: collisionPointY };
}
function transferMomentum(A, B) {
    // A and B are Circle objects
    // distance
    var d = Math.sqrt(Math.pow(B.x - A.x, 2) + Math.pow(B.y - A.y, 2));
    // norm vector
    var n = { x: (B.x - A.x) / d, y: (B.y - A.y) / d };
    // momentum
    var p =
        (2 * (dot({ x: A.vx, y: A.vy }, n) - dot({ x: B.vx, y: B.vy }, n))) /
        (A.mass + B.mass);

    // resultant vectors
    var wAx = A.vx - p * B.mass * n.x;
    var wAy = A.vy - p * B.mass * n.y;
    var wBx = B.vx + p * A.mass * n.x;
    var wBy = B.vy + p * A.mass * n.y;

    return { a: { x: wAx, y: wAy }, b: { x: wBx, y: wBy } };
}

// vector math
function dot(A, B) {
    // A and B are {x,y} vectors
    return A.x * B.x + A.y * B.y;
}

function circleSweepTest(A, B) {
    const ax1 = A.x,
        ay1 = A.y,
        ax2 = A.x + A.vx,
        ay2 = A.y + A.vy,
        aRadius = A.radius,
        bx1 = B.x,
        by1 = B.y,
        bx2 = B.x + B.vx,
        by2 = B.y + B.vy,
        bRadius = B.radius;
    // start and end points for each circle, a and b, plus radius
    const avx = ax2 - ax1;
    const avy = ay2 - ay1;
    const bvx = bx2 - bx1;
    const bvy = by2 - by1;

    // algorithm from:  http://compsci.ca/v3/viewtopic.php?t=14897

    var maxint = 10000;
    /* Returns the amount of frames untill a collision will occur */
    var t = maxint;
    var A, B, C, D, DISC;
    /* Breaking down the formula for t */
    A =
        Math.pow(avx, 2) +
        Math.pow(avy, 2) -
        2 * avx * bvx +
        Math.pow(bvx, 2) -
        2 * avy * bvy +
        Math.pow(bvy, 2);

    B =
        -ax1 * avx -
        ay1 * avy +
        avx * bx1 +
        avy * by1 +
        ax1 * bvx -
        bx1 * bvx +
        ay1 * bvy -
        by1 * bvy;

    C =
        Math.pow(avx, 2) +
        Math.pow(avy, 2) -
        2 * avx * bvx +
        Math.pow(bvx, 2) -
        2 * avy * bvy +
        Math.pow(bvy, 2);

    D =
        Math.pow(ax1, 2) +
        Math.pow(ay1, 2) -
        Math.pow(aRadius, 2) -
        2 * ax1 * bx1 +
        Math.pow(bx1, 2) -
        2 * ay1 * by1 +
        Math.pow(by1, 2) -
        2 * aRadius * bRadius -
        Math.pow(bRadius, 2);

    DISC = Math.pow(-2 * B, 2) - 4 * C * D;

    /* If the discriminent is non negative, a collision will occur and *
     * we must compare the time to our current time of collision. We   *
     * udate the time if we find a collision that has occurd earlier   *
     * than the previous one.                                          */
    if (DISC >= 0) {
        /* We want the smallest time */
        t = Math.min(
            Math.min(t, (0.5 * (2 * B - Math.sqrt(DISC))) / A),
            (0.5 * (2 * B + Math.sqrt(DISC))) / A
        );
    }
    return t;
}

export { checkHit };
