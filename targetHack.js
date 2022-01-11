/** @param {NS} ns **/
export function autocomplete(data, args) {
    return [...data.servers];
}

export async function main(ns) {
    ns.disableLog('getServerSecurityLevel');
    ns.disableLog('getServerMaxMoney');

    let srv = ns.args[0];

    // Infinite loop, go!
    while (true) {
        // Make sure we're not fighting unneeded security.
        while (ns.getServerSecurityLevel(srv) > ns.getServerMinSecurityLevel(srv)) {
            await ns.weaken(srv);
        }

        // Make sure the server has max money available.
        if (ns.getServerMoneyAvailable(srv) < ns.getServerMaxMoney(srv)) {
            await ns.grow(srv);
            continue;
        }
        await ns.hack(srv);
    }
}

