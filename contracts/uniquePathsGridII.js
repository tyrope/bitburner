/* Unique Paths in a Grid II
You are located in the top-left corner of a following grid
You are trying reach the bottom-right corner of the grid, but you can only move down or right on each step.
Furthermore, there are obstacles on the grid that you cannot move onto.
These obstacles are denoted by '1', while empty spaces are denoted by 0.

Determine how many unique paths there are from start to finish.
*/

/**
 * @param {Number[][]} grid
 * @param {Number} x
 * @param {Number} y
 * @param {String} pathSoFar
 * @returns {String[]}
*/
function takeSteps(grid, x, y, pathSoFar) {
    // If we're at the destination, stop.
    if (x == grid.length - 1 && y == grid[0].length - 1) {
        return [pathSoFar];
    } else if (grid[x][y] == 1) {
        return false; // Can't stand here.
    }

    let paths = Array();
    let step;
    // Check if we can go right.
    if (x < grid.length - 1) {
        step = takeSteps(grid, x + 1, y, pathSoFar + "R");
        if (step !== false) {
            paths = paths.concat(...step);
        }
    }
    // Check if we can go down.
    if (y < grid[0].length - 1) {
        step = takeSteps(grid, x, y + 1, pathSoFar + "D");
        if (step !== false) {
            paths = paths.concat(...step);
        }
    }
    // Return the paths we've found.
    return paths;
}

/** @param {Number[][]} input */
export function solver(input) {
    let paths = takeSteps(input, 0, 0, "");
    return paths.length;
}

/** @param {NS} ns **/
export async function main(ns) {
    ns.tprint(solver(JSON.parse(ns.args[0])));
}