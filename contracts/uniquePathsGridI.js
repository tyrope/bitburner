/* Unique Paths in a Grid I

You are in a grid with 2 rows and 7 columns, and you are positioned in the top-left corner of that grid.
You are trying to reach the bottom-right corner of the grid, but you can only move down or right on each step.
Determine how many unique paths there are from start to finish.

NOTE: The data returned for this contract is an array with the number of rows and columns:
[2, 7]
*/

export function solver(rows, columns) {
    return rows * (columns - 1);
}

/** @param {NS} ns **/
export async function main(ns) {
    if (ns.args[1] == undefined) {
        ns.tprint("Usage: rows (number), columns (number)");
        ns.exit();
    }
    ns.tprint(solver(ns.args[0], ns.args[1]));
}