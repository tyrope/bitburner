/* Array Jumping Game
You are given an array of integers.
Each element in the array represents your MAXIMUM jump length at that position.
This means that if you are at position i and your maximum jump length is n, you can jump to any position from i to i+n.
Assuming you are initially positioned at the start of the array, determine whether you are able to reach the last index.
Your answer should be submitted as 1 or 0, representing true and false respectively
*/

/** @param {Number[]} input */
export function solver(input) {
    // If we can jump to the end, we've won.
    if (input[0] >= input.length) {
        return 1;
    }

    // If we can't, check against ALL of our possible jumps.
    for (let i = 1; i < input[0]; i++) {

        // If one of these jumps wins, we win.
        if (solver(input.slice(i)) == 1) {
            return 1;
        }
    }
    // None of our jumps can win.
    return 0;
}

/** @param {NS} ns **/
export async function main(ns) {
    ns.tprint(solver(JSON.parse(ns.args[0])));
}