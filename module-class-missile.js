import { Circle } from "./module-class-circle.js";
import { degreesToRadians } from "./module-angles.js";

class Missile extends Circle {
    constructor(x, y, radius, mass, facing, velocity, color) {
        super(x, y, radius, mass, facing, velocity, color);
        this._thrusting = false;
        this._xyHistory = [];
    }

    move(distance) {
        super.move();
        this._xyHistory.unshift({
            x: this._x,
            y: this._y,
            radians: this.radians,
        });
        if (this._xyHistory.length > 20) this._xyHistory.length = 20;
    }

    // draw() {
    //     const ctx = this._ctx;
    //     // const x = this.getCoordByPct(this._x);
    //     // const y = this.getCoordByPct(this._y);
    //     const radius = this.getCoordByPct(this._radius);
    //     // rotate, translate
    //     // ctx.translate(x, y);
    //     // ctx.rotate(degreesToRadians(this._facing));
    //     //
    //     if (this._image !== null) {
    //         ctx.drawImage(
    //             this._image,
    //             -radius,
    //             -radius,
    //             radius * 2,
    //             radius * 2
    //         );
    //     } else {
    //         // console.log("xyHistory: ",this._xyHistory.length)
    //         for (let i = 0; i < this._xyHistory.length; i++) {
    //             // console.log('this._xyHistory[i].x - this._x',this._xyHistory[i].x - this._x)
    //             // Circle
    //             // const dx = this._xyHistory[i].x;
    //             // const dy = this._xyHistory[i].y;
    //             const x = this.getCoordByPct(this._xyHistory[i].x);
    //             const y = this.getCoordByPct(this._xyHistory[i].y);
    //             ctx.beginPath();

    //             ctx.arc(x, y, radius - radius * (0.025 * i), 0, 2 * Math.PI);
    //             // ctx.lineWidth = 1;
    //             // ctx.strokeStyle = setAlpha(this._color, 1 - i * 0.1);
    //             // ctx.stroke();
    //             ctx.fillStyle = setAlpha(this._color, 1 - i * 0.1);
    //             ctx.fill();
    //         }
    //     }
    //     // un-rotate / un-translate
    //     // ctx.rotate(-degreesToRadians(this._facing));
    //     // ctx.translate(-x, -y);
    // }

    get clientVersion() {
        const missileObject = Object.assign({}, super.clientVersion, {
            x: this._x,
            y: this._y,
            radius: this._radius,
            facing: this._facing,
            radians: this.radians,
            image: this._image,
            color: this._color,
            xyHistory: this._xyHistory,
            mass: this._mass,
        });
        return missileObject;
    }
}

export { Missile };
