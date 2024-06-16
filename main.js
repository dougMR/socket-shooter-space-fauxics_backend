// import { Player } from "./module-player.js";
// import { setCtx } from "./module-draw-shapes.js";
import { Keys } from "./module-keys.js";
import { checkHit } from "./module-circle-circle-sweep.js";
// import { Obstacles } from "./module-obstacles.js";
// import { drawHits } from "./module-vector-intersect-rect.js";
import { Circle } from "./module-class-circle.js";
import { Rectangle } from "./module-class-rectangle.js";
import { Ship } from "./module-class-ship.js";
import { Missile } from "./module-class-missile.js";
import { getCos, getSin } from "./module-angles.js";
import { mixHexColors } from "./libs/colorUtilities.js";
import {
    checkCircleCollideRect,
    setCircleRectCanvas,
} from "./module-circle-rect-collision.js";
import {
    getCircleRectIntersect,
    stopCircleRectOverlap,
} from "./module-circle-rect-intersect.js";
import { makeSound } from "./module-sounds.js";

// Set up keys for control

const keysToAdd = [
    {
        name: ["ArrowLeft", "A", "a"],
        myFunction: () => {
            if (ShipA) turn(-5);
        },
        frequency: 50,
    },
    {
        name: ["ArrowRight", "D", "d"],
        myFunction: () => {
            if (ShipA) turn(5);
        },
        frequency: 50,
    },
    {
        name: ["ArrowUp", "w", "W"],
        myFunction: () => {
            if (ShipA) accelerate(0.05);
        },
        upFunction: () => {
            if (ShipA) stopThrust();
        },
        frequency: 30,
    },
    {
        name: ["ArrowDown", "s", "S"],
        myFunction: () => {
            if (ShipA) accelerate(-0.025);
        },
        upFunction: () => {
            if (ShipA) stopThrust();
        },
        frequency: 30,
    },
    {
        name: ["  ", " ", "Space"],
        myFunction: () => {
            if (ShipA) shoot();
        },
        frequency: 500,
    },
];

for (const key of keysToAdd) {
    key.lastTimePressed = 0;
    Keys.addKey(key);
}

// Fly Ship
//
//////////////////////

const accelerate = (amount) => {
    ShipA.thrust(amount);
    ShipA.thrusting = true;
};
const stopThrust = () => {
    ShipA.thrusting = false;
};

const shoot = () => {
    // sound
    laserSound.play();
    // generate projectile at ShipA's nose
    const noseX = ShipA.x + getCos(ShipA.facing) * ShipA.radius * 0.7;
    const noseY = ShipA.y + getSin(ShipA.facing) * ShipA.radius * 0.7;
    const missile = new Missile(
        noseX,
        noseY,
        0.5,
        0.1,
        ShipA.facing,
        ShipA.velocity + 2,
        "#69ff2f",
        canvas
    );
    missile.type = "missile";
    missile.bornTime = performance.now();
    missile.lifeSpan = 1500;
    missiles.push(missile);
    missile.myArray = missiles;
    missile.myShip = ShipA;
};

const move = (distance) => {
    console.log("move()");
    const oldPos = { x: ShipA.x, y: ShipA.y };
    ShipA.move(distance);
};

const turn = (degChange) => {
    ShipA.rotate(degChange);
};

// Drawing
//
////////////////////////

function clearCanvas() {
    // Create a radial gradient
    // The inner circle is at x=110, y=90, with radius=30
    // The outer circle is at x=100, y=100, with radius=70
    const gradient = context.createRadialGradient(
        canvas.width * 0.5,
        canvas.height * 0.5,
        canvas.width * 0.3,
        canvas.width * 0.5,
        canvas.height * 0.5,
        canvas.width * 0.4
    );

    // Add three color stops
    gradient.addColorStop(0, "#221133");
    // gradient.addColorStop(0.5, "white");
    gradient.addColorStop(0.7, "#110022");

    // Set the fill style and draw a rectangle
    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);
}

// Collision
//
////////////////

const checkHitObjects = () => {
    // this checks collision during the frame, transfers momentum, moves objects to point of contact plus new velocity
    const exploders = checkHit([...asteroids, ...missiles, ...ships]);
    for (const gO of exploders) {
        explode(gO);
        if (gO === ShipA) {
            ShipA = null;
        } else if (gO.type === "asteroid") {
            addScore(1);
        }
        gO.destroy();
    }
};

const checkCirclesHitRectangles = () => {
    const circles = [...asteroids, ...missiles, ...ships, ...debris];
    const rectangles = [...obstacles];

    for (const c of circles) {
        for (const r of rectangles) {
            checkCircleCollideRect(c, r, canvas);
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
    explodeSound.play();
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
    let maxSpeed = 0.5 + mass * 0.5;

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
        // x, y, radius, mass, facing, velocity, color, canvas
        let particle = new Circle(
            x,
            y,
            radius,
            mass,
            deg,
            speed,
            color,
            canvas
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

// Generate game pieces
//
/////////////////////////

const createObstacle = (x, y, w, h, rot) => {
    const newRect = new Rectangle(x, y, w, h, "#5577cc", canvas);
    newRect.rotation = rot;
    obstacles.push(newRect);
};

const generateObstacles = () => {
    const w = 20;
    const h = 6;
    // const halfHypotenuse = Math.sqrt(w * w + h * h) * 0.5;
    const numObstacles = 7;
    const radius = 35;
    for (let o = 0; o < numObstacles; o++) {
        const angle = 90 + (360 / numObstacles) * o;
        const x = 50 + getCos(angle) * radius - getCos(angle + 90) * w * 0.5;
        const y = 50 + getSin(angle) * radius - getSin(angle + 90) * w * 0.5;
        const rot = angle + 90;
        createObstacle(x, y, w, h, rot);
    }
};

const checkAsteroidOverlapsRect = (circle) => {
    for (const r of obstacles) {
        if (getCircleRectIntersect(circle, r)) {
            return true;
        }
    }
    return false;
};

const generateAsteroids = () => {
    let loops = 0;
    while (loops < 100) {
        // x, y, radius, mass, facing, velocity, color,canvas)
        const maxR = 4;
        let factor = 1; //+ Math.round(Math.random() * (maxR - 1));
        let r = maxR / factor;
        let mass = 2 / (factor * factor);
        let velocity = 1 / (2 * r);
        let newCircle = new Circle(
            r + Math.random() * (100 - r * 2),
            r + Math.random() * (100 - r * 2),
            r,
            mass,
            // 3,1,
            0,
            velocity,
            "gradient",
            canvas
        );
        while (
            checkAsteroidsOverlap(newCircle) ||
            checkAsteroidOverlapsRect(newCircle)
        ) {
            newCircle = null;
            if (factor < maxR) factor += 1;
            r = maxR / factor;
            mass = 2 / (factor * factor);
            velocity = 1 / (2 * r);
            newCircle = new Circle(
                r + Math.random() * (100 - r * 2),
                r + Math.random() * (100 - r * 2),
                r,
                mass,
                0,
                velocity,
                "gradient",
                canvas
            );
        }
        newCircle.type = "asteroid";
        newCircle.moveAngle = Math.random() * 360;
        const asteroidImage = new Image(); // Create new img element
        asteroidImage.src = "./images/asteroid.png"; // Set source path
        newCircle.image = asteroidImage;
        asteroids.push(newCircle);
        newCircle.myArray = asteroids;
        newCircle.deceleration = 0.999;
        loops++;
    }
};

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

const drawOnce = () => {
    clearCanvas();

    // draw everything
    const everything = [
        ...missiles,
        ...asteroids,
        ...ships,
        ...obstacles,
        ...debris,
    ];
    for (const thing of everything) {
        thing.draw();
    }
};

const showTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    seconds -= 60 * mins;
    const timerText = `${mins}:${padNumber(seconds, 2)}`;
    document.getElementById("timer-box").innerHTML = timerText;
};

const padNumber = (num, size) => {
    let numString = num.toString();
    while (numString.length < size) numString = "0" + numString;
    return numString;
};

const addScore = (points) => {
    score += points;
    const scoreString = padNumber(score, 2);
    // show score
    document.getElementById("score-box").innerHTML = scoreString;
};

function gameLoop(timeStamp) {
    if (!startTime) {
        startTime = timeStamp;
    }
    oldTimeStamp = timeStamp;

    Keys.checkKeys();

    clearCanvas();

    // draw obstacles
    for (const o of obstacles) {
        o.draw();
    }

    // Check Collision
    checkHitObjects();
    checkCirclesHitRectangles();

    // move / draw ships
    console.log('ships: ',ships);
    for (const ship of ships) {
        ship.move();
        keepInBounds(ship);
        ship.draw();
    }

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
        a.draw();
    }

    // move debris
    for (const d of debris) {
        // move this to the GameObject (Circle) class?
        if (timeStamp - d.bornTime > d.lifeSpan) {
            d.destroy();
        }

        d.move();
        // check asteroid hit obstacles
        // for (const o of obstacles) {
        //     // undo overlaps
        //     stopCircleRectOverlap(d, o);
        // }
        d.draw();
    }

    // move missiles
    for (const m of missiles) {
        m.move();
        m.draw();
        // move this to the GameObject (Circle) class?
        if (timeStamp - m.bornTime > m.lifeSpan) {
            m.destroy();
        }
    }
    const timePassed = (timeStamp - startTime) / 1000;
    const secondsLeft = Math.max(0, totalSeconds - timePassed);
    showTime(Math.floor(secondsLeft));

    if (secondsLeft > 0) {
        setTimeout(gameLoop,0);
    } else {
        // End Game
        themeMusic.stop();
        console.log("secs left", secondsLeft);
    }
}

// Point of entry
const asteroids = [];
const missiles = [];
const debris = [];
const obstacles = [];
const ships = [];

// sounds
const laserSound = makeSound("./audio/laser.mp3");
const explodeSound = makeSound("./audio/explode.mp3");
const themeMusic = makeSound("./audio/muvibeat10_130bpm-14340mono.mp3");
themeMusic.loop = true;
//
let score = 0;
let totalSeconds = 61;
let startTime = null;
//
let oldTimeStamp = 0;
const canvas = document.getElementById("game-canvas");
const context = canvas.getContext("2d");
console.log("canvas:", canvas);
setCircleRectCanvas(canvas);

window.addEventListener("keydown", Keys.handleKeyDown);
window.addEventListener("keyup", Keys.handleKeyUp);

// x, y, radius, mass, facing, velocity, color,canvas)
let ShipA = new Ship(50, 95, 2, 2, 270, 0, "#88ccFF", canvas);
const shipImage = new Image(); // Create new img element
shipImage.src = "./images/spaceship.png"; // Set source path
ShipA.image = shipImage;
ships.push(ShipA);
ShipA.myArray = ships;
ShipA.deceleration = 0.98;

/*
let ShipB = new Ship(50, 5, 2, 2, 90, 0,"#CC88FF", canvas);
const shipImage2 = new Image();
shipImage2.src = "./images/spaceship2.png";
ShipB.image = shipImage2;
ships.push(ShipB);
ShipB.myArray = ships;
ShipB.deceleration = 0.98;
*/

generateObstacles();
generateAsteroids();

window.addEventListener("resize", function () {
    const size = Math.min(window.innerWidth, window.innerHeight);
    canvas.width = size;
    canvas.height = size - 4;
    drawOnce();
});
window.dispatchEvent(new Event("resize"));

const startGame = (event) => {
    document.getElementById("start-screen").style.display = "none";
    window.requestAnimationFrame(gameLoop);
    themeMusic.play();
};
document
    .getElementById("start-screen")
    .addEventListener("pointerdown", startGame);
