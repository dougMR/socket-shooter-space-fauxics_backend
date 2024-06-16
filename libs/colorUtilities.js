//--------------------------------------------------------
//
//    Other Utilities
//
//--------------------------------------------------------

function randomString(len) {
    var text = "";
    var possible =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < len; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

function dtor(d) {
    return (d * Math.PI) / 180;
}

function stripWhiteSpace(str) {
    var ns = str.replace(/\s+/g, "");
    return ns;
}

function trimWhiteSpace(str) {
    var trimmed = str.replace(/(^\s+|\s+$)/g, "");
    return trimmed;
}

function removeClass(element, className) {
    // var reg = new RegExp('(\\s|^)'+className+'(\\s|$)');
    // element.className = element.className.replace(reg,'');
    element.className = element.className.replace(className, "");
    if (element.className.charAt(element.className.length - 1) === " ") {
        element.className = element.className.substring(
            0,
            element.className.length - 1
        );
    }
}
function addClass(element, className) {
    if (element.className.indexOf(className) === -1) {
        element.className += " " + className;
    }
}

//--------------------------------------------------------
//
//    Color Utility
//
//--------------------------------------------------------

function randomHexColor() {
    var hex = Math.floor(Math.random() * 16777215).toString(16);
    while (hex.length < 6) {
        hex = "0" + hex;
    }
    return "#" + hex;
}

function hexToRgb(hex) {
    // return {r:(hex & "#ff0000") >> 16,g:(hex & "#00ff00") >> 8,b:hex & "#0000ff"};
    return { r: hexToR(hex), g: hexToG(hex), b: hexToB(hex) };
}
function hexToR(h) {
    return parseInt(cutHex(h).substring(0, 2), 16);
}
function hexToG(h) {
    return parseInt(cutHex(h).substring(2, 4), 16);
}
function hexToB(h) {
    return parseInt(cutHex(h).substring(4, 6), 16);
}
function cutHex(h) {
    return h.charAt(0) == "#" ? h.substring(1, 7) : h;
}

function rgbToHex(r, g, b) {
    // return(r<<16 | g<<8 | b);
    var hex = "#";
    var rgb = [r, g, b];
    for (var i in rgb) {
        var str = Number(rgb[i]).toString(16);
        str = str.length == 1 ? "0" + str : str;
        hex += str;
    }
    return hex;
}

// function to_rgb(r, g, b) { return "#" + convert(r) + convert(g) + convert(b); }

function brightenColor(hexColor, percent) {
    hexColor = toHex(hexColor);
    if (isNaN(percent)) percent = 0;
    if (percent > 100) percent = 100;
    if (percent < 0) percent = 0;

    var factor = percent / 100;
    var rgb = hexToRgb(hexColor);

    rgb.r += (255 - rgb.r) * factor;
    rgb.b += (255 - rgb.b) * factor;
    rgb.g += (255 - rgb.g) * factor;

    return rgbToHex(Math.round(rgb.r), Math.round(rgb.g), Math.round(rgb.b));
}

function darkenColor(hexColor, percent) {
    if (isNaN(percent)) percent = 0;
    if (percent > 100) percent = 100;
    if (percent < 0) percent = 0;

    var factor = 1 - percent / 100;
    var rgb = hexToRgb(hexColor);

    rgb.r *= factor;
    rgb.b *= factor;
    rgb.g *= factor;

    return rgbToHex(Math.round(rgb.r), Math.round(rgb.g), Math.round(rgb.b));
}

function mixHexColors(c1, c2, percent) {
    // percent towards 2 from 1
    var rgb1 = hexToRgb(c1);
    var rgb2 = hexToRgb(c2);

    var r = Math.round((rgb2.r * percent + rgb1.r * (100 - percent)) / 100);
    var g = Math.round((rgb2.g * percent + rgb1.g * (100 - percent)) / 100);
    var b = Math.round((rgb2.b * percent + rgb1.b * (100 - percent)) / 100);

    return rgbToHex(r, g, b);
}

function hexToRgbaString(hexColor, alpha) {
    var rgba = hexToRgb(hexColor);
    rgba.a = alpha;
    return (
        "rgba(" + rgba.r + ", " + rgba.g + ", " + rgba.b + ", " + alpha + ")"
    );
}

function rgbaTextSetAlpha(rgba_txt, newAlpha) {
    var rgba_obj = rgbaTextToObject(rgba_txt);
    rgba_obj.a = newAlpha;

    return rgbaObjectToText(rgba_obj);
}

function setAlpha(color, newAlpha) {
    if (typeof color === "string") {
        var isHex = color.substring(0, 1) === "#";
        if (isHex) {
            return rgbaTextSetAlpha(hexToRgbaString(color), newAlpha);
        } else {
            return rgbaTextSetAlpha(color, newAlpha);
        }
    } else if (typeof color === "object") {
        color.a = newAlpha;
        return color;
    }
}

function toHex(color) {
    if (typeof color === "string") {
        if (isHex(color)) {
            return color;
        } else {
            color = rgbaTextToObject(color);
        }
    }
    if (typeof color === "object") {
        return rgbToHex(color.r, color.g, color.b);
    }
}
function isHex(color) {
    return color.substring(0, 1) === "#";
}

function getRGB(color) {
    if (typeof color === "string") {
        var isHex = color.substring(0, 1) === "#";
        if (isHex) {
            return rgbaTextToObject(hexToRgbaString(color));
        } else {
            return rgbaTextToObject(color);
        }
    } else if (typeof color === "object") {
        return color;
    }
}

function rgbaObjectToText(rgba_obj) {
    return (
        "rgba(" +
        rgba_obj.r +
        ", " +
        rgba_obj.g +
        ", " +
        rgba_obj.b +
        ", " +
        rgba_obj.a +
        ")"
    );
}

function rgbaTextToObject(rgba_txt) {
    var rgba_ar = rgba_txt.replace(/[^\d\.,]/g, "").split(",");
    if (rgba_ar[3] == undefined || rgba_ar[3] == null || rgba_ar[3] == "") {
        // rgb, no alpha
        // make alpha 100%
        rgba_ar[3] = 1;
    }
    var rgba_obj = {
        r: Number(rgba_ar[0]),
        g: Number(rgba_ar[1]),
        b: Number(rgba_ar[2]),
        a: Number(rgba_ar[3]),
    };
    return rgba_obj;
}

function getHexColor(color) {
    if (typeof color === "string") {
        var isHex = color.substring(0, 1) === "#";
        if (isHex) {
            return color;
        } else {
            color = rgbaTextToObject(color);
        }
    }
    if (typeof color === "object") {
        var rgb = [color.r, color.g, color.b];
        var hex = "#";
        for (var i in rgb) {
            var str = Number(rgb[i]).toString(16);
            str = str.length == 1 ? "0" + str : str;
            hex += str;
        }
        return hex;
    }
}
function getAlpha(color) {
    if (typeof color === "string") {
        var isHex = color.substring(0, 1) === "#";
        if (isHex) {
            return 1;
        } else {
            color = rgbaTextToObject(color);
        }
    }
    if (typeof color === "object") {
        if (typeof color.a != "number") {
            color.a = 1;
        }
        return color.a;
    }
    return 1;
}

function multiply(topValue, bottomValue) {
    return (topValue * bottomValue) / 255;
}

function invertColor(hex) {
    hex = getHexColor(hex);

    if (hex.length != 7 || hex.indexOf("#") != 0) {
        return null;
    }

    inverse =
        "#" +
        pad((255 - parseInt(hex.substring(1, 3), 16)).toString(16)) +
        pad((255 - parseInt(hex.substring(3, 5), 16)).toString(16)) +
        pad((255 - parseInt(hex.substring(5, 7), 16)).toString(16));
    return inverse;
}

function pad(num) {
    if (num.length < 2) {
        return "0" + num;
    } else {
        return num;
    }
}

export { setAlpha, darkenColor, mixHexColors, brightenColor };
