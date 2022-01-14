// Server Grader (c) 2022 Tyrope
// Usage: run serverGrader.js (percent) (verbose) (topOnly)
// Parameter percent: The % of maxMoney the batch will be stealing. (default: 20)
// Parameter verbose: If true, widens the table with a bunch of extra values. (default: false)
// Parameter topOnly: If given a number, will limit the amount of servers to only the top n. (default: Infinity)

import { makeTable } from '/lib/tableMaker.js'
import { getBatchInfo } from 'hyperBatcher.js'

/** @param {NS} ns **/
export async function main(ns) {
    ns.disableLog('ALL');
    ns.tail();

    let pct = ns.args[0] ? ns.args[0] : 20;
    let verbose = ns.args[1] ? ns.args[1] : false;
    let topOnly = ns.args[2] ? ns.args[2] + 1 : Infinity;

    // Get all the servers.
    let servers = scanServers(ns);

    // Only keep servers that...
    servers = servers.filter((s) => {
        return (
            // have money.
            ns.getServerMaxMoney(s) != 0 &&
            // are below or equal to our hacking level.
            ns.getServerRequiredHackingLevel(s) <= ns.getHackingLevel()
        )
    });

    // Sort by score.
    servers.sort((a, b) => { return getServerScore(ns, b, pct) - getServerScore(ns, a, pct); });

    let data;
    if (verbose) {
        data = [["SERVER", "Max $", "Gr", "<S", "%h", "$*Gr", "$/s", "RAM", "Score"]];
    } else {
        data = [["SERVER", "$/s", "RAM", "Score"]];
    }

    for (let server of servers) {
        if (data.length >= topOnly) {
            break;
        }
        data.push(getServerInfo(ns, server, pct, verbose));
    }
    ns.print(makeTable(data, false));
}

/** Calculate the score of 1 server.
 * @param {NS} ns
 * @param {String} server       Server to score.
 * @param {Number} pct          Percentage of maxMoney to hack.
 * @param {Boolean} useFormulas If true, use formulas to maxMoney/minSec. If false, live data.
 * @return {Number} The server's score.
**/
function getServerScore(ns, server, pct) {
    let chanceToHack;
    let srv = ns.getServer(server);
    srv.hackDifficulty = srv.minDifficulty;
    srv.moneyAvailable = srv.moneyMax;
    chanceToHack = ns.formulas.hacking.hackChance(srv, ns.getPlayer());
    let batchInfo = getBatchInfo(ns, server, pct);
    let moneyPerSec = batchInfo[2] / batchInfo[1];
    return (moneyPerSec * chanceToHack) / (batchInfo[0] * 0.25);
}

/** Get all the data of 1 server.
 * @param {NS} ns
 * @param {String} srv          Server to score.
 * @param {Number} pct          Percentage of maxMoney to hack.
 * @param {Boolean} verbose     If true, add a whole bunch of extra values.
 * @param {Boolean} useFormulas If true, use formulas to maxMoney/minSec. If false, live data.
 * @return {Object[]} The server's information.
**/
function getServerInfo(ns, srv, pct, verbose) {
    let batchInfo = getBatchInfo(ns, srv, pct);
    let chanceToHack = ns.formulas.hacking.hackChance(ns.getServer(srv), ns.getPlayer());
    if (verbose) {
        return ([
            srv,
            ns.nFormat(ns.getServerMaxMoney(srv), "0.00a"),
            ns.getServerGrowth(srv),
            ns.getServerMinSecurityLevel(srv),
            `${ns.nFormat(chanceToHack * 100, "0.00")}%`,
            `${ns.nFormat(ns.getServerMaxMoney(srv) * ns.getServerGrowth(srv), "0.00a")}`,
            ns.nFormat(batchInfo[2] / batchInfo[1], "0.00a"),
            ns.nFormat(batchInfo[0] * 1e9, "0.00b"),
            ns.nFormat(getServerScore(ns, srv, pct), "0.000")
        ]);
    } else {
        return ([
            srv,
            ns.nFormat(batchInfo[2] / batchInfo[1], "0.000a"),
            ns.nFormat(batchInfo[0] * 1e9, "0.00b"),
            ns.nFormat(getServerScore(ns, srv, pct), "0.000")
        ]);
    }
}

/** Breadth-first scan of the entire network.
 * @param {NS} ns
 * @return {String[]} list of servers.
**/
function scanServers(ns) {
    let scanned = []; // List of all the scanned servers.
    let frontier = ["home"]; // List of the servers we're going to scan.
    let todo; // Current server we're scanning.
    let neighbors; // The servers adjacent to todo

    // Main loop.
    while (frontier.length > 0) {
        // Get the next server.
        todo = frontier.shift()
        // Tell the script we've scanned it.
        scanned.push(todo);
        // Go through it's neighbors.
        neighbors = ns.scan(todo);
        for (let i = 0; i < neighbors.length; i++) {
            // Check if we've scanned it.
            if (scanned.indexOf(neighbors[i]) == -1) {
                // Add it to the list if not.
                frontier.push(neighbors[i]);
            }
        }
    }
    return scanned;
}