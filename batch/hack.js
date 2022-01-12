/** @param {NS} ns **/
export async function main(ns) {
    let profit = await ns.hack(ns.args[0]);
    ns.toast(`Hacked ${ns.args[0]} for \$${ns.nFormat(profit, "0.00a")}`);
}