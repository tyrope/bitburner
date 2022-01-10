/** @param {NS} ns **/
export async function main(ns) {
    await ns.sleep(ns.args[1] - ns.getTimeSinceLastAug());
    let profit = await ns.hack(ns.args[0]);

    while (profit == 0) {
        await sleep(100);
    }
    ns.toast(`Hacked \$${ns.nFormat(profit, "0.0a")} from ${ns.args[0]}`, 'success');
}

