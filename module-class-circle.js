import {
    getCos,
    getSin,
    radiansToDegrees,
    degreesToRadians,
} from "./module-angles.js";

// class Rectangle {
//     constructor(height, width) {
//         this.height = height;
//         this.width = width;
//     }
//     // Getter
//     get area() {
//         return this.calcArea();
//     }
//     // Method
//     calcArea() {
//         return this.height * this.width;
//     }
// }

class Circle {
    constructor(x, y, radius, mass, facing, velocity, color) {
        this._x = x;
        this._y = y;
        this._radius = radius;
        this._mass = mass;
        this._moveAngle = this._facing = facing;
        this._velocity = velocity;

        this._color = color;
        this._image = null;
        this._type = "none";
        this._myArray = null;
        this._deceleration = 1;

        this._value = 0;

        // this.getCoordByPct = (pct) => {
        //     // console.log('this._canvas.width',this._canvas.width);
        //     return pct * this._canvas.width * 0.01;
        // };
        // this.getPctByCoord = (coord) => {
        //     return (coord / this._canvas.width) * 100;
        // };
        this.rotate = (degrees) => {
            this.facing += degrees;
        };
        this.thrust = (amount) => {
            const thrustX = getCos(this._facing) * amount;
            const thrustY = getSin(this._facing) * amount;
            this.vx += thrustX;
            this.vy += thrustY;
            // this.velocity = Math.max(-1, Math.min(1, this.velocity));
            this.velocity = Math.max(-0.4, Math.min(0.4, this.velocity));
        };
        this.decelerate = () => {
            this.velocity *= this._deceleration;
            if (Math.abs(this._velocity) < 0.01) {
                this.velocity = 0;
            }

            // this.velocity -= 0.0005;
            // if(Math.abs(this._velocity)<0.001){
            //     this.velocity = 0;
            // }
        };

        this.set_velocity = (value) => {
            this._velocity = value;
            this._vx = this._velocity * getCos(this._moveAngle);
            this._vy = this._velocity * getSin(this._moveAngle);
        };
        this.get_vx = () => {
            return this._velocity * getCos(this._moveAngle);
        };
        this.get_vy = () => {
            return this._velocity * getSin(this._moveAngle);
        };
        this.set_vx = (value) => {
            this._vx = value;
            this._moveAngle = radiansToDegrees(Math.atan2(this._vy, this._vx));
            this._velocity = Math.sqrt(
                Math.pow(this._vx, 2) + Math.pow(this._vy, 2)
            );
        };
        this.set_vy = (value) => {
            this._vy = value;
            this._moveAngle = radiansToDegrees(Math.atan2(this._vy, this._vx));
            this._velocity = Math.sqrt(
                Math.pow(this._vx, 2) + Math.pow(this._vy, 2)
            );
        };
        this._vx = this.get_vx();
        this._vy = this.get_vy();
    }

    destroy() {
        if (this._myArray) {
            const myIndex = this._myArray.findIndex((item) => item === this);
            if (myIndex > -1) this._myArray.splice(myIndex, 1);
        }

        if (this._image) {
            delete this._image;
            this._image = null;
        }
        delete this;
    }

    move(distance) {
        if (distance) this.velocity = distance;
        this.x += this.vx;
        this.y += this.vy;
        if (this._deceleration < 1) this.decelerate();
    }

    /*
    draw() {
        const ctx = this._ctx;
        const x = this.getCoordByPct(this._x);
        const y = this.getCoordByPct(this._y);
        const radius = this.getCoordByPct(this._radius);
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
            ctx.beginPath();
            ctx.arc(0, 0, radius, 0, 2 * Math.PI);
            ctx.closePath();
            if (this.color === "gradient") {
                // Create Radial
                const grd = ctx.createRadialGradient(
                    this.getCoordByPct(this.radius * 0.2),
                    this.getCoordByPct(-this.radius * 0.2),
                    this.getCoordByPct(this.radius * 0.1),
                    0,
                    0,
                    this.getCoordByPct(this.radius)
                );
                grd.addColorStop(0, "pink");
                grd.addColorStop(1, "brown");
                ctx.fillStyle = grd;
            } else {
                ctx.fillStyle = this._color;
            }
            ctx.fill();
        }

        //
        ctx.rotate(-degreesToRadians(this._facing));
        ctx.translate(-x, -y);
    }
    */
    get value() {
        return this._value;
    }
    set value(value){
        this._value = value;
    }
    get x() {
        return this._x;
    }
    set x(value) {
        this._x = value;
    }
    get y() {
        return this._y;
    }
    set y(value) {
        this._y = value;
    }
    get radius() {
        return this._radius;
    }
    set radius(value) {
        this._radius = value;
    }
    get mass() {
        return this._mass;
    }
    set mass(value) {
        this._mass = value;
    }
    get facing() {
        return this._facing;
    }
    set facing(value) {
        this._facing = (value + 360) % 360;
    }
    get moveAngle() {
        return this._moveAngle;
    }
    set moveAngle(value) {
        this._moveAngle = (value + 360) % 360;
    }
    get radians() {
        return degreesToRadians(this._moveAngle);
    }
    get velocity() {
        return this._velocity;
    }
    set velocity(value) {
        this.set_velocity(value);
    }
    get color() {
        return this._color;
    }
    set color(value) {
        this._color = value;
    }
    get vx() {
        return this.get_vx();
    }
    set vx(value) {
        this.set_vx(value);
    }
    get vy() {
        return this.get_vy();
    }
    set vy(value) {
        this.set_vy(value);
    }
    get image() {
        return this._image;
    }
    set image(value) {
        this._image = value;
        console.log("set Image", value.src);
    }
    get type() {
        return this._type;
    }
    set type(value) {
        this._type = value;
    }
    get myArray() {
        return this._myArray;
    }
    set myArray(value) {
        if (this._myArray) {
            // remove from old array
            const index = this._myArray.this._myArray.findIndex(
                (item) => item === this
            );
            if (index > -1) {
                this._myArray.splice(index, 1);
            }
        }
        this._myArray = value;
        // add to new array
        this._myArray.push(this);
    }
    set deceleration(value) {
        this._deceleration = value;
    }

    get clientVersion() {
        const circleObject = {
            x: this._x,
            y: this._y,
            radius: this._radius,
            facing: this._facing,
            radians: this.radians,
            image: this._image,
            color: this._color,
            type: this._type,
        };
        return circleObject;
    }
}
export { Circle };
