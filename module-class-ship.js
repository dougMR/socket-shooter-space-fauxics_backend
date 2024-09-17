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
    }
    destroy() {
        const p = players.find((p) => p.ship === this);
        this.alive = false;
        super.destroy();
    }
    /*    draw() {
        // super.draw();
        const x = this.getCoordByPct(this._x);
        const y = this.getCoordByPct(this._y);
        const radius = this.getCoordByPct(this._radius);
        // rotate, translate
        ctx.translate(x, y);
        ctx.rotate(degreesToRadians(this._facing));
        //
        if (this._image !== null) {
            ctx.drawImage(
                this._image,
                -radius,
                -radius,
                radius * 2,
                radius * 2
            );

        } else {
            // Circle
            ctx.beginPath();
            ctx.arc(0, 0, radius, 0, 2 * Math.PI);
            ctx.closePath();
            ctx.strokeStyle = this._color;
            ctx.stroke();
            // SHip
            ctx.beginPath();
            ctx.moveTo(radius, 0);
            ctx.lineTo(-radius, 0.7 * radius);
            ctx.lineTo(-radius, -0.7 * radius);
            ctx.lineTo(radius, 0);
            ctx.closePath();
            ctx.fillStyle = this._color;
            ctx.fill();
        }
        if(this.thrusting){

            ctx.moveTo(-radius,-radius * 0.3);
            ctx.beginPath();
            ctx.lineTo(-radius,radius*0.3);
            ctx.lineTo(-radius*1.3,0);
            ctx.lineTo(-radius,-radius * 0.3);
            ctx.fillStyle = "yellow";
            ctx.fill();

        }

        // un-rotate / un-translate
        ctx.rotate(-degreesToRadians(this._facing));
        ctx.translate(-x, -y);
    }
        */

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
        const shipObject = {
            x: this._x,
            y: this._y,
            radius: this._radius,
            facing: this._facing,
            image: this._image,
            color: this._color,
            thrusting: this._thrusting,
            alive: this._alive,
            playerId: this.playerId,
        };
        return shipObject;
    }
}

export { Ship };
