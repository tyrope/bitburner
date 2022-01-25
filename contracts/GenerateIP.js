/* Generate IP Addresses
Given the following string containing only digits,
return an array with all possible valid IP address combinations that can be created from the string.

Note that an octet cannot begin with a '0' unless the number itself is actually 0.
For example, '192.168.010.1' is not a valid IP.

Examples:

25525511135 -> [255.255.11.135, 255.255.111.35]
1938718066 -> [193.87.180.66]

*/

/** @param {String} input **/
export function solver(input) {
    let solutions = Array();
    let octets = Array(4);

    // For each possible lengths of the four octets...
    for (let octetLen1 of [1, 2, 3]) {
        for (let octetLen2 of [1, 2, 3]) {
            for (let octetLen3 of [1, 2, 3]) {
                for (let octetLen4 of [1, 2, 3]) {
                    // Octets can't be this length, the full string doesn't allow it.
                    if (input.length != octetLen1 + octetLen2 + octetLen3 + octetLen4) {
                        continue;
                    }

                    // Split the string into these lengths.
                    octets[0] = input.substr(0, octetLen1);
                    octets[1] = input.substr(octetLen1, octetLen2);
                    octets[2] = input.substr(octetLen1 + octetLen2, octetLen3);
                    octets[3] = input.substr(octetLen1 + octetLen2 + octetLen3, octetLen4);

                    if (// Octets can't start with a 0.
                        // unless the number itself is actually 0.
                        (octets[0].startsWith("0") && octets[0] != "0") ||
                        (octets[1].startsWith("0") && octets[1] != "0") ||
                        (octets[2].startsWith("0") && octets[2] != "0") ||
                        (octets[3].startsWith("0") && octets[3] != "0") ||
                        // Octets can't be above 255.
                        Number.parseInt(octets[0]) > 255 ||
                        Number.parseInt(octets[1]) > 255 ||
                        Number.parseInt(octets[2]) > 255 ||
                        Number.parseInt(octets[3]) > 255
                    ) {
                        // So those are wrong.
                        continue;
                    }
                    solutions.push(`${octets[0]}.${octets[1]}.${octets[2]}.${octets[3]}`);
                }
            }
        }
    }
    return solutions;
}

/** @param {NS} ns **/
export async function main(ns) {
    if (ns.args[0] == undefined) {
        ns.tprint("Usage: input(string)");
        ns.exit();
    }
    ns.tprint("[" + solver(ns.args[0].toString()).join(", ") + "]");
}