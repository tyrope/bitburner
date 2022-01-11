import { makeTable } from 'lib/tableMaker.js'
import { getBatchInfo } from 'batchDaemon.js'
/** @param {NS} ns **/
export async function main(ns) {
    ns.disableLog('ALL');

    let pct = ns.args[0] ? ns.args[0] : 20;
    let verbose = ns.args[1] ? ns.args[0] : false;

    // Get all the servers.
    let servers = scanServers(ns);

    // Only keep servers that...
    servers = servers.filter((s) => {
        return (
            // have money.
            ns.getServerMaxMoney(s) != 0 &&
            // are below or equal to our hacking level.
            ns.getServerRequiredHackingLevel(s) <= ns.getHackingLevel() &&
            // Aren't in the blacklist.
            !["n00dles"].includes(s)
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
        data.push(getServerInfo(ns, server, pct, verbose));
    }
    ns.tprint("\n" + makeTable(data, false));
}

function getServerScore(ns, server, pct) {
    let chanceToHack;
    if (ns.fileExists("Formulas.exe", "home")) {
        let srv = ns.getServer(server);
        srv.hackDifficulty = srv.minDifficulty;
        srv.moneyAvailable = srv.moneyMax;
        chanceToHack = ns.formulas.hacking.hackChance(srv, ns.getPlayer());
    } else {
        chanceToHack = ns.hackAnalyzeChance(server);
    }
    let batchInfo = getBatchInfo(ns, server, pct);
    let moneyPerSec = batchInfo[2] / batchInfo[1];
    return (moneyPerSec * chanceToHack) / (batchInfo[0] * 0.25);
}

function getServerInfo(ns, server, pct, verbose) {
    let batchInfo = getBatchInfo(ns, server, pct);
    if (verbose) {
        let maxMoney = ns.getServerMaxMoney(server);
        let growth = ns.getServerGrowth(server);
        return ([
            server,
            ns.nFormat(maxMoney, "0.00a"),
            growth,
            ns.getServerMinSecurityLevel(server),
            `${Math.round(ns.hackAnalyzeChance(server) * 100)}%`,
            `${ns.nFormat(maxMoney * growth, "0.00a")}`,
            ns.nFormat(batchInfo[2] / batchInfo[1], "0.00a"),
            ns.nFormat(batchInfo[0] * 1e9, "0.00b"),
            ns.nFormat(getServerScore(ns, server, pct), "0.000")
        ]);
    } else {
        return ([
            server,
            ns.nFormat(batchInfo[2] / batchInfo[1], "0.000a"),
            ns.nFormat(batchInfo[0] * 1e9, "0.00b"),
            ns.nFormat(getServerScore(ns, server, pct), "0.000")
        ]);
    }
}

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