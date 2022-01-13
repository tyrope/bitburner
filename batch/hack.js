// hyperBatcher Hack script (c) 2022 Tyrope
// Not intended for direct use; run hyperBatcher.js instead.

/** @param {NS} ns **/
export async function main(ns) {
    let profit = await ns.hack(ns.args[0]);
    if (profit == 0) {
        // Fail! :(
        ns.toast(`Hack failed...`, 'warning');
    } else if (Math.abs((profit - ns.args[1]) / ((profit + ns.args[1]) / 2)) > 0.05) {
        // We hacked a different amount than expected.
        if (profit < ns.args[1]) {
            // Not enough.
            ns.toast(`${ns.getHostname()} hacked \$${ns.nFormat(profit, "0.000a")}, expected ${ns.nFormat(ns.args[1], "0.000a")}`, 'error');
        } else {
            // Too much.
            ns.toast(`${ns.getHostname()} overhacked ${ns.args[0]} by \$${ns.nFormat((profit / ns.args[1]) * 100 - 100, "0.00%")}`, 'warning');
        }
    } else {
        // success!
        ns.toast(`Hacked \$${ns.nFormat(profit, "0.000a")} from ${ns.args[0]}`, 'success');
    }
}