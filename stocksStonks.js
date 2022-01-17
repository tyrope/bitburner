// Stocks Stonks (c) 2022 Tyrope
// Usage: run stocksstonks.js (pocketMoney) (verbose)
// Parameter pocketMoney: The minimum amount of money to keep available to the player. (Default: 0)
// Parameter verbose: Whether to print out every purchase/sale (Default: false)

import { timeFormat } from '/lib/format.js'

// Symbols dictionary.
const SYMBOLS = Array();
let pocketMoney;
let verbose;

/** @param {NS} ns **/
function getSpendingMoney(ns) {
    return ns.getServerMoneyAvailable('home') - pocketMoney;
}

/** @param {NS} ns **/
function updateStockPrices(ns) {
    let price;
    for (let i = 0; i < SYMBOLS.length; i++) {
        price = ns.stock.getPrice(SYMBOLS[i].name);
        if (price < SYMBOLS[i].minPrice) {
            SYMBOLS[i].minPrice = price;
        } else if (price > SYMBOLS[i].maxPrice) {
            SYMBOLS[i].maxPrice = price;
        }
    }
}

/** 
 * @param {NS} ns
 * @return {Number} Money earned from sales.
 * **/
function sellOwnedStocks(ns) {
    let earnedMoney = 0;
    // Loop through all stocks we own.
    for (let sym of SYMBOLS) {
        if (sym.owned < 1) {
            // Can't sell stocks we don't have.
            continue;
        }

        if (sym.buyPrice * sym.owned * 1.1 < // The price we paid +10% is less than
            ns.stock.getSaleGain(sym.name, sym.owned, "L")) { // the money we'll get if we sell now.
            // Try to sell when we have a 10% or higher profit.
            let transaction = ns.stock.sell(sym.name, sym.owned) * sym.owned;
            earnedMoney += transaction;
            if (verbose) {
                ns.print(`Sold ${sym.name} x ${sym.owned} for ${transaction}`);
            }
        }
    }
    return earnedMoney;
}

/** 
 * @param {NS} ns
 * @return {Number} Money spent on stocks.
 * **/
function buyCheapStocks(ns) {
    let spentMoney = 0;
    for (let sym of SYMBOLS) {
        if (
            ns.stock.getPrice(sym.name) == sym.minPrice && //If we're currently at lowest known price
            sym.minPrice < sym.maxPrice * 0.9 // And we know we can make a 10% profit
        ) {
            //How much could we theoretically buy?
            let shares = Math.min(
                getSpendingMoney(ns) / ns.stock.getPrice(sym.name), // Amount of shares we can afford at market price.
                ns.stock.getMaxShares(sym.name) - sym.owned // Shares still on the market
            );

            // TODO: This could use a more elegant solution.
            while (ns.stock.getPurchaseCost(sym.name, shares, "L") > getSpendingMoney(ns)) {
                let overpay = ns.stock.getPurchaseCost(sym.name, shares, "L") - getSpendingMoney(ns);
                shares -= overpay / ns.stock.getPrice(sym.name);
            }
            let transaction = ns.stock.buy(sym.name, shares) * shares;
            spentMoney += transaction;
            if (verbose) {
                ns.print(`Bought ${sym.name} x ${sym.owned} for ${spentMoney}`);
            }
        }
    }
    return spentMoney;
}

/** @param {NS} ns **/
export async function main(ns) {
    ns.disableLog('ALL');

    // Set parameters.
    pocketMoney = ns.args[0] ? ns.args[0] : 0;
    verbose = ns.args[1] ? ns.args[1] : false;

    // Build the symbols dictionary.
    let pos;
    for (let sym of ns.stock.getSymbols()) {
        pos = ns.stock.getPosition(sym);
        SYMBOLS.push({
            name: sym,
            minPrice: ns.stock.getPrice(sym),
            maxPrice: ns.stock.getPrice(sym),
            owned: pos[0],
            buyPrice: pos[1]
        });
    }
    while (true) {
        updateStockPrices(ns);
        let sold = ns.nFormat(sellOwnedStocks(ns), "$0.00a");
        let bought = ns.nFormat(buyCheapStocks(ns), "$0.00a");
        ns.print(`INFO: [T+${timeFormat(ns, ns.getTimeSinceLastAug())}]Spent ${bought}, earned ${sold}`);
        await ns.sleep(3000);
    }
}