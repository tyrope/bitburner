/** @param {NS} ns
This script goes through *all* servers in the game and runs serverGrower.script on them.
Usage: run scan.js target
parameter: target: String - exact name (case sensitive, maybe) to grow.
**/

let scriptName = "serverGrower.js";

export function autocomplete(data, args) {
    return [...data.servers];
}

function getTools(ns) {
    let ret = [];
    if (ns.fileExists('BruteSSH.exe', 'home')) {
        ret.push('ssh');
    }
    if (ns.fileExists('FTPCrack.exe', 'home')) {
        ret.push('ftp');
    }
    if (ns.fileExists('HTTPWorm.exe', 'home')) {
        ret.push('http');
    }
    if (ns.fileExists('SQLInject.exe', 'home')) {
        ret.push('sql');
    }
    if (ns.fileExists('relaySMTP.exe', 'home')) {
        ret.push('smtp');
    }
    return ret;
}

function getRoot(ns, server, tools) {
    if (ns.hasRootAccess(server) == true) {
        // We already have root you dumbdumb.
        return true;
    }
    let ports = ns.getServerNumPortsRequired(server)
    if (ports > tools.length) {
        // Can't open enough ports.
        return false;
    }

    // Don't you wish we could just ns.run(tools[i])? Yeah me too.
    for (let i = 0; i < ports; i++) {
        switch (tools[i]) {
            case 'ssh':
                ns.brutessh(server);
                break;
            case 'ftp':
                ns.ftpcrack(server);
                break;
            case 'http':
                ns.httpworm(server);
                break;
            case 'sql':
                ns.sqlinject(server);
                break;
            case 'smtp':
                ns.relaysmtp(server);
                break;
        }
    }

    // FIRE ZE MISSILES!
    ns.nuke(server);

    if (ns.hasRootAccess(server) == false) {
        ns.tprint("FAILED getting root: " + server);
        return false;
    }
    return true;
}

async function control(ns, server, tools) {
    if (getRoot(ns, server, tools) == false) {
        // No root, no scripts.
        return;
    }

    // Kill the script if it's running.
    if (ns.scriptRunning(scriptName, server)) {
        ns.scriptKill(scriptName, server);
    }

    await ns.scp(scriptName, "home", server);
    // Calculate how many threads of the server grower we can run.
    let threads = Math.floor((ns.getServerMaxRam(server) - ns.getServerUsedRam(server)) / ns.getScriptRam(scriptName))
    // run the server grower, if we can.
    if (threads > 0) {
        ns.exec(scriptName, server, threads, ns.args[0]);
    }
}

export async function main(ns) {
    if (ns.args[0] == undefined) {
        ns.tprint("No target specified.");
        ns.exit();
    }

    let scanned = []; // List of all the scanned servers.
    let frontier = ["home"]; // List of the servers we're going to scan.
    let todo; // Current server we're scanning.
    let neighbors; // The servers adjacent to todo
    let tools = getTools(ns);

    // Main loop.
    while (frontier.length > 0) {
        // Get the next server.
        todo = frontier.shift()
        // Control it.
        await control(ns, todo, tools);
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
    ns.tprint("Scan complete.");
}