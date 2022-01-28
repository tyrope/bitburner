/* Algorithmic Stock Trader IV
You are given an array with two elements. The first element is an integer k.
The second element is an array of stock prices (which are numbers) where the i-th element represents the stock price on day i.

Determine the maximum possible profit you can earn using at most k transactions.
A transaction is defined as buying and then selling one share of the stock.
Note that you cannot engage in multiple transactions at once.
In other words, you must sell the stock before you can buy it again.

If no profit can be made, then the answer should be 0.
*/

import { squishLines, makeTable } from '/lib/tableMaker.js'

const testCases = [{
    input: [6, [
        101, 22, 191, 49, 3, 21, 93, 155, 120, 49, 48, 34, 193, 52, 179, 89,
        77, 98, 34, 189, 195, 71, 175, 90, 40, 134, 98, 46, 91, 152, 2, 103,
        174, 126, 82, 179, 172, 56, 145, 113, 165, 101, 162, 55, 16, 164, 111]
    ],
    output: 972
}, {
    input: [5, [
        134, 63, 16, 197, 8, 88, 114, 60, 129, 59, 30, 25, 178, 197, 67, 195,
        104, 90, 63, 84, 7, 185, 4, 152, 27, 30, 141, 132, 118, 143, 124, 118, 9]
    ],
    output: 824
}, {
    input: [7, [
        192, 132, 155, 181, 174, 157, 67, 97, 10, 139, 39, 168, 158, 21, 74,
        192, 163, 191, 161, 179, 144, 35, 35, 197, 136, 17, 91, 92, 123, 94,
        183, 114, 149, 119, 167, 66, 26, 174, 171, 84, 159, 47, 37]
    ],
    output: 980
}, {
    input: [2, [
        178, 121, 85, 186, 5, 141, 45, 36, 157, 14, 110, 187, 185, 65, 40, 39,
        55, 58, 33, 148, 99, 119, 2, 77, 131, 74, 134, 77, 8, 130, 16, 6, 166,
        46, 149, 28, 77]
    ],
    output: 346
}, {
    input: [2, [
        127, 97, 31, 57, 55, 183, 109, 77, 73, 43, 163, 195, 37, 57, 33, 29, 90,
        84, 91, 27, 149, 20, 16, 68, 28, 22, 191, 100, 181]
    ],
    output: 339
}, {
    input: [2, [
        113, 53, 64, 66, 164, 188, 39, 106, 153, 58, 192, 47, 99, 79, 155, 131,
        187, 78, 39, 112, 90, 10, 160, 85, 114, 174, 105, 180, 38, 78, 163, 182,
        121, 109, 176]
    ],
    output: 325,
}, {
    input: [9, [
        134, 181, 115, 129, 165, 65]
    ],
    output: 97
}, {
    input: [9, [
        140, 13, 49, 5, 178, 53, 64, 198, 18, 194, 47, 156, 23, 54, 60, 108, 76,
        186, 94, 192, 107, 181, 146, 60, 178, 163, 109, 64, 100, 21, 106, 49,
        73, 104, 87]
    ],
    output: 1141,
}, {
    input: [8, [
        4, 45, 67, 53, 167, 183, 78, 146, 32, 97, 121, 68, 167, 167, 121, 124,
        101, 44, 58, 14, 141, 2, 38, 177, 169, 195]
    ],
    output: 783
}, {
    input: [5, [
        195, 183, 177, 169, 167, 167, 167, 146, 141, 124, 121, 121, 101, 97, 78,
        68, 67, 58, 53, 45, 44, 38, 32, 14, 4, 2]
    ],
    output: 0
}];

/** @param {Number[][]} input */
export async function solver(input, ns) {
    // Start building an array of profitable transactions..
    // Format for each trade: [buyDay, sellDay, Profit];
    let profitableTransactions = new Array();
    const maxTrades = input[0];
    const prices = input[1];
    for (let i = 0; i < prices.length; i++) {
        for (let j = i + 1; j < prices.length; j++) {
            if (prices[j] > prices[i]) {
                profitableTransactions.push([i, j, prices[j] - prices[i]]);
            }
        }
    }

    if (profitableTransactions.length == 0) {
        //No profitable trades.
        return 0;
    }

    // Sort by earliest buy day, then earliest sell.
    profitableTransactions.sort((a, b) => a[1] - b[1]).sort((a, b) => a[0] - b[0]);

    let ledger = Array();
    for (let check = 0; check < 2; check++) {
        for (let transID in profitableTransactions) {
            let transaction = profitableTransactions[transID];
            if (ledger.length == 0) {
                ledger.push(transaction);
                continue;
            }
            let transactionsToRemove = Array();
            let addToLedger = true;
            for (let i = 0; i < ledger.length; i++) {
                ns.print(makeTable([
                    ['     ', ' B ', ' S ', ' P '],
                    [`T#${transID}`, ...transaction],
                    [`L#${i}`, ...ledger[i]]
                ]));
                if (// If we're buying on the day after their sell or before.
                    ledger[i][1] >= transaction[0]
                ) {
                    // Collision
                    if (
                        // If we sell earlier with the same or more profit.
                        (transaction[1] < ledger[i][1] && transaction[2] >= ledger[i][2]) ||
                        // Or we sell on the same day and make more profit.
                        (transaction[1] == ledger[i][1] && transaction[2] > ledger[i][2])
                    ) {
                        ns.print('Collision; Transaction wins.');
                        await ns.sleep(5000);
                        addToLedger = true;
                        transactionsToRemove.push(i);
                    } else {
                        ns.print('Collision; Ledger wins.');
                        await ns.sleep(5000);
                        addToLedger = false;
                        break;
                    }
                }
            }
            if (addToLedger) {
                if (transactionsToRemove.length > 0) {
                    ledger = ledger.filter((_, i) => !transactionsToRemove.includes(i));
                    transactionsToRemove = [];
                }
                ledger.push(transaction);
            }
        }
    }
    ns.print(`Final ledger length: ${ledger.length}.Max trades: ${maxTrades}`);

    let profit = 0;
    let data = [["Buy", "Sell", "Profit"]];
    let i = 0;
    for (let transaction of ledger) {
        if (maxTrades < i) {
            break;
        }
        profit += transaction[2];
        data.push(transaction);
        i++;
    }
    ns.print(makeTable(data));
    return profit;
}

/** @param {NS} ns **/
export async function main(ns) {
    if (ns.args[0] == undefined) {
        ns.tail();
        ns.disableLog('ALL');
        ns.clearLog();
        for (let i = 0; i < testCases.length; i++) {
            ns.print(`INFO: Executing test #${i}`);
            let answer = await solver(testCases[i].input, ns);
            if (answer == testCases[i].output) {
                ns.print(`SUCCESS.`);
            } else {
                ns.print(`FAILURE\nEXPECT: ${testCases[i].output}\nACTUAL: ${answer}`);
            }
            await ns.sleep(60000);
        }
    } else {
        ns.tprint(solver(JSON.parse(ns.args[0])));
    }
}