// Server Grower (c) 2022 Tyrope
// Usage: run serverGrower.js [target]
// parameter target: The server to grow.

export function autocomplete(data, args) {
    return [...data.servers];
}

/** @param {NS} ns **/
export async function main(ns) {
    let tgt = "";
    if (ns.args[0] == undefined) {
        ns.tprint("No target specified.");
        ns.exit();
    } else {
        tgt = ns.args[0];
    }

    // Infinite loop, go!
    while (true) {
        // Make sure we're not fighting unneeded security.
        while (ns.getServerSecurityLevel(tgt) > ns.getServerMinSecurityLevel(tgt)) {
            await ns.weaken(tgt);
        }
        if (ns.getServerMoneyAvailable(tgt) < ns.getServerMaxMoney(tgt)) {
            await ns.grow(tgt);
        } else {
            break;
        }
    }
    ns.tprint(ns.getHostname() + " completed growing " + tgt);
}