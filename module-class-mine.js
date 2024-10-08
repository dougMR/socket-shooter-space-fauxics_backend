import { Circle } from "./module-class-circle.js";


class Mine extends Circle {
    constructor(x, y, radius, mass, facing, velocity, color) {
        super(x, y, radius, mass, facing, velocity, color);
        this.mass = 10;
        this._radius = 1.5;
        this._thrusting = false;
        this._color = "#cc0000";
        this._mass = 8;
        this._type = "mine";
        this._deceleration = 0.98;
    }

    move(distance) {
        super.move();
        // this._xyHistory.unshift({ x: this._x, y: this._y, radians: this.radians });
        // if (this._xyHistory.length > 20) this._xyHistory.length = 20;
    }

    get clientVersion() {

        const missileObject = {
            x: this._x,
            y: this._y,
            radius: this._radius,
            facing: this._facing,
            radians: this.radians,
            image: this._image,
            color: this._color,
        };
        return missileObject;
    }
}

export { Mine };
