import { getRoute } from '/lib/netLib.js'

const FACTIONSERVERS = [
    "CSEC", //CyberSec (54) 
    "avmnite-02h", //NiteSec (211) 
    "I.I.I.I", //The Black Hand (348)
    "run4theh111z", //BitRunners (521)
    "The-Cave" // BitNode Destruction. (925)
];

/** @param {NS} ns **/
export async function main(ns) {
    let route = [];
    for (let faction of FACTIONSERVERS) {
        route[route.length] = "connect " + getRoute(ns, ns.getHostname(), faction, Array()).slice(1).join("; connect ");
    }
    ns.tprint("\n" + route.join("\n"));
}