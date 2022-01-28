// This script goes through *all* servers in the game and runs scriptName on them with max RAM.
// Usage: run runAll.js [script] (args)
// parameter script: The script to run on the target servers.
// parameter args: Arguments to pass onto the script specified.

import { getServers } from '/lib/netLib.js'

let scriptName;
let scriptArgs;
let tools;

export function autocomplete(data, args) {
    return [...data.servers];
}

/** 
 * @param {NS} ns
 * @return {Function[]}
**/
function getTools(ns) {
    let ret = [];
    if (ns.fileExists('BruteSSH.exe', 'home')) {
        ret.push(ns.brutessh);
    }
    if (ns.fileExists('FTPCrack.exe', 'home')) {
        ret.push(ns.ftpcrack);
    }
    if (ns.fileExists('HTTPWorm.exe', 'home')) {
        ret.push(ns.httpworm);
    }
    if (ns.fileExists('SQLInject.exe', 'home')) {
        ret.push(ns.sqlinject);
    }
    if (ns.fileExists('relaySMTP.exe', 'home')) {
        ret.push(ns.relaysmtp);
    }
    return ret;
}

/** @param {NS} ns **/
function getRoot(ns, server) {
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
        tools[i]();
    }

    // FIRE ZE MISSILES!
    ns.nuke(server);

    if (ns.hasRootAccess(server) == false) {
        ns.tprint("FAILED getting root: " + server);
        return false;
    }
    return true;
}

/** @param {NS} ns **/
async function control(ns, server) {
    if (getRoot(ns, server) == false) {
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
        ns.exec(scriptName, server, threads, ...scriptArgs);
    }
}

/** @param {NS} ns **/
export async function main(ns) {
    if (ns.args[0] == undefined) {
        ns.tprint("No script specified.");
        ns.exit();
    }
    scriptName = ns.args[0];

    if (ns.fileExists(scriptName, 'home') == false) {
        ns.tprint("Script not found.");
        ns.exit();
    }

    if (ns.args.length > 1) {
        scriptArgs = ns.args.slice(1);
    } else {
        scriptArgs = Array();
    }

    tools = getTools(ns);

    //TODO: Allow for blacklisting.
    for (let server of getServers(ns)) {
        ns.print(server);
        await control(ns, server);
    }

    ns.tprint("Scan complete.");
}