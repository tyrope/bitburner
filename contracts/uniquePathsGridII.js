/* Unique Paths in a Grid II
You are located in the top-left corner of a following grid
You are trying reach the bottom-right corner of the grid, but you can only move down or right on each step.
Furthermore, there are obstacles on the grid that you cannot move onto.
These obstacles are denoted by '1', while empty spaces are denoted by 0.

Determine how many unique paths there are from start to finish.
*/

/** @param {Number[][]} input */
export function solver(input) {
    //Nope.
}

/** @param {NS} ns **/
export async function main(ns) {
    ns.tprint(solver(JSON.parse(ns.args[0])));
}