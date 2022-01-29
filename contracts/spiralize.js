/* Spiralize Matrix
Given an array of arrays of numbers representing a 2D matrix, return the elements of the matrix as an array in spiral order.
Note that the matrix will not always be square.
*/

/**
 * @param {Number | Number[]} input
 * @return {Number[]}
 */
function ensureIsArray(input) {
    if (typeof (input) == typeof ([1, 2, 3])) {
        // This is already an array, just return it.
        return input;
    }
    // This is a single number, put it in an array.
    return [input];
}

/** @param {Number[][]} input */
export function solver(input) {
    let ret = Array();
    while (input.length > 0) {
        // Top side.
        ret.push(...ensureIsArray(input.shift()));

        // Are we done yet?
        if (input.length == 0) {
            break;
        }

        // Right hand side.
        for (let i = 0; i < input.length; i++) {
            ret.push(...ensureIsArray(input[i].pop()));
        }

        // Are we done yet?
        if (input.length == 0 || input[0].length == 0) {
            break;
        }

        // Bottom side.
        ret.push(...input.pop().reverse());

        // Are we done yet?
        if (input.length == 0) {
            break;
        }

        // Left side.
        for (let i = input.length - 1; i >= 0; i--) {
            ret.push(...ensureIsArray(input[i].shift()));
        }

        // Are we done yet?
        if (input.length == 0 || input[0].length == 0) {
            break;
        }

    }// Repeat if the grid isn't completely eaten up yet.
    return ret;
}

/** @param {NS} ns **/
export async function main(ns) {
    ns.tprint(solver(JSON.parse(ns.args[0])));
}