/* Total Ways to Sum
It is possible write four as a sum in exactly four different ways:
    3 + 1
    2 + 2
    2 + 1 + 1
    1 + 1 + 1 + 1

How many different ways can the number n be written as a sum of at least two positive integers?
*/

/**
 * @param {Number} input
 * @param {?Number[]} numSoFar
 * @return {Number[][]}
 */
function getPossibleSums(input, numSoFar = Array()) {
    if (input == 1) {
        return [[1, ...numSoFar]];
    }

    let ret = Array();
    ret.push([input, ...numSoFar]);
    for (let i = input - 1; i > 0; i--) {
        ret.push(...getPossibleSums(input - i, [i, ...numSoFar]));
    }
    return ret;
}

/** @param {Number} input */
export function solver(input) {
    let ret = new Set();
    for (let sum of getPossibleSums(input)) {
        ret.add(sum.sort().join('+'));
    }
    return [...ret].length;
}

/** @param {NS} ns **/
export async function main(ns) {
    ns.tprint(solver(JSON.parse(ns.args[0])));
}