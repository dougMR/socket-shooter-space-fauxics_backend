function Line(x, y, length, degrees, weight, color) {
    let _x = x,
        _y = y,
        _length = length,
        _degrees = degrees,
        _weight = weight,
        _color = color;
    const instance = {
        x: (value) => {
            if (value) {
                _x = value;
            } else {
                return _x;
            }
        },
        y: (value) => {
            if (value) {
                _y = value;
            } else {
                return _y;
            }
        },
        length: (value) => {
            if (value) {
                _length = value;
            } else {
                return _length;
            }
        },
        degrees: (value) => {
            if (value) {
                _degrees = value;
            } else {
                return _degrees;
            }
        },
        weigth: (value) => {
            if (value) {
                _weight = value;
            } else {
                return _weight;
            }
        },
        color: (value) => {
            if (value) {
                _color = value;
            } else {
                return _color;
            }
        },
    };
}