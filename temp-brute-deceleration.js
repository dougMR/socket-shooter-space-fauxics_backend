// deceleration distance formula
// v0 = initial velocity
// deceleration = percent of v0 v is changed by each step
const getDecelerationDistance = (v, decelPercent) => {
    // decelPercent is the number we multiply v0 by each step (eg. .99)
    let distance = 0;
    let numLoops = 0;
    while (v > 0.5) {
        distance += v;
        v *= decelPercent;
        numLoops++;
    }
    // console.log("distance: ", distance);
    // console.log("numLoops:", numLoops);
    return distance;
};
const getInitialVelocityFromDistanceAndDeceleration = (
    targetDist,
    decelPercent
) => {
    let v0 = 0.02;
    let d = 0;
    let loops = 0;
    while (d < targetDist * 0.95){ //} || d > targetDist * 1.05) {
        // v0 += 0.1;
        v0 *= 1.05
        d = getDecelerationDistance(v0, decelPercent);
        // console.log("d:", d);
        loops++;
        if (loops > 1000) {
            console.log("over 10000 loops");
            console.log("v0: ",v0)
            v0 = -1;
            break;
        }
    }
    console.log("Total Loops: ", loops);
    console.log("to travel ", targetDist, "(", d, "), v0 = ", v0);
    return v0;
};

export { getInitialVelocityFromDistanceAndDeceleration };
