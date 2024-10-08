import { Circle } from "./module-class-circle.js";
import { getInitialVelocityFromDistanceAndDeceleration } from "./temp-brute-deceleration.js";

class Shockwave extends Circle {
    constructor(x, y, radius) {
        super(x, y, radius, 0, 0, 0, "#000000");
        this._type = "shockwave";
        this._deceleration = 0.9;
        this._finalWaveRadius = 20;
        this.velocity = getInitialVelocityFromDistanceAndDeceleration(
            this._finalWaveRadius,
            this._deceleration
        );
        console.log("new Shockwave velocity: ", this.velocity);
        console.log(this);
    }

    move() {
        // super.move(distance);
        this.radius += this.velocity;
        if (this._deceleration < 1) this.decelerate();
        if (this.radius >= this._finalWaveRadius * 0.9) {
            this.destroy();
        }
    }

    checkCollision(gameObject) {
        const xDiff = gameObject.x - this.x;
        const yDiff = gameObject.y - this.y;
        const diffSq = Math.pow(xDiff, 2) + Math.pow(yDiff, 2);
        if (diffSq > Math.pow(this._finalWaveRadius, 2)) return false;
        const velocitySq = Math.pow(gameObject.velocity, 2);
        const r0Sq = Math.pow(this.radius - this.velocity, 2) - velocitySq;
        const r1Sq = Math.pow(this.radius, 2) + velocitySq;
        // is point inside shockwave?
        const waveCrossedGO = diffSq > r0Sq && diffSq < r1Sq;
        return waveCrossedGO;
        // return diffSq < r1Sq;
    }

    get clientVersion() {
        const missileObject = {
            x: this._x,
            y: this._y,
            radius: this._radius,
            velocity: this._velocity,
            facing: this._facing,
            radians: this.radians,
            image: this._image,
            color: this._color,
        };
        return missileObject;
    }
}

export { Shockwave };
