import { asteroids, ships, debris, emitSound } from "./server.js";
import {mixHexColors} from "./libs/colorUtilities.js"
import { Circle } from "./module-class-circle.js";


// Explosions
//
////////////////

const detonateShockwave = (x, y, r) => {
    const gosToCheck = [...asteroids, ...ships, ...debris];
    // get GOs in radius
    const affectedGos = gosToCheck.filter(
        (go) => Math.pow(go.x - x, 2) + Math.pow(go.y - y, 2) < r * r
    );
    // apply impact
    const maxForce = 0.01 + r / 60;
    for (const gO of affectedGos) {
        const xDiff = gO.x - x;
        const yDiff = gO.y - y;
        if (xDiff != 0 && yDiff != 0) {
            // prevent dividing by zero
            // make better solution later...
            const dist = Math.sqrt(Math.pow(xDiff, 2) + Math.pow(yDiff, 2));
            const magnitude = 2 * (1 - dist / r);
            const unitVx = xDiff / dist;
            const unitVy = yDiff / dist;
            const xForce = maxForce * unitVx * magnitude;
            const yForce = maxForce * unitVy * magnitude;
            gO.vx += xForce;
            gO.vy += yForce;
        }
    }
};

const explode = (gO) => {
    // play sound
    emitSound("explodeSound");
    // gO is gameObject
    const x = gO.x;
    const y = gO.y;

    // Shockwave
    const swRadius = 4 + gO.radius * 4;
    detonateShockwave(x, y, swRadius);
    // Debris
    let startColor = "#ff0000";
    let endColor = "#ffff00";
    let midColor = mixHexColors(startColor, endColor, 50);
    let mass = gO.mass;
    // mass = 0 to 1
    mass = mass === undefined ? 1 : mass;
    let particleNum = 36 + Math.round(50 * mass);
    // let maxSpeed = 0.5 + mass * 0.5;
    let maxSpeed = 0.3 + mass * 0.3;

    for (let i = 0; i < particleNum; i++) {
        let speed = 0.01 + Math.random() * (maxSpeed - 0.01);
        let deg = Math.random() * 360;
        let radius = 0.6 - (speed / maxSpeed) * 0.4;
        let lifespan = 500 + 500 * (speed / maxSpeed);
        let color = endColor;
        if (speed < maxSpeed * 0.2) {
            color = startColor;
        } else if (speed < maxSpeed * 0.5) {
            color = midColor;
        }
        // x, y, radius, mass, facing, velocity, color
        let particle = new Circle(
            x,
            y,
            radius,
            mass,
            deg,
            speed,
            color
        );
        particle.vx += gO.vx * 0.5;
        particle.vy += gO.vy * 0.5;
        particle.lifeSpan = lifespan;
        particle.bornTime = performance.now();
        particle.deceleration = 0.95;
        particle.myArray = debris;
        particle.type = "debris";
        debris.push(particle);
    }
};

export { explode };
