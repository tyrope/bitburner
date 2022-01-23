import { getRoute } from '/lib/netLib.js'

const FACTIONSERVERS = ["CSEC", "avmnite-02h", "I.I.I.I", "run4theh111z", "The-Cave"];

/** @param {NS} ns **/
export async function main(ns) {
    let route = [];
    for (let faction of FACTIONSERVERS) {
        route[route.length] = "connect " + getRoute(ns, ns.getHostname(), faction, Array()).slice(1).join("; connect ");
    }
    ns.tprint("\n" + route.join("\n"));
}