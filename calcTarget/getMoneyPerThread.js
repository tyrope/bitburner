import { getServers } from '/lib/netLib.js'
import { getBatchInfo } from '/hyperBatcher.js'
import { makeTable } from '/lib/tableMaker.js'

/**Get the percentages of money we're able to hack.
 * @param {NS} ns
 * @param {String} tgt
 * @returns {Number[]} The percentage money stolen based on the amount of threads (index) given.
**/
function getHackPercentages(ns, tgt) {
    const srv = ns.getServer(tgt);
    srv.moneyAvailable = srv.moneyMax;
    srv.hackDifficulty = srv.minDifficulty;
    const perThread = ns.formulas.hacking.hackPercent(srv, ns.getPlayer());
    const max = Math.ceil(1 / perThread);
    let ret = Array();
    for (let i = 0; i <= max; i++) {
        ret.push(i * perThread);
    }
    return ret;
}

/** Get all combinations of threads Used, RAM cost, Money stolen and Percentage of money stolen for a specific target.
 * @param {NS} ns
 * @param {String} tgt
 * @returns {Array<Number[4]>}
 */
export function getServerYields(ns, tgt) {
    let ret = Array();
    let percentages = getHackPercentages(ns, tgt);
    for (let i = 0; i < percentages.length; i++) {
        let ram; let money;
        [ram, , money] = getBatchInfo(ns, tgt, percentages[i]);
        if (money == 0) {
            // Ignore any hacks that yield nothing.
            continue;
        }
        ret.push([i, ram, money, money / ns.getServerMaxMoney(tgt)]);
    }
    return ret;
}

/** @param {NS} ns **/
export async function main(ns) {
    ns.disableLog('ALL');
    ns.clearLog();
    ns.tail();

    for (let tgt of getServers(ns)) {
        if (ns.getServerMaxMoney(tgt) == 0) {
            // Ignore servers without money.
            continue;
        }
        let data = [["threads", "RAM", "$", "$%"]];
        for (let dataPoint of getServerYields(ns, tgt)) {
            data.push([
                dataPoint[0],
                ns.nFormat(dataPoint[1] * 1e9, "0.00b"),
                ns.nFormat(dataPoint[2], "$0.000a"),
                ns.nFormat(dataPoint[3], "0.00%")
            ]);
        }
        ns.print(`TARGET: ${tgt}\n${makeTable(data)}\n`);
    }
}