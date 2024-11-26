import { asteroids, obstacles } from "./server.js";
import { Circle } from "./module-class-circle.js";
import { Rectangle } from "./module-class-rectangle.js";
import { checkAsteroidsOverlap } from "./module-collision.js";
import { getCircleRectIntersect } from "./module-circle-rect-intersect.js";
import { getCos, getSin } from "./module-angles.js";

// Generate game pieces
//
/////////////////////////

const createObstacle = (x, y, w, h, rot) => {
    const obstacleColor = "#293d61"; // "#3E2B68"; // "#5577cc"
    const newRect = new Rectangle(x, y, w, h, obstacleColor);
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

const generateAsteroids = (numAsteroids) => {
    let loops = 0;
    let amount = numAsteroids || 10;
    while (loops < amount) {
        // x, y, radius, mass, facing, velocity, color)
        const maxR = 4;
        // let factor = 1; //+ Math.round(Math.random() * (maxR - 1));
        // let r = maxR / factor;
        let r = maxR;
        // let mass = 2 / (factor * factor);
        let mass = (r * r) / 2;

        let velocity = 2 / (2 * r);
        let newCircle = new Circle(
            r + Math.random() * (100 - r * 2),
            r + Math.random() * (100 - r * 2),
            r,
            mass,
            // 3,1,
            0,
            velocity,
            "gradient"
        );
        while (
            checkAsteroidsOverlap(newCircle) ||
            checkAsteroidOverlapsRect(newCircle)
        ) {
            newCircle = null;
            // if (factor < maxR) factor += 1;
            // r = maxR / factor;
            if (r > 2) r--;
            mass = (r * r) / 2;
            velocity = 1 / (2 * r);
            newCircle = new Circle(
                r + Math.random() * (100 - r * 2),
                r + Math.random() * (100 - r * 2),
                r,
                mass,
                0,
                velocity,
                "gradient"
            );
        }
        // console.log("Asteroid mass:",mass);
        newCircle.type = "asteroid";
        newCircle.value = 5 - newCircle.radius;
        newCircle.moveAngle = Math.random() * 360;
        // const asteroidImage = new Image(); // Create new img element
        // asteroidImage.src = "./images/asteroid.png"; // Set source path
        // newCircle.image = asteroidImage;
        // asteroids.push(newCircle);
        newCircle.myArray = asteroids;
        newCircle.deceleration = 0.999;
        loops++;
    }
};

export { generateAsteroids, generateObstacles };
