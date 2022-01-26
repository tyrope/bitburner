/* Sanitize Parentheses in Expression
Given a string remove the minimum number of invalid parentheses in order to validate the string.
If there are multiple minimal ways to validate the string, provide all of the possible results.
The answer should be provided as an array of strings.
If it is impossible to validate the string the result should be an array with only an empty string.
IMPORTANT: The string may contain letters, not just parentheses.
*/

// Thank you https://github.com/phantomesse/bitburner/tree/main/tests
const testCases = [{
    input: ')(',
    output: ['']
}, {
    input: '(()))(',
    output: ['(())']
}, {
    input: ')))a))))a)aa',
    output: ['aaaa']
}, {
    input: '(()))((aa)(',
    output: ['(())(aa)']
}, {
    input: '()())()',
    output: ['()()()', '(())()']
}, {
    input: '(a)())()',
    output: ['(a)()()', '(a())()']
}, {
    input: '()(a))(',
    output: ['((a))', '()(a)']
}, {
    input: ')(()))(()))()a((',
    output: ['(()(()))()a', '(())(())()a']
}, {
    input: '(((a((a))',
    output: ['a((a))', '(a(a))', '((aa))']
}, {
    input: '()(()(a(())a(()))a',
    output: ['()()(a(())a(()))a', '()(()a(())a(()))a', '()(()(a())a(()))a', '()(()(a(())a()))a']
}, {
    input: ')((((()a(())))()a())',
    output: ['(((()a(())))()a())', '((((()a())))()a())', '((((()a(()))))a())', '((((()a(())))()a))']
}, {
    input: '(a)))()a)(()))(',
    output: ['(a(a)(()))', '(a()a(()))', '(a()a)(())', '(a)(a(()))', '(a)(a)(())', '(a)()a(())']
}, {
    input: '(((())(((a(a(a)((a)',
    output: ['(())aa(a)(a)', '(())a(aa)(a)', '(())a(a(a)a)', '(())(aaa)(a)', '(())(aa(a)a)', '(())(a(aa)a)', '(())((aaa)a)', '((())aaa)(a)', '((())aa(a)a)', '((())a(aa)a)', '((())(aaa)a)', '(((())aaa)a)']
}];

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

/** @param {String} input **/
export function solver(input) {
    // If this is a valid string, it's the *only* valid string.
    if (validateParens(input)) {
        return [input];
    }

    let validAnswers = Array();
    for (let i = 0; i < input.length; i++) {
        if (input[i] != "(" && input[i] != ")") {
            // We're only allowed to delete parentheses!
            continue;
        }
        let test = "";

        // If we're not the start, add everything before i.
        if (i != 0) {
            test += input.substr(0, i);
        }
        // If we're not the end, add everything before i.
        if (i != input.length) {
            test += input.substr(i + 1);
        }
        validAnswers.push(test);
    }
    // Remove duplicates.
    validAnswers = [...new Set(validAnswers)];
    if (validAnswers.length > 0) {
        // We have answers.
        return validAnswers;
    }

    // Initial thought? Recurse.
    // But that raises the problem of going depth-first instead of breath-first (which is what's required for *minimal*)
    // Alternative: Recurse anyway, and find the longest strings only.
}


/** @param {NS} ns **/
export async function main(ns) {
    if (ns.args[0] == undefined) {
        ns.tail(); ns.clearLog();
        for (let i in testCases) {
            let result = solver(testCases[i].input)
            if (testCases[i].output != result) {
                ns.print(
                    `ERROR: Failed test#${i}:\n` +
                    `INPUT:  ${testCases[i].input}\n` +
                    `EXPECT(${testCases[i].output.length}): ${testCases[i].output}\n` +
                    `ACTUAL(${result.length}): ${result}`
                );
            } else {
                ns.print(`SUCCESS: Passed test#${i}`);
            }
            await ns.sleep(1000);
        }
        ns.exit();
    }
    ns.tprint(solver(ns.args[0]));
}