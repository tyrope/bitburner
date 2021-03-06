/* Algorithmic Stock Trader IV
You are given an array with two elements. The first element is an integer k.
The second element is an array of stock prices (which are numbers) where the i-th element represents the stock price on day i.

Determine the maximum possible profit you can earn using at most k transactions.
A transaction is defined as buying and then selling one share of the stock.
Note that you cannot engage in multiple transactions at once.
In other words, you must sell the stock before you can buy it again.

If no profit can be made, then the answer should be 0.
*/

/** @param {Number[][]} input */
export function solver(input) {
}

/** @param {NS} ns **/
export async function main(ns) {
    ns.tprint(solver(JSON.parse(ns.args[0])));
}