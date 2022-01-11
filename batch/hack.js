/** @param {NS} ns **/
export async function main(ns) {
    await ns.sleep(ns.args[1] - ns.getTimeSinceLastAug());
    let profit = await ns.hack(ns.args[0]);

    if (profit == 0) {
        // Fail! :(
        ns.toast(`Hacked against ${ns.args[0]} failed...`, 'warning');
    } else if (Math.abs(profit - ns.args[2]) > 1000) {
        // We hacked a different amount than expected.
        ns.tprint(`ERROR: ${ns.getHostname()} hacked \$${ns.nFormat(profit, "0.000a")} from ${ns.args[0]}, expected ${ns.nFormat(ns.args[2], "0.000a")}`);
    } else {
        // success!
        ns.toast(`Hacked \$${ns.nFormat(profit, "0.000a")} from ${ns.args[0]}`, 'success');
    }
}