/* Unique Paths in a Grid I
You are in a grid with X rows and Y columns, and you are positioned in the top-left corner of that grid.
You are trying to reach the bottom-right corner of the grid, but you can only move down or right on each step.
Determine how many unique paths there are from start to finish.

The data returned for this contract is an array with the number of rows and columns.
*/

// Source: https://stackoverflow.com/questions/15301885/calculate-value-of-n-choose-k
function choose(n, k) {
    if (k == 0) {
        return 1;
    }
    return (n * choose(n - 1, k - 1)) / k;
}
/** @param {Number[]} input **/
export function solver(input) {
    let n = (input[0] - 1) + (input[1] - 1);
    return choose(n, input[0] - 1);
}

/** @param {NS} ns **/
export async function main(ns) {
    ns.tprint(solver(JSON.parse(ns.args[0])));
}