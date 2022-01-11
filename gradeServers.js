import { makeTable } from 'lib/tableMaker.js'
import { getBatchInfo } from 'batchDaemon.js'
/** @param {NS} ns **/
export async function main(ns) {
    ns.disableLog('ALL');
    ns.tail();

    let pct = ns.args[0] ? ns.args[0] : 20;
    let verbose = ns.args[1] ? ns.args[0] : false;
    let topOnly = ns.args[2] ? ns.args[2] + 1 : Infinity;

    let useFormulas = ns.fileExists("Formulas.exe", "home");

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
    servers.sort((a, b) => { return getServerScore(ns, b, pct, useFormulas) - getServerScore(ns, a, pct, useFormulas); });

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
        data.push(getServerInfo(ns, server, pct, verbose, useFormulas));
    }
    ns.print(makeTable(data, false));
}

function getServerScore(ns, server, pct, useFormulas) {
    let chanceToHack;
    if (useFormulas) {
        let srv = ns.getServer(server);
        srv.hackDifficulty = srv.minDifficulty;
        srv.moneyAvailable = srv.moneyMax;
        chanceToHack = ns.formulas.hacking.hackChance(srv, ns.getPlayer());
    } else {
        chanceToHack = ns.hackAnalyzeChance(server);
    }
    let batchInfo = getBatchInfo(ns, server, pct, useFormulas);
    let moneyPerSec = batchInfo[2] / batchInfo[1];
    return (moneyPerSec * chanceToHack) / (batchInfo[0] * 0.25);
}

function getServerInfo(ns, server, pct, verbose, useFormulas) {
    let batchInfo = getBatchInfo(ns, server, pct, useFormulas);
    if (verbose) {
        let maxMoney = ns.getServerMaxMoney(server);
        let growth = ns.getServerGrowth(server);
        let chanceToHack;
        if (useFormulas) {
            let srv = ns.getServer(server);
            srv.hackDifficulty = srv.minDifficulty;
            srv.moneyAvailable = srv.moneyMax;
            chanceToHack = ns.formulas.hacking.hackChance(srv, ns.getPlayer());
        } else {
            chanceToHack = ns.hackAnalyzeChance(server);
        }
        return ([
            server,
            ns.nFormat(maxMoney, "0.00a"),
            growth,
            ns.getServerMinSecurityLevel(server),
            `${ns.nFormat(chanceToHack * 100, "0.00")}%`,
            `${ns.nFormat(maxMoney * growth, "0.00a")}`,
            ns.nFormat(batchInfo[2] / batchInfo[1], "0.00a"),
            ns.nFormat(batchInfo[0] * 1e9, "0.00b"),
            ns.nFormat(getServerScore(ns, server, pct, useFormulas), "0.000")
        ]);
    } else {
        return ([
            server,
            ns.nFormat(batchInfo[2] / batchInfo[1], "0.000a"),
            ns.nFormat(batchInfo[0] * 1e9, "0.00b"),
            ns.nFormat(getServerScore(ns, server, pct, useFormulas), "0.000")
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