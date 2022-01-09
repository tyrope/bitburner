/** @param {NS} ns **/
export async function main(ns) {
    let runTimes = [];
    let threads = [];

    // Set the target
    if (ns.args[1] == undefined) {
        ns.tprint("Usage: target: string, moneyPercent: number");
        ns.exit();
    }
    let tgt = ns.args[0];

    if (ns.getServerMaxMoney(tgt) != ns.getServerMoneyAvailable(tgt)) {
        ns.tprint("WARNING: Server not at max money, calculations might be wrong.");
    }
    if (ns.getServerSecurityLevel(tgt) != ns.getServerMinSecurityLevel(tgt)) {
        ns.tprint("WARNING: Server not at min security, calculations might be wrong.");
    }

    // Calculate the hack.
    let maxMoney = ns.getServerMaxMoney(tgt);
    threads.push(Math.floor(ns.hackAnalyzeThreads(tgt, maxMoney * (ns.args[1] / 100))));
    let moneyPercent = ns.hackAnalyze(tgt) * threads[0] * maxMoney;
    let secIncrease = ns.hackAnalyzeSecurity(threads[0]);
    runTimes.push(ns.getHackTime(tgt));
    ns.tprint(
        "Hack(" + tgt + ", " + threads[0] + "): $" + ns.nFormat(moneyPercent, "0,0a") + 
        " in " + ns.tFormat(runTimes[0], true) + "s, +" + secIncrease + "sec."
    );

    // Calculate the weaken we need to counter hack.
    let secEffect = 0;
    threads.push(0);
    while (secEffect < secIncrease) {
        threads[1]++;
        secEffect = ns.weakenAnalyze(threads[1]);
    }
    runTimes.push(ns.getWeakenTime(tgt));
    ns.tprint("Weaken(" + tgt + ", " + threads[1] + "): -" + secEffect + "sec in " + ns.tFormat(runTimes[1], true) + "s.");

    // Calculate the grow we need.
    threads.push(Math.ceil(ns.growthAnalyze(tgt, moneyPercent)));
    secIncrease = ns.growthAnalyzeSecurity(threads[2]);
    runTimes.push(ns.getGrowTime(tgt));
    ns.tprint("Grow(" + tgt + ", " + threads[2] + "): +" + secIncrease + "sec in " + ns.tFormat(runTimes[2], true) + "s.");

    // Calculate the weaken we need to counter grow.
    threads.push(0);
    secEffect = 0;
    while (secEffect < secIncrease) {
        threads[3]++;
        secEffect = ns.weakenAnalyze(threads[3]);
    }
    runTimes.push(ns.getWeakenTime(tgt));
    ns.tprint("Weaken(" + tgt + ", " + threads[3] + "): -" + secEffect + "sec in " + ns.tFormat(runTimes[3], true) + "s.");

    
}