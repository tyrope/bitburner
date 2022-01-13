// hyperBatcher Grow script (c) 2022 Tyrope
// Not intended for direct use; run hyperBatcher.js instead.

/** @param {NS} ns **/
export async function main(ns) {
    await ns.grow(ns.args[0]);
}