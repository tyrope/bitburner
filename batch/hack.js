// hyperBatcher Hack script (c) 2022 Tyrope
// Not intended for direct use; run hyperBatcher.js instead.

/** @param {NS} ns **/
export async function main(ns) {
    const expProfit = ns.args[1];
    let affectStocks = ns.args[2] ? ns.args[2] : false;

    let profit = await ns.hack(ns.args[0], { stock: affectStocks });

    // We hacked 
    if (
        // We hacked something, but 
        profit != 0 &&
        // a different amount than expected, abort.
        Math.abs((profit - expProfit) / ((profit + expProfit) / 2)) > 0.05
    ) {
        ns.write(`ABORT_${ns.args[0]}.txt`, "", 'w');
    }
}