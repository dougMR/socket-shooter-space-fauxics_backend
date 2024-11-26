import { Circle } from "./module-class-circle.js";
import { degreesToRadians } from "./module-angles.js";
import { players } from "./module-players.js";

class Ship extends Circle {
    constructor(x, y, radius, mass, facing, velocity, color, myArray) {
        super(x, y, radius, mass, facing, velocity, color, myArray);
        this._thrusting = false;
        // v determine whether we can store an html element (img) on the backend?
        //   meanwhile, keep an array of ship images on front end, and store its index here
        this._imageIndex = null;
        this._deceleration = 0.98;
        this._alive = true;
        this._type = "ship";
        this._color = color;
        this._mass = 4;
        this.value = 5;
    }
    destroy() {
        const p = players.find((p) => p.ship === this);
        this.alive = false;
        super.destroy();
    }

    get alive() {
        return this._alive;
    }
    set alive(value) {
        this._alive = value;
    }

    get imageIndex() {
        return this._imageIndex;
    }
    set imageIndex(value) {
        this._imageIndex = value;
    }

    get deceleration() {
        return this._deceleration;
    }
    set deceleration(value) {
        return this._deceleration;
    }

    get thrusting() {
        return this._thrusting;
    }
    set thrusting(value) {
        this._thrusting = value;
    }

    get clientVersion() {
        const shipObject = Object.assign({}, super.clientVersion, {
            x: this._x,
            y: this._y,
            radius: this._radius,
            facing: this._facing,
            image: this._image,
            color: this._color,
            thrusting: this._thrusting,
            alive: this._alive,
            playerId: this.playerId,
            mass: this._mass,
        });
        return shipObject;
    }
}

export { Ship };
