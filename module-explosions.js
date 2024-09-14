import { asteroids, ships, debris, emitSound } from "./server.js";
import { mixHexColors } from "./libs/colorUtilities.js";
import { Circle } from "./module-class-circle.js";
import { getInitialVelocityFromDistanceAndDeceleration } from "./temp-brute-deceleration.js";

// Explosions
//
////////////////

const detonateShockwave = (x, y, r) => {
    const gosToCheck = [...asteroids, ...ships]; //, ...debris];
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

const explosion = (gO, radius, outerColor, deceleration) => {
    radius = radius || gO.radius;

    // gO is gameObject
    const x = gO.x;
    const y = gO.y;

    // Shockwave
    const swRadius = 4 + radius * 4;
    detonateShockwave(x, y, swRadius);
    // Debris
    let yellow = "#ffff00"; //"#ff0000";//
    let red = "#ff3300"; //"#ffff00"; //
    outerColor = outerColor || "#ff0000"; //"#806010"; // "#3a00ef";
    // let midColor = mixHexColors(startColor, endColor, 50);
    let mass = gO.mass;
    // mass = 0 to 1
    mass = mass === undefined ? 1 : mass;
    let particleNum = 24 + Math.round(24 * radius);
    // if (gO.type !== "missile") particleNum += Math.round(10 * mass);
    const decelerationPercent = deceleration || 0.9;
    const maxDistance = Math.max(2, radius * 5);
    // let maxSpeed = 0.8 + mass * 0.3;

    let maxSpeed = getInitialVelocityFromDistanceAndDeceleration(
        maxDistance,
        decelerationPercent
    );

    const blastParticles = [];
    for (let i = 0; i < particleNum; i++) {
        let speed = 0.01 + Math.random() * (maxSpeed - 0.01);
        let deg = Math.random() * 360;
        let radius = 0.7 - (speed / maxSpeed) * 0.65;
        radius = radius * 0.95 + radius * 0.01 * mass;
        let lifespan = 350 + 100 * Math.random() + 800 * (speed / maxSpeed);
        const speedPct = speed / maxSpeed;
        let mixAmount; // = speedPct * 100;
        let color; // = mixHexColors(startColor, endColor, mixAmount);
        const breakpoint1 = 0.1;
        const breakpoint2 = 0.5;
        if (speedPct < breakpoint1) {
            mixAmount = (100 * speedPct) / breakpoint1;
            color = mixHexColors("#ffffff", yellow, mixAmount);
        } else if (speedPct < breakpoint2) {
            mixAmount =
                (100 * (speedPct - breakpoint1)) / (breakpoint2 - breakpoint1);
            color = mixHexColors(yellow, red, mixAmount);
        } else {
            mixAmount = (100 * (speedPct - breakpoint2)) / (1 - breakpoint2);
            // mixAmount = Math.max(0, Math.min(100, mixAmount));
            color = mixHexColors(red, outerColor, mixAmount);
        }
        // x, y, radius, mass, facing, velocity, color
        let particle = new Circle(x, y, radius, mass, deg, speed, color);
        particle.vy += gO.vy * .1 * speedPct * speedPct;
        particle.vx += gO.vx * .1 * speedPct * speedPct;
        particle.lifeSpan = lifespan;
        particle.bornTime = performance.now();
        particle.deceleration = decelerationPercent; //0.93;//0.95;
        particle.myArray = debris;
        particle.type = "debris";
        // debris.push(particle);
        blastParticles.push(particle);
    }
    blastParticles.sort((a, b) => {
        a.velocity < b.velocity;
    });
    debris.push(...blastParticles);
};

const explode = (gO) => {
    explosion(gO, gO.radius * 0.8, "#ffff00", 0.94);
            // play sound
            if (gO.radius > 3) {
                emitSound("explode8bit");
            } else if (gO.radius > 2) {
                emitSound("explodeMid");
            } else {
                emitSound("explodeSound");
            }
    setTimeout(() => {
        explosion(gO);
    }, 150);
};

export { explode };
