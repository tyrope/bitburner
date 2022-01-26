/* Merge Overlapping Intervals
Given an array of array of numbers representing a list of intervals, merge all overlapping intervals.
The intervals must be returned in ASCENDING order. You can assume that in an interval, the first number will always be smaller than the second.
*/

/** @param {Number[][]} input */
export function solver(input) {
    // Step 1: Sort the given start times.
    input.sort((a, b) => { return a[0] - b[0]; });

    // Step 2: Merge the intervals.
    let output = Array();
    for (let interval of input) {
        // First one flies free.
        if (output.length == 0) {
            output.push(interval);
            continue;
        }

        // Grab the ID of the latest interval.
        let prev = output.length - 1;

        if (// Do we start before the previous interval has finished?
            interval[0] <= output[prev][1] &&
            // AND will we extend that interval?
            interval[1] > output[prev][1]) {
            // Then merge.
            output[prev][1] = interval[1];
        } else if (interval[0] > output[prev][1]) {
            // We start after, add this interval to the list.
            output.push(interval);
        }
    }
    return output;
}

/** @param {NS} ns **/
export async function main(ns) {
    ns.tprint(solver(JSON.parse(ns.args[0])));
}