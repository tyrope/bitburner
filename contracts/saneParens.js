/* Sanitize Parentheses in Expression
Given a string remove the minimum number of invalid parentheses in order to validate the string.
If there are multiple minimal ways to validate the string, provide all of the possible results.
The answer should be provided as an array of strings.
If it is impossible to validate the string the result should be an array with only an empty string.
IMPORTANT: The string may contain letters, not just parentheses.
*/

/**Check if a string contains a valid set of parentheses.
 * @param {String} input
 * @return {Boolean}
 */
function validateParens(input) {
    let unclosedPair = 0;
    for (let char of input) {
        switch (char) {
            case "(":
                unclosedPair++;
                break;
            case ")":
                if (unclosedPair == 0) {
                    // We're closing without opening, invalid.
                    return false;
                }
                unclosedPair--;
                break;
            //End switch.
        }
    }
    return (unclosedPair == 0);
}

/**
 * @param {String} input
 * @return {String[]}
**/
export function solver(input) {
    // If this is a valid string, it's the *only* valid string.
    if (validateParens(input)) {
        return [input];
    }

    let possibleSolutions = new Set([input]);
    let validAnswers = new Set();
    while (validAnswers.size == 0) {
        let newSolutions = new Set();
        for (let possibility of possibleSolutions) {
            for (let i = 0; i < possibility.length; i++) {
                if (possibility[i] != "(" && possibility[i] != ")") {
                    // We're only allowed to delete parentheses!
                    continue;
                }
                let test = "";

                // If we're not the start, add everything before i.
                if (i != 0) {
                    test += possibility.substr(0, i);
                }
                // If we're not the end, add everything before i.
                if (i != possibility.length) {
                    test += possibility.substr(i + 1);
                }
                newSolutions.add(test);
                if (validateParens(test)) {
                    validAnswers.add(test);
                }
            }
        }
        possibleSolutions = newSolutions;
    }
    return [...validAnswers];
}


/** @param {NS} ns **/
export async function main(ns) {
    ns.tprint(solver(ns.args[0]));
}