import { getVectorsIntersect } from "./module-segs-intersect.js";
import { Circle } from "./module-class-circle.js";
import { getCircleLineIntersect } from "./module-circle-line-intersect.js";
import { radiansToDegrees } from "./module-angles.js";

// let canvas;
// const setCircleRectCanvas = (cvs) => {
//     canvas = cvs;
// }

const getReflectedPoint = (px, py, vx1, vy1, vx2, vy2) => {
    // reflects a point across a vector
    const m = (vy2 - vy1) / (vx2 - vx1);
    if (m === Infinity || m === -Infinity) {
        // vertical line
        return { x: vx1 + (vx1 - px), y: py };
    }
    const yInt = (vx2 * vy1 - vx1 * vy2) / (vx2 - vx1);
    const d = (px + (py - yInt) * m) / (1 + m * m);
    const reflectedX = 2 * d - px;
    const reflectedY = 2 * d * m - py + 2 * yInt;
    return { x: reflectedX, y: reflectedY };
};

const checkCircleCollideRect = (circle, rect) => {
    // Moving Circle, Stationary Rect

    // Get "expanded" sides of the rectangle
    const expandedSides = rect.getExpandedSides(circle.radius);
    // ^ gives us array of the 4 sides, t,r,b,l, each as {x1,y1,x2,y2}
    // Create the corner circles
    const cornerCircles = [];
    for (const v of rect.vertices) {
        cornerCircles.push(new Circle(v.x, v.y, 0, 1, 0, 0, "#8888ff"));
    }

    let minDist = Infinity;
    // intersect point
    let ip = null;
    // need these for bounce
    let circleOrSeg = "";
    let collider = null;
    let side = 0;
        // check hit sides

    for (const s of expandedSides) {
        // side++;
        // ax1, ay1, ax2, ay2, bx1, by1, bx2, by2
        const intersectPoint = getVectorsIntersect(
            circle.x,
            circle.y,
            circle.x + circle.vx,
            circle.y + circle.vy,
            s.x1,
            s.y1,
            s.x2,
            s.y2
        );

        if (intersectPoint) {
            const xDist = intersectPoint.x - circle.x;
            const yDist = intersectPoint.y - circle.y;
            const distSq = Math.pow(xDist, 2) + Math.pow(yDist, 2);
            if (distSq < minDist) {
                minDist = distSq;
                ip = intersectPoint;
                circleOrSeg = "seg";
                collider = s;
            }
        }
    }
    // check hit corner circles
    let cnum = 0;
    for (const c of cornerCircles) {
        cnum++;
        const hitPoint = getCircleLineIntersect(
            c.x,
            c.y,
            circle.radius,
            circle.x,
            circle.y,
            circle.x + circle.vx,
            circle.y + circle.vy
        );
        if (hitPoint) {
            const xDist = hitPoint.x - circle.x;
            const yDist = hitPoint.y - circle.y;
            const distSq = Math.pow(xDist, 2) + Math.pow(yDist, 2);
            if (distSq < minDist) {
                minDist = distSq;
                ip = hitPoint;
                circleOrSeg = "circle";
                collider = c;
            }
        }
    }
    if (ip) {
        // There's an intersect point
        // Bounce!
        const reflectVector = {};
        if (circleOrSeg === "circle") {
            // bounce off circle
            reflectVector.x1 = collider.x;
            reflectVector.y1 = collider.y;
            reflectVector.x2 = ip.x;
            reflectVector.y2 = ip.y;
        } else {
            // bounce off segment
            const dx = collider.x2 - collider.x1;
            const dy = collider.y2 - collider.y1;
            const perpendicular = { x: -dy, y: dx };

            reflectVector.x1 = ip.x;
            reflectVector.y1 = ip.y;
            reflectVector.x2 = ip.x + perpendicular.x;
            reflectVector.y2 = ip.y + perpendicular.y;
        }

        // px, py, vx1, vy1, vx2, vy2
        const reflectedPoint = getReflectedPoint(
            circle.x,
            circle.y,
            reflectVector.x1,
            reflectVector.y1,
            reflectVector.x2,
            reflectVector.y2
        );

        // Move only remaining distance of step
        const iDist = Math.sqrt(
            Math.pow(ip.x - circle.x, 2) + Math.pow(ip.y - circle.y, 2)
        );
        const fullDist = circle.velocity;
        const remainingTime = 1 - iDist / fullDist;

        const newAngle = radiansToDegrees(
            Math.atan2(reflectedPoint.y - ip.y, reflectedPoint.x - ip.x)
        );
        circle.moveAngle = newAngle;
        reflectedPoint.x = ip.x + circle.vx * remainingTime;
        reflectedPoint.y = ip.y + circle.vy * remainingTime;
        // reflectedPoint.x =
        //     ip.x + getCos(newAngle) * circle.velocity * remainingTime;
        // reflectedPoint.y =
        //     ip.y + getSin(newAngle) * circle.velocity * remainingTime;

        // return reflectedPoint;
        // also we can return newAngle, or set circle's .moveAngle to newAngle
        circle.x = reflectedPoint.x;
        circle.y = reflectedPoint.y;
    }
    // return null;
};

export { checkCircleCollideRect };
