import { getServers } from '/lib/netLib.js'
/** @param {NS} ns **/
export async function main(ns) {
    if (ns.args.length < 1) {
        ns.tprint("Usage: killEverywhere.js [scriptName]");
    }
    for (let server of getServers(ns)) {
        ns.scriptKill(ns.args[0], server);
    }
}