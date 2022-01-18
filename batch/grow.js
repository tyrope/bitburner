// hyperBatcher Grow script (c) 2022 Tyrope
// Not intended for direct use; run hyperBatcher.js instead.

/** @param {NS} ns **/
export async function main(ns) {
    let affectStocks = ns.args[2] ? ns.args[2] : false;

    await ns.grow(ns.args[0], { stock: affectStocks });
}