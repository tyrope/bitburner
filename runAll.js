// This script goes through *all* servers in the game and runs scriptName on them with max RAM.
// Usage run runAll.js [script] --flags
// Parameter: script: The script to run on the target servers.
// deny / exclude / x: Server to exclude.
// arg / args: Argument to pass onto the script specified.

import { getServers } from '/lib/netLib.js';

let scriptName;
let scriptArgs;
let tools;

export function autocomplete(data, args) {
    return [...data.servers, ...data.scripts];
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

    // Don't you wish we could just run tools[i]()? WELL YOU CAN!
    for (let i = 0; i < ports; i++) {
        tools[i](server);
    }

    // FIRE ZE MISSILES!
    ns.nuke(server);

    if (ns.hasRootAccess(server) == false) {
        ns.tprint("FAILED getting root: " + server);
        return false;
    }
    return true;
}

/**
 * @param {NS} ns
 * @param {String} server
 * @returns {Boolean}
 **/
async function control(ns, server) {
    if (getRoot(ns, server) == false) {
        // No root, no scripts.
        return false;
    }

    if (ns.getServerMaxRam(server) == 0) {
        // Can't run scripts on this server.
        return false;
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
        return ns.exec(scriptName, server, threads, ...scriptArgs) > 0;
    }
    return false;
}

/** @param {NS} ns **/
export async function main(ns) {
    const FLAGS = ns.flags([
        ['script', ''],
        ['x', []],
        ['deny', []],
        ['exclude', []],
        ['arg', []],
        ['args', []],
    ]);

    // Make sure it's a valid script.
    scriptName = ns.args[0];
    if (ns.fileExists(scriptName, 'home') == false) {
        ns.tprint("Script not found.");
        ns.exit();
    }

    // Parse arguments.
    scriptArgs = [...FLAGS['arg'], ...FLAGS['args']];

    // Parse the denylist
    let denylist = [...FLAGS['exclude'], ...FLAGS['x'], ...FLAGS['deny']];

    // Grab the toolbox.
    tools = getTools(ns);


    let ran = 0;
    let excl = 0;
    // Loop through every server.
    for (let server of getServers(ns)) {
        // But not these.
        if (denylist.includes(server)) {
            excl++;
        } else {
            if (await control(ns, server)) {
                ran++;
            } else {
                excl++;
            }
        }
    }
    ns.tprint(`Executed ${FLAGS['script']} on ${ran} servers (${excl} were left alone due to 0RAM or denylisting).`);
}