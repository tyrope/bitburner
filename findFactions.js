import { getRoute } from '/lib/netLib.js'

const FACTIONSERVERS = [
    "CSEC", //CyberSec
    "avmnite-02h", //NiteSec
    "I.I.I.I", //The Black Hand
    "run4theh111z", //BitRunners
    "The-Cave" // BitNode Destruction.
];

/** @param {NS} ns **/
export async function main(ns) {
    let route = [];
    for (let faction of FACTIONSERVERS) {
        route[route.length] = "connect " + getRoute(ns, ns.getHostname(), faction, Array()).slice(1).join("; connect ");
    }
    ns.tprint("\n" + route.join("\n"));
}