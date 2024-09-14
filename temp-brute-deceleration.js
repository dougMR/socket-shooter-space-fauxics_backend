console.log("temp-brute-deceleration.js");
// deceleration distance formula
// v0 = initial velocity
// deceleration = percent of v0 v is changed by each step
const getDecelerationDistance = (v, decelPercent) => {
    // decelPercent is the number we multiply v0 by each step (eg. .99)
    let distance = 0;
    let numLoops = 0;
    while (v > 0.01) {
        distance += v;
        v *= decelPercent;
        numLoops++;
    }
    // console.log("distance: ", distance);
    // console.log("numLoops:", numLoops);
    return distance;
};

const getInitialVelocityFromDistanceAndDeceleration = (
    distance,
    deceleration
) => {
    // here, we don't control the time it will take
    // const secs = 2;
    // const frames = secs * 60;
    // deceleration = Math.pow(0.01,(1 / frames));
    // console.log("-----------------")
    // console.log("deceleration: ",deceleration);
    // console.log("distance:",distance);
    // distance = 30;
    // deceleration = 0.99;
    const v0 = -1 * distance * Math.log(deceleration);
    // console.log("v0:",v0);
    // const willTravel = v0 / Math.log(deceleration);
    // console.log("willTravel: ",willTravel);
    return v0;
};

const getInitialVelocityUsingConstantDeceleration = (targetDist, seconds) => {
    const v0 = (2 * targetDist) / (seconds * 60);
    return v0;
};
const getInitialVelocityFromDistanceAndDecelerationBruteForce = (
    targetDist,
    decelPercent
) => {
    let v0 = 0.02;
    let d = 0;
    let loops = 0;
    while (d < targetDist * 0.99) {
        //} || d > targetDist * 1.05) {
        // v0 += 0.1;
        v0 *= 1.1;
        d = getDecelerationDistance(v0, decelPercent);
        // console.log("d:", d);
        loops++;
        if (loops > 1000) {
            console.log("over 10000 loops");
            console.log("v0: ", v0);
            v0 = -1;
            break;
        }
    }
    // console.log("Total Loops: ", loops);
    // console.log("to travel ", targetDist, "(", d, "), v0 = ", v0);
    // console.log("v0:", v0);
    return v0;
};

// console.log("Calc");
// getInitialVelocityFromDistanceAndDeceleration(200, 0.95);
// console.log("Brute");
// getInitialVelocityFromDistanceAndDecelerationBruteForce(200, 0.95);

export { getInitialVelocityFromDistanceAndDeceleration };
