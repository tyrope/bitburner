/** @param {NS} ns **/
export async function main(ns) {
    await ns.sleep(ns.args[1] - ns.getTimeSinceLastAug());
    let profit = await ns.hack(ns.args[0]);

    while (profit == 0) {
        await ns.sleep(100);
    }

    if (Math.abs(profit - ns.args[1]) > 1000) {
        // We hacked a different amount than expected.
        ns.tprint(`ERROR: ${ns.getHostname()} hacked \$${ns.nFormat(profit, "0.0a")} from ${ns.args[0]}, expected ${ns.nFormat(ns.args[1], "0.0a")}`);
    } else {
        // success!
        ns.toast(`Hacked \$${ns.nFormat(profit, "0.0a")} from ${ns.args[0]}`, 'success');
    }
}

