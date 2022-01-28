/* Algorithmic Stock Trader II
You are given an array of stock prices (which are numbers) where the i-th element represents the stock price on day i
Determine the maximum possible profit you can earn using as many transactions as you'd like.
A transaction is defined as buying and then selling one share of the stock.
Note that you cannot engage in multiple transactions at once.
In other words, you must sell the stock before you buy it again.
If no profit can be made, then the answer should be 0
*/

/** @param {Number[]} input */
export function solver(input) {
    let hasStock = false;
    let profit = 0;
    for (let day = 0; day < input.length; day++) {
        // If we have stock and the price is dropping.
        if (hasStock && input[day] > input[day + 1]) {
            //Sell.
            hasStock = false;
            profit += input[day];
        }

        // If we don't have stock, and the price is rising.
        if (!hasStock && input[day] < input[day + 1]) {
            // Buy.
            lastBuy = input[day];
            hasStock = true;
            profit -= input[day];
        }
    }

    // If we have stocks left over, Sell them against last price.
    if (hasStock) {
        profit += input[input.length - 1];
    }
    // If we're negative profit, somehow, reset to zero.
    if (profit < 0) {
        profit = 0;
    }
    return profit;
}

/** @param {NS} ns **/
export async function main(ns) {
    ns.tprint(solver(JSON.parse(ns.args[0])));
}