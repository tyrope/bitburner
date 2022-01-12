// Batchv1 Hack script (c) 2022 Tyrope
// Not intended for direct use; run batchDaemon.js instead.

/** @param {NS} ns **/
export async function main(ns) {
    await ns.sleep(ns.args[1] - ns.getTimeSinceLastAug());
    let profit = await ns.hack(ns.args[0]);

    if (profit == 0) {
        // Fail! :(
        ns.toast(`Hacked against ${ns.args[0]} failed...`, 'warning');
        return;
    } else if (Math.abs((profit - ns.args[2]) / ((profit + ns.args[2]) / 2)) > 0.05) {
        // We hacked a different amount than expected.
        if (profit < ns.args[2]) {
            // Not enough.
            ns.tprint(`ERROR: ${ns.getHostname()} hacked \$${ns.nFormat(profit, "0.000a")} from ${ns.args[0]}, expected ${ns.nFormat(ns.args[2], "0.000a")}`);
        } else {
            // Too much.
            ns.tprint(`WARNING: ${ns.getHostname()} overhacked ${ns.args[0]} by \$${ns.nFormat((profit/ns.args[2])*100-100, "0.00%")}`);

        }
    } else {
        // success!
        ns.toast(`Hacked \$${ns.nFormat(profit, "0.000a")} from ${ns.args[0]}`, 'success');
    }
}