/* Find All Valid Math Expressions
You are given a string which contains only digits between 0 and 9. You are also given a target number.
Return all possible ways you can add the +, -, and * operators to the string such that it evaluates to the target number.
The provided answer should be an array of strings containing the valid expressions.

The data provided by this problem is an array with two elements.
The first element is the string of digits, while the second element is the target number.
NOTE: Numbers in the expression cannot have leading 0's. In other words, "1+01" is not a valid expression Examples:
*/
/**
 * @param {String} input
 * @returns {String, Number}
 */
function* injectOperator(input) {
    const OPERATORS = ["", "+", "-", "*"];

    // If we only have 1 digit, we can't put things inbetween.
    if (input.length == 1) {
        yield input;
    }

    // Split the before and after
    let before = input.slice(0, 1);
    let after = input.slice(1);

    // Insert each operator.
    for (let op of OPERATORS) {
        if (after.length == 1) {
            // yield this string for evaluation.
            yield before + op + after;
        } else {
            // If the after bit is more than 1 character, execute recursion.
            for (let ans of injectOperator(after)) {
                yield before + op + ans;
            }
        }
    }
}

/** @param {[String, Number]} input **/
export function solver(input) {
    let ret = Array();
    for (let answer of injectOperator(input[0])) {
        // No zero-padded numbers!
        let zeroPadded = false;
        for (let i = 0; i < answer.length; i++) {
            if (
                (
                    answer[i] == "0" &&
                    "0123456798".includes(answer[i + 1])
                ) && (
                    i == 0 ||
                    "+-*".includes(answer[i - 1])
                )) {
                zeroPadded = true;
                break;
            }
        }

        //If this is a correct answer, push it to the results.
        if (!zeroPadded && eval(answer) == input[1]) {
            ret.push(answer);
        }
    }
    return ret;
}

/** @param {NS} ns **/
export async function main(ns) {
    ns.tprint(solver(JSON.parse(ns.args[0])));
}