/* Minimum Path Sum in a Triangle

Given a triangle, find the minimum path sum from top to bottom.
In each step of the path, you may only move to adjacent numbers in the row below.
The triangle is represented as a 2D array of numbers.
*/


// Thank you https://stackoverflow.com/questions/62246893/javascript-read-bit-value-is-single-bit-on-1-or-off-0
function getStepOnPath(rows, route, step) {
    let binary = route.toString(2).padStart(rows, "0");
    return (binary[(binary.length - 1) - step] == "1"); // read it right-to-left.
}

/**
 * @param {NS} ns
 * @param {Array} triangle
 */
export function solver(ns, triangle) {
    let minCost = Number.POSITIVE_INFINITY;
    let rows = triangle.length;

    // Go through all possible routes.
    for (let i = 0; i < 2 ** rows; i++) {
        let costSoFar = triangle[0][0];
        let column = 0;

        // Debug
        let steps = Array();
        let prnt = `Checking route number ${i}, which in binary is: ${i.toString(2).padStart(rows, "0")}, steps taken: `;

        // Go through all steps on this particular route.
        for (let step = 1; step < rows; step++) {
            prnt += getStepOnPath(rows, i, step) ? '1' : 0; // Debug
            if (getStepOnPath(rows, i, step)) {
                column++;
            }
            costSoFar += triangle[step][column];
            steps.push(triangle[step][column]); //Debug
        }

        ns.print(`${prnt}. Cost: ${steps.join('+')}=${costSoFar}`);

        // Is this the cheapest route so far?
        if (minCost > costSoFar) {
            // Save this as our new cheapest route.
            minCost = costSoFar;
        }
    }

    return minCost;
}

/** @param {NS} ns **/
export async function main(ns) {
    ns.tprint(solver(ns, JSON.parse(ns.args[0])));
}