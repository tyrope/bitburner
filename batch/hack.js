/** @param {NS} ns **/
export async function main(ns) {
    await ns.sleep(ns.args[1] - ns.getTimeSinceLastAug());
    let profit = await ns.hack(ns.args[0]);

    while (profit == 0) {
        await ns.sleep(100);
    }
    if(profit == ns.args[1]){
        ns.toast(`Hacked \$${ns.nFormat(profit, "0.0a")} from ${ns.args[0]}`, 'success');
    }else{
        ns.toast(`Hacked \$${ns.nFormat(profit, "0.0a")} from ${ns.args[0]}, expected ${ns.nFormat(ns.args[1], "0.0a")}`, 'error');
    }
}