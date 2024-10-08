import { getCos, getSin, degreesToRadians } from "./module-angles.js";

class Rectangle {
    constructor(x, y, width, height, color) {
        // console.log('x,y',x,y)
        this._x = x;
        this._y = y;
        this._height = height;
        this._width = width;
        this._rotation = 0; // degrees
        this._color = color;
        // this._canvas = canvas;
        // this._ctx = canvas.getContext("2d");
        this.setVertices = () => {
            let tl, tr, br, bl;
            tl = { x: this._x, y: this._y };

            const trx = tl.x + getCos(this._rotation) * this._width;
            const tryCoord = tl.y + getSin(this._rotation) * this._width;

            const brx = trx + getCos(this._rotation + 90) * this._height;
            const bry = tryCoord + getSin(this._rotation + 90) * this._height;

            const blx = brx - getCos(this._rotation) * this._width;
            const bly = bry - getSin(this._rotation) * this._width;
            this._vertices = [
                { x: tl.x, y: tl.y },
                { x: trx, y: tryCoord },
                { x: brx, y: bry },
                { x: blx, y: bly },
            ];
            // console.log('vertices:',this._vertices);
            this.setRelativeVertices();
        };
        this.setRelativeVertices = () => {
            this._relativeVertices = [];
            for (const v of this._vertices) {
                this._relativeVertices.push({
                    x: v.x - this._x,
                    y: v.y - this._y,
                });
            }
        };
        this.getExpandedSides = (distance) => {
            // return 4 segments
            // each the same length as the sides,
            // parallel to the sides, at distance outside the rectangle
            const v = this._vertices;
            const vertCos = getCos(this._rotation + 90);

            const vertSin = getSin(this._rotation + 90);
            const horzCos = getCos(this._rotation);
            const horzSin = getSin(this._rotation);
            //
            const tx1 = v[0].x - vertCos * distance;
            const ty1 = v[0].y - vertSin * distance;
            const tx2 = v[1].x - vertCos * distance;
            const ty2 = v[1].y - vertSin * distance;

            const rx1 = v[1].x + horzCos * distance;
            const ry1 = v[1].y + horzSin * distance;
            const rx2 = v[2].x + horzCos * distance;
            const ry2 = v[2].y + horzSin * distance;
            //
            const bx1 = v[2].x + vertCos * distance;
            const by1 = v[2].y + vertSin * distance;
            const bx2 = v[3].x + vertCos * distance;
            const by2 = v[3].y + vertSin * distance;
            //
            const lx1 = v[3].x - horzCos * distance;
            const ly1 = v[3].y - horzSin * distance;
            const lx2 = v[0].x - horzCos * distance;
            const ly2 = v[0].y - horzSin * distance;

            return [
                { x1: tx1, y1: ty1, x2: tx2, y2: ty2 },
                { x1: rx1, y1: ry1, x2: rx2, y2: ry2 },
                { x1: bx1, y1: by1, x2: bx2, y2: by2 },
                { x1: lx1, y1: ly1, x2: lx2, y2: ly2 },
            ];
        };
        // this.getCoordByPct = (pct) => {
        //     return pct * this._canvas.width * 0.01;
        // };
        /*
        this.draw = () => {
            // console.log('facing:',this._rotation);
            const ctx = this._ctx;
            // const verts = this._relativeVertices;
            const x = this.getCoordByPct(this._x);
            const y = this.getCoordByPct(this._y);
            const w = this.getCoordByPct(this._width);
            const h = this.getCoordByPct(this._height);
            //
            ctx.translate(x, y);
            ctx.rotate(degreesToRadians(this._rotation));

            // //
            // ctx.beginPath();
            // ctx.moveTo(0, 0);
            // ctx.lineWidth = 1;
            // // tr
            // ctx.lineTo(
            //     this.getCoordByPct(verts[1].x),
            //     this.getCoordByPct(verts[1].y)
            // );
            // // br
            // ctx.lineTo(
            //     this.getCoordByPct(verts[2].x),
            //     this.getCoordByPct(verts[2].y)
            // );
            // // bl
            // ctx.lineTo(
            //     this.getCoordByPct(verts[3].x),
            //     this.getCoordByPct(verts[3].y)
            // );
            // // tl
            // ctx.lineTo(
            //     this.getCoordByPct(verts[0].x),
            //     this.getCoordByPct(verts[0].y)
            // );
            // tr
            // ctx.lineTo(this.getCoordByPct(this._width), 0);
            // // br
            // ctx.lineTo(
            //     this.getCoordByPct(this._width),
            //     this.getCoordByPct(this._height)
            // );
            // // bl
            // ctx.lineTo(0, this.getCoordByPct(this._height));
            // // tl
            // ctx.lineTo(0, 0);
            // ctx.rect(
            //     0,
            //     0,
            //     this.getCoordByPct(this._width),
            //     this.getCoordByPct(this._height)
            // );
            // ctx.strokeRect(0,0,this.getCoordByPct(verts[2].x),this.getCoordByPct(verts[2].y))

            // ctx.closePath();
            // ctx.strokeStyle = darkenColor(this._color, 30);
            // ctx.lineWidth = 4;
            // ctx.stroke();
            // ctx.fillStyle=this._color;
            // ctx.fill();

            ctx.strokeStyle = darkenColor(this._color, 30);
            ctx.lineWidth = 4;
            ctx.strokeRect(0,0,w,h);
            //
            
            const gradient = ctx.createLinearGradient(
                w * 0.4,
                0,
                w * 0.6,
                h
            );

            // Add three color stops
            gradient.addColorStop(0, this._color);
            gradient.addColorStop(0.48, brightenColor(this._color, 50));
            gradient.addColorStop(0.52, darkenColor(this._color, 50));
            gradient.addColorStop(1, this._color);

            // Set the fill style and draw a rectangle
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, w, h);
            //
            
            ctx.rotate(degreesToRadians(-this._rotation));
            ctx.translate(-x, -y);
        };
        */
        //
        this.setVertices();
    }


    // Getters / Setters
    get width() {
        return this._width;
    }
    set width(value) {
        this._width = value;
        this.setVertices();
    }
    get height() {
        return this._height;
    }
    set height(value) {
        this._height = value;
        this.setVertices();
    }
    get rotation() {
        return this._rotation;
    }
    set rotation(value) {
        // console.log(value);
        this._rotation = (360 + value) % 360;
        // console.log(this._rotation)
        this.setVertices();
    }
    set x(value){
        this._x = value;
    }
    set y(value){
        this._y = value;
    }
    get vertices() {
        return this._vertices;
    }
    get clientVersion() {
        const rectObject = {
            x: this._x,
            y: this._y,
            width: this._width,
            height: this._height,
            rotation: this._rotation,
            image: this._image,
            color: this._color,
        };
        return rectObject;
    }
}

export { Rectangle };
