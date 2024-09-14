import { getCircleLineIntersect } from "./module-circle-line-intersect.js";

function dot(A, B) {
    // A and B are {x,y} vectors
    return A.x * B.x + A.y * B.y;
}

const stopCircleRectOverlap = (circle, rect) => {
    if (getCircleRectIntersect(circle, rect)) {
        // Move circle out of rect to radius dist
        const side = getClosestSideToPoint({ x: circle.x, y: circle.y }, rect);
        const proj = getProjectionPointOnSegment(side.p1.x, side.p1.y, side.p2.x, side.p2.y, circle.x, circle.y);
        const dist = Math.sqrt(distSq(circle.x, circle.y, proj.x, proj.y));
        // let outsideX,outsideY;
        let pct;
        if (getPointInRect(circle.x, circle.y, rect)) {
            // circle center inside rect
            // pct = (dist+0.1) / circle.radius + 1;
            pct = (dist+0.01) / circle.radius;
        } else {
            // circle center outside rect
            // pct = (dist / circle.radius) - 1.1;
            pct = (dist / circle.radius) - 1.01;
        }
        const outsideX = circle.x + (proj.x - circle.x) * pct;
        const outsideY = circle.y + (proj.y - circle.y) * pct;
        circle.x = outsideX;
        circle.y = outsideY;
    }
};

const getClosestSideToPoint = (point, rect) => {
    const vs = rect.vertices;
    const sides = [];
    for (let v = 0; v < vs.length; v++) {
        const v1 = vs[v];
        const v2 = vs[(v + 1) % vs.length];
        sides.push({ p1: v1, p2: v2 });
    }
    let shortest = Infinity;
    let closestSide;
    for (const s of sides) {
        const distSq = getDistPointFromSegSq(
            s.p1.x,
            s.p1.y,
            s.p2.x,
            s.p2.y,
            point.x,
            point.y
        );
        if (distSq < shortest) {
            shortest = distSq;
            closestSide = s;
        }
    }
    return closestSide;
};

const getProjectionPointOnSegment = (vx1, vy1, vx2, vy2, px, py) => {
    // Thanks to https://stackoverflow.com/questions/849211/shortest-distance-between-a-point-and-a-line-segment
    // Return minimum distance between line segment vw and point p
    const segLengthSq = Math.pow(vx2 - vx1, 2) + Math.pow(vy2 - vy1, 2);
    if (segLengthSq === 0) {
        // v == w case
        return Math.sqrt(Math.pow(px - vx1, 2) + Math.pow(py - vy1, 2));
    }
    // Consider the line extending the segment, parameterized as v + t (w - v).
    // We find projection of point p onto the line.
    // It falls where t = [(p-v) . (w-v)] / |w-v|^2
    // We clamp t from [0,1] to handle points outside the segment vw.
    const t = Math.max(
        0,
        Math.min(
            1,
            dot({ x: px - vx1, y: py - vy1 }, { x: vx2 - vx1, y: vy2 - vy1 }) /
                segLengthSq
        )
    );
    //const vec2 projection = v + t * (w - v);  // Projection falls on the segment
    //   v1 + t * (v2-v1)
    const projx = vx1 + t * (vx2 - vx1);
    const projy = vy1 + t * (vy2 - vy1);
    return { x: projx, y: projy };
};

const getDistPointFromSegSq = (vx1, vy1, vx2, vy2, px, py) => {
    const proj = getProjectionPointOnSegment(vx1, vy1, vx2, vy2, px, py);
    // const distance = Math.sqrt(
    //     Math.pow(px - projx, 2) + Math.pow(py - projy, 2)
    // );
    // For this application (only comparison) it's ok to be squared
    const distance = Math.pow(px - proj.x, 2) + Math.pow(py - proj.y, 2);
    return distance;
};

const distSq = (x1, y1, x2, y2) => {
    return Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2);
};

const getPointInRect = (px, py, rect) => {
    // if point's distance from any side is larger than that dimension of rect, point is outside
    const vs = rect.vertices;
    const s1sq = distSq(vs[0].x, vs[0].y, vs[1].x, vs[1].y);
    const s2sq = distSq(vs[1].x, vs[1].y, vs[2].x, vs[2].y);
    // dist of p to side 1 < side 2
    const pdistFrom1 = getDistPointFromSegSq(
        vs[0].x,
        vs[0].y,
        vs[1].x,
        vs[1].y,
        px,
        py
    );
    if (pdistFrom1 > s2sq) return false;
    // dist of p to side 2 < side 1
    const pdistFrom2 = getDistPointFromSegSq(
        vs[1].x,
        vs[1].y,
        vs[2].x,
        vs[2].y,
        px,
        py
    );
    if (pdistFrom2 > s1sq) return false;
    // dist p to side 3 < side 2
    const pdistFrom3 = getDistPointFromSegSq(
        vs[2].x,
        vs[2].y,
        vs[3].x,
        vs[3].y,
        px,
        py
    );
    if (pdistFrom3 > s2sq) return false;
    // dist p to side 4 < side 1
    const pdistFrom4 = getDistPointFromSegSq(
        vs[3].x,
        vs[3].y,
        vs[0].x,
        vs[0].y,
        px,
        py
    );
    if (pdistFrom4 > s1sq) return false;
    return true;
};

// def intersect(Circle(P, R), Rectangle(A, B, C, D)):
//     S = Circle(P, R)
//     return (pointInRectangle(P, Rectangle(A, B, C, D)) or
//             intersectCircle(S, (A, B)) or
//             intersectCircle(S, (B, C)) or
//             intersectCircle(S, (C, D)) or
//             intersectCircle(S, (D, A)))

const getCircleRectIntersect = (circle, rect) => {
    const v = rect.vertices;
    const pointInRect = getPointInRect(circle.x, circle.y, rect);
    return (
        pointInRect ||
        // (cx, cy, r, lx1, ly1, lx2, ly2)
        getCircleLineIntersect(
            circle.x,
            circle.y,
            circle.radius,
            v[0].x,
            v[0].y,
            v[1].x,
            v[1].y
        ) ||
        getCircleLineIntersect(
            circle.x,
            circle.y,
            circle.radius,
            v[1].x,
            v[1].y,
            v[2].x,
            v[2].y
        ) ||
        getCircleLineIntersect(
            circle.x,
            circle.y,
            circle.radius,
            v[2].x,
            v[2].y,
            v[3].x,
            v[3].y
        ) ||
        getCircleLineIntersect(
            circle.x,
            circle.y,
            circle.radius,
            v[3].x,
            v[3].y,
            v[0].x,
            v[0].y
        )
    );
};

export { getCircleRectIntersect, stopCircleRectOverlap };
