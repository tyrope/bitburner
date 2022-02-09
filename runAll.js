// This script goes through *all* servers in the game and runs scriptName on them with max RAM.
// Usage run runAll.js [script] --flags
// Parameter: script: The script to run on the target servers.
// deny / exclude / x: Server to exclude.
// arg / args: Argument to pass onto the script specified.

import { getServers } from '/lib/netLib.js';

let scriptName;
let scriptArgs;
let tools;

const CONTROL_STATUS = {
    FAILURE: -1,
    SUCCESS: 0,
    NORAM: 1,
    NOROOT: 2
}

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
 * @returns {ControlStatus}
 **/
async function control(ns, server) {
    if (getRoot(ns, server) == false) {
        // No root, no scripts.
        return CONTROL_STATUS.NOROOT;
    }

    if (ns.getServerMaxRam(server) == 0) {
        // Can't run scripts on this server.
        return CONTROL_STATUS.NORAM;
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
        if (ns.exec(scriptName, server, threads, ...scriptArgs) > 0) {
            return CONTROL_STATUS.SUCCESS;
        } else {
            return CONTROL_STATUS.FAILURE;
        }
    }
    return CONTROL_STATUS.NORAM;
}

/** @param {NS} ns **/
export async function main(ns) {
    const FLAGS = ns.flags([
        ['script', ''],
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
    let denylist = [...FLAGS['exclude'], ...FLAGS['deny']];

    // Grab the toolbox.
    tools = getTools(ns);


    let success = 0;
    let noRam = 0;
    let denied = 0;
    let noRoot = 0;
    let fail = 0;
    // Loop through every server.
    for (let server of getServers(ns)) {
        // But not these.
        if (denylist.includes(server)) {
            denied++;
        } else {
            // Try to run the script and see what happens.
            switch (await control(ns, server)) {
                case CONTROL_STATUS.NOROOT:
                    noRoot++;
                    break;
                case CONTROL_STATUS.NORAM:
                    noRam++;
                    break;
                case CONTROL_STATUS.SUCCESS:
                    success++;
                    break;
                case CONTROL_STATUS.FAILURE:
                    fail++;
                    break;
                // end switch.
            }
        }
    }
    let ret = `Executed ${scriptName} ${scriptArgs.join(' ')} on ${success} server(s).`;
    if (denied > 0) {
        ret += `\n - ${denied} server(s) were denylisted.`;
    }
    if (noRoot > 0) {
        ret += `\n - ${noRoot} server(s) aren't rooted.`
    }
    if (noRam > 0) {
        ret += `\n - ${noRam} server(s) don't have enough RAM.`
    }
    if (fail > 0) {
        ret += `\n - ${fail} server(s) failed to execute the script.`
    }
    ns.tprint(ret);
}