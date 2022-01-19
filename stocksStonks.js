// Stocks Stonks (c) 2022 Tyrope
// Usage: run stocksstonks.js [spendingCash] (verbose)
// Parameter pocketMoney: The minimum amount of money to keep available to the player. (Default: 0)
// Parameter verbose: Whether to print out every purchase/sale (Default: false)

import { timeFormat } from '/lib/format.js'

// Symbols dictionary.
const SYMBOLS = Array();
let pocketMoney;
let verbose;

/** @param {NS} ns **/
function updateStockPrices(ns) {
    let price;
    let pos;
    for (let i = 0; i < SYMBOLS.length; i++) {
        price = ns.stock.getPrice(SYMBOLS[i].name);
        pos = ns.stock.getPosition(SYMBOLS[i].name);
        if (price < SYMBOLS[i].minPrice) {
            SYMBOLS[i].minPrice = price;
        } else if (price > SYMBOLS[i].maxPrice) {
            SYMBOLS[i].maxPrice = price;
        }
        SYMBOLS[i].owned = pos[0];
        SYMBOLS[i].buyPrice = pos[1];
    }
}

/** 
 * @param {NS} ns
 * @return {Number} Money earned from sales.
 * **/
function sellStocks(ns) {
    let earnedMoney = 0;
    // Loop through all stocks we own.
    for (let sym of SYMBOLS) {
        if (sym.owned < 1) {
            // Can't sell stocks we don't have.
            continue;
        }
        if (ns.stock.getForecast(sym.name) > 0.65) {
            // Don't sell stocks we'll just buy back.
            continue;
        }

        if (sym.buyPrice * sym.owned * 1.1 < // The price we paid +10% is less than
            ns.stock.getSaleGain(sym.name, sym.owned, "L")) { // the money we'll get if we sell now.
            // Try to sell when we have a 10% or higher profit.
            let transaction = ns.stock.getSaleGain(sym.name, sym.owned, "L");
            if (ns.stock.sell(sym.name, sym.owned) == 0) {
                continue;
            }
            earnedMoney += transaction;
            if (verbose) {
                ns.print(`Sold ${sym.name} x ${ns.nFormat(sym.owned, "0.00a")} for ${ns.nFormat(transaction, "0.00a")}/share`);
            }
        }
    }
    pocketMoney += earnedMoney;
    return earnedMoney;
}

/** 
 * @param {NS} ns
 * @return {Number} Money spent on stocks.
 * **/
function buyStocks(ns) {
    let spentMoney = 0;
    for (let sym of SYMBOLS) {
        if (ns.stock.getForecast(sym.name) > 0.65) {
            //How much could we theoretically buy?
            let shares = Math.floor(Math.min(
                pocketMoney / ns.stock.getPrice(sym.name), // Amount of shares we can afford at market price.
                ns.stock.getMaxShares(sym.name) - sym.owned // Shares still on the market
            ));

            // Double-check the price.
            while (shares > 1 && ns.stock.getPurchaseCost(sym.name, shares, "L") > pocketMoney) {
                let overpay = ns.stock.getPurchaseCost(sym.name, shares, "L") - pocketMoney;
                shares -= Math.max(Math.floor(overpay / ns.stock.getPrice(sym.name)), 1);
            }
            if (shares < 1) {
                continue;
            }
            let transaction = ns.stock.getPurchaseCost(sym.name, shares, "L");
            if (ns.stock.buy(sym.name, shares) == 0) {
                continue;
            }
            spentMoney += transaction;
            pocketMoney -= spentMoney;
            if (verbose) {
                ns.print(`Bought ${sym.name} x ${ns.nFormat(shares, "0.00a")} at ${ns.nFormat(transaction, "0.00a")}/share.`);
            }
        }
    }
    return spentMoney;
}

/** @param {NS} ns **/
export async function main(ns) {
    ns.disableLog('ALL');

    // Set parameters.
    pocketMoney = ns.args[0];
    verbose = ns.args[1] ? ns.args[1] : false;

    if (pocketMoney == undefined || pocketMoney <= 0) {
        ns.tprint("ERROR: Not enough spending cash.");
        ns.tprint("INFO: Usage: spendingCash(number), verbose(boolean, optional).");
        ns.exit();
    }

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

    // Timekeeping
    let now = ns.getTimeSinceLastAug;
    let start = now();

    while (true) {
        updateStockPrices(ns);
        let sold = ns.nFormat(sellStocks(ns), "$0.00a");
        let bought = ns.nFormat(buyStocks(ns), "$0.00a");
        if (verbose) {
            ns.print(`INFO: [T+${timeFormat(ns, now() - start)}]Spent ${bought}, earned ${sold}`);
        }
        await ns.sleep(1500);
    }
}