// hyperBatcher Hack script (c) 2022 Tyrope
// Not intended for direct use; run hyperBatcher.js instead.

/** @param {NS} ns **/
export async function main(ns) {
    const expProfit = ns.args[1];
    const verbose = ns.args[2] ? ns.args[2] : false;

    let profit = await ns.hack(ns.args[0]);
    if (profit == 0) {
        // Fail! :(
        if (verbose) {
            ns.toast(`Hack failed...`, 'warning');
        }
    } else if (Math.abs((profit - expProfit) / ((profit + expProfit) / 2)) > 0.05) {
        // We hacked a different amount than expected.
        if (verbose) {
            if (profit < expProfit) {
                // Not enough.
                ns.toast(`${ns.getHostname()} hacked \$${ns.nFormat(profit, "0.000a")}, expected ${ns.nFormat(expProfit, "0.000a")}`, 'error');
            } else {
                // Too much.
                ns.toast(`${ns.getHostname()} overhacked ${ns.args[0]} by \$${ns.nFormat((profit / expProfit) * 100 - 100, "0.00%")}`, 'warning');
            }
        }
        ns.write('ABORT.txt', ns.args[0], 'w');
    } else if (verbose) {
        // success!
        ns.toast(`Hacked \$${ns.nFormat(profit, "0.000a")} from ${ns.args[0]}`, 'success');
    }
}