/* Algorithmic Stock Trader I
You are attempting to solve a Coding Contract. You have 5 tries remaining, after which the contract will self-destruct.
You are given an array of stock prices (which are numbers) where the i-th element represents the stock price on day i:
Determine the maximum possible profit you can earn using at most one transaction (i.e. you can only buy and sell the stock once).
If no profit can be made then the answer should be 0.
Note that you have to buy the stock before you can sell it
*/

/** @param {Number[]} prices */
export function solver(prices) {
    let maxProfit = 0;
    for (let buyDay = 0; buyDay < prices.length; buyDay++) {
        for (let sellDay = buyDay + 1; sellDay < prices.length; sellDay++) {
            if (prices[sellDay] - prices[buyDay] > maxProfit) {
                maxProfit = prices[sellDay] - prices[buyDay];
            }
        }
    }
    return maxProfit;
}

/** @param {NS} ns **/
export async function main(ns) {
    ns.tprint(solver(JSON.parse(ns.args[0])));
}