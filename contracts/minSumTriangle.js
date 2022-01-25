/* Minimum Path Sum in a Triangle

Given a triangle, find the minimum path sum from top to bottom.
In each step of the path, you may only move to adjacent numbers in the row below.
The triangle is represented as a 2D array of numbers.
*/




/**
 * @param {Array} triangle
 */
export function solver(triangle) {
    let minCost = Number.POSITIVE_INFINITY;
    const rows = triangle.length;

    // Go through all possible routes.
    for (let i = 0; i < 2 ** (rows - 1); i++) {
        let costSoFar = triangle[0][0];
        let column = 0;
        const route = i.toString(2).padStart(rows - 1, "0");

        // Go through all steps on this particular route.
        for (let step = 1; step < rows; step++) {
            if (route[step - 1] == "1") {
                column++;
            }
            costSoFar += triangle[step][column];
        }

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
    ns.tprint(solver(JSON.parse(ns.args[0])));
}