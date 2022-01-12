// Batchv1 Weaken script (c) 2022 Tyrope
// Not intended for direct use; run batchDaemon.js instead.

/** @param {NS} ns **/
export async function main(ns) {
    if (ns.args[1] === undefined) {
        ns.tprint("usage: target:string, startAt:number");
    }
    await ns.sleep(ns.args[1] - ns.getTimeSinceLastAug());
    await ns.weaken(ns.args[0]);
}