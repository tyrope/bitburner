// Hacknet Idler (c) 2022 Tyrope
// Usage: run hacknetIdler.js
// Make sure you tweak the values below unless you feel like losing a lot of money.

// Configuration.
let maxNodes = 30; //Max Infinity.
let maxLevel = 200; //Max 200
let maxRam = 64; //Max 64
let maxCore = 16; //Max 16
let sleepPurchase = 1; // Amount of time to sleep after we've bought something
let sleepCycle = 10000; // Amount of time to sleep after we've finished a full cycle.

/** @param {NS} ns **/
function myCash(ns) {
    return ns.getServerMoneyAvailable("home");
}

/** @param {NS} ns **/
export async function main(ns) {
    ns.disableLog("getServerMoneyAvailable");
    ns.disableLog("sleep");

    while (true) {
        for (let i = 0; i < ns.hacknet.numNodes(); i++) {
            ns.print("Shopping for node " + i);
            while (
                ns.hacknet.getNodeStats(i).level < maxLevel &&
                ns.hacknet.getLevelUpgradeCost(i, 1) < myCash(ns)
            ) {
                ns.hacknet.upgradeLevel(i, 1);
                ns.print("Bought levels for " + i);
                await ns.sleep(sleepPurchase);
            }
            while (
                ns.hacknet.getNodeStats(i).ram < maxRam &&
                ns.hacknet.getRamUpgradeCost(i, 1) < myCash(ns)
            ) {
                ns.hacknet.upgradeRam(i, 1);
                ns.print("Bought ram for " + i);
                await ns.sleep(sleepPurchase);
            }
            while (
                ns.hacknet.getNodeStats(i).cores < maxCore &&
                ns.hacknet.getCoreUpgradeCost(i, 1) < myCash(ns)
            ) {
                ns.hacknet.upgradeCore(i, 1);
                ns.print("Bought core for " + i);
                await ns.sleep(sleepPurchase);
            }
        }
        while (
            ns.hacknet.numNodes() < maxNodes &&
            ns.hacknet.getPurchaseNodeCost() < myCash(ns)
        ) {
            ns.print("Bought node " + ns.hacknet.purchaseNode());
            await ns.sleep(sleepPurchase);
        }
        await ns.sleep(sleepCycle);
    }
}

