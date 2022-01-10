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
        ns.tprint(`WARNING: ${tgt} not at max money, calculations might be wrong.`);
    }
    if (ns.getServerSecurityLevel(tgt) != ns.getServerMinSecurityLevel(tgt)) {
        ns.tprint(`WARNING: ${tgt} not at min security, calculations might be wrong.`);
    }

    // Calculate the hack.
    let maxMoney = ns.getServerMaxMoney(tgt);
    threads.push(Math.floor(ns.hackAnalyzeThreads(tgt, maxMoney * (ns.args[1] / 100))));
    let moneyPercent = ns.hackAnalyze(tgt) * threads[0] * maxMoney;
    let secIncrease = ns.hackAnalyzeSecurity(threads[0]);
    runTimes.push(ns.getHackTime(tgt));

    // Calculate the weaken we need to counter hack.
    let secEffect = 0;
    threads.push(0);
    while (secEffect < secIncrease) {
        threads[1]++;
        secEffect = ns.weakenAnalyze(threads[1]);
    }
    runTimes.push(ns.getWeakenTime(tgt));

    // Calculate the grow we need.
    threads.push(Math.ceil(ns.growthAnalyze(tgt, moneyPercent)));
    secIncrease = ns.growthAnalyzeSecurity(threads[2]);
    runTimes.push(ns.getGrowTime(tgt));

    // Calculate the weaken we need to counter grow.
    threads.push(0);
    secEffect = 0;
    while (secEffect < secIncrease) {
        threads[3]++;
        secEffect = ns.weakenAnalyze(threads[3]);
    }
    runTimes.push(ns.getWeakenTime(tgt));

    // Correct order of FINISHING: HWGW (0,1,2,3)
    // Expected order of STARTING: WWGH (1,3,2,0)
    let startTimes = [0, 0, 0, 0];
    let endTimes = runTimes;
    let endDelay = 200;

    // TODO Don't hardcode this.

    // Delay weaken 2 by 2x endDelay.
    startTimes[3] = endDelay * 2;
    endTimes[3] = startTimes[3] + runTimes[3];

    // Delay grow by Weaken1's runtime, plus 1x delay, minus our own runtime.
    startTimes[2] = runTimes[1] + endDelay - runTimes[2];
    endTimes[2] = startTimes[2] + runTimes[2];

    // Delay hack by Weaken1's runtime, minus 1x delay, minus our own runtime.
    startTimes[0] = runTimes[1] - endDelay - runTimes[0];
    endTimes[0] = startTimes[0] + runTimes[0];

    // Calculate RAM.
    let ramUsed = [
        ns.getScriptRam('/batch/hack.js') * threads[0],
        ns.getScriptRam('/batch/weaken.js') * threads[1],
        ns.getScriptRam('/batch/grow.js') * threads[2],
        ns.getScriptRam('/batch/weaken.js') * threads[3]
    ];

    // Output.
    ns.tprint(`Gain \$${ns.nFormat(moneyPercent, "0.0a")} in ${ns.tFormat(endTimes[0])} with ${ramUsed[0] + ramUsed[1] + ramUsed[2] + ramUsed[3]}GiB RAM`);
    ns.tprint(`Hack(${threads[0]}) uses ${ramUsed[0]}GiB RAM, starts at ${startTimes[0]}, runs for ${Math.round(runTimes[0])} and ends at ${Math.round(endTimes[0])}`);
    ns.tprint(`Weaken(${threads[1]}) uses ${ramUsed[1]}GiB RAM, starts at ${startTimes[1]}, runs for ${Math.round(runTimes[1])} and ends at ${Math.round(endTimes[1])}`);
    ns.tprint(`Grow(${threads[2]}) uses ${ramUsed[2]}GiB RAM, starts at ${startTimes[2]}, runs for ${Math.round(runTimes[2])} and ends at ${Math.round(endTimes[2])}`);
    ns.tprint(`Weaken(${threads[3]}) uses ${ramUsed[3]}GiB RAM, starts at ${startTimes[3]}, runs for ${Math.round(runTimes[3])} and ends at ${Math.round(endTimes[3])}`);
}

