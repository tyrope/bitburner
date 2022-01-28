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
export function solver(input, ns) {
    const maxTrades = input[0];
    const prices = input[1];
    let transactions = Array();

    let hasStock = false;
    let startDay = 0;
    for (let i = 0; i < prices.length; i++) {
        if (!hasStock && prices[i] < prices[i + 1]) {
            // We don't have stock and the price is increasing. Buy!
            hasStock = true;
            if (i == 0) { continue; } // 0-day protection.
            transactions.push([startDay, i, prices[i] - prices[startDay]]);
            startDay = i;
        } else if (hasStock && prices[i] > prices[i + 1]) {
            // We're holding stock and the price is decreasing. Sell!
            hasStock = false;
            transactions.push([startDay, i, prices[i] - prices[startDay]]);
            startDay = i;
        }
    }

    for (let i = 1; i < transactions.length; i++) {
        // We don't start at 0, because if the first trade is a negative it makes no sense to buy earlier.

        if (
            // If this transaction is a negative and...
            transactions[i][2] < 0 &&
            // the following transaction is a positive greater than this negative.
            transactions[i + 1][2] > transactions[i][2] * -1
        ) {
            // Merge this, the previous and the following transaction together.
            // AKA: Don't sell the stock.
            transactions[i - 1] = [
                transactions[i - 1][0], // Previous buy day.
                transactions[i + 1][1], // Next sell day.
                transactions[i - 1][2] + transactions[i][2] + transactions[i + 1][2] // Combined profit.
            ];

            // Delete the current and next trade, since they're now merged in the previous transaction.
            transactions = transactions.slice(0, i).concat(transactions.slice(i + 2));

            // Go back a step, to make sure we go over every trade.
            i--;
        }
    }

    ns.print(makeTable([
        ['BuyDay', 'SellDay', 'Profit'],
        ...transactions
    ]));

    // Only keep the top maxTrades in profitability.
    transactions.sort((a, b) => b[2] - a[2]);
    if (transactions.length > maxTrades) {
        transactions = transactions.slice(0, maxTrades);
    }

    transactions.sort((a, b) => a[0] - b[0]);
    ns.print(makeTable([
        ['BuyDay', 'SellDay', 'Profit'],
        ...transactions
    ]));

    let profit = 0;
    for (let transaction of transactions) {
        profit += transaction[2];
    }
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
            let answer = solver(testCases[i].input, ns);
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