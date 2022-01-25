import { getRoute } from '/lib/netLib.js';

export function autocomplete(data, args) {
    return [...data.servers];
}

/** @param {NS} ns **/
export async function main(ns) {
    ns.tprint("connect " + getRoute(ns, ns.getHostname(), ns.args[0], Array()).slice(1).join("; connect "));
}