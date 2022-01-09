/** @param {NS} ns **/
export async function main(ns) {
    let runTimes = [];
    let threads = [];

    // Set the target
    if (ns.args[1] == undefined) {
        ns.tprint("Usage: target: string, moneyPercent: number, batches?: number, source?: string");
        ns.exit();
    }
    let tgt = ns.args[0];
    let batches = ns.args[2] ? ns.args[2] : 1;
    let source = ns.args[3] ? ns.args[3] : ns.getHostname();
    let endDelay = 100;

    if (
        ns.getServerMaxMoney(tgt) != ns.getServerMoneyAvailable(tgt) ||
        ns.getServerSecurityLevel(tgt) != ns.getServerMinSecurityLevel(tgt)
    ) {
        ns.tprint(`WARN: ${tgt} Not properly prepared, running a serverGrower instead.`);
        await ns.scp("serverGrower.js", "home", server);
        // Calculate how many threads of the server grower we can run.
        let threads = Math.floor((ns.getServerMaxRam(server) - ns.getServerUsedRam(server)) / ns.getScriptRam("serverGrower.js"))
        // run the server grower, if we can.
        if (threads > 0) {
            ns.exec("serverGrower.js", server, threads, ns.args[0]);
        }
        ns.exit();
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

    // Calculate RAM.
    let ramUsed = [
        ns.getScriptRam('/batch/hack.js', source) * threads[0],
        ns.getScriptRam('/batch/weaken.js', source) * threads[1],
        ns.getScriptRam('/batch/grow.js', source) * threads[2],
        ns.getScriptRam('/batch/weaken.js', source) * threads[3]
    ];

    // Calculate delays.
    let startTimes = [0, 0, 0, 0];
    let endTimes = runTimes;

    // Delay weaken 2 by 2x endDelay.
    startTimes[3] = endDelay * 2;
    endTimes[3] = startTimes[3] + runTimes[3];

    // Delay grow by Weaken1's runtime, plus 1x delay, minus our own runtime.
    startTimes[2] = runTimes[1] + endDelay - runTimes[2];
    endTimes[2] = startTimes[2] + runTimes[2];

    // Delay hack by Weaken1's runtime, minus 1x delay, minus our own runtime.
    startTimes[0] = runTimes[1] - endDelay - runTimes[0];
    endTimes[0] = startTimes[0] + runTimes[0];

    let batchStart = ns.getTimeSinceLastAug() + endDelay;
    for (let i = 0; i < batches; i++) {
        ns.exec('/batch/hack.js', source, threads[0], tgt, batchStart + startTimes[0]);
        ns.exec('/batch/weaken.js', source, threads[1], tgt, batchStart + startTimes[1]);
        ns.exec('/batch/grow.js', source, threads[2], tgt, batchStart + startTimes[2]);
        ns.exec('/batch/weaken.js', source, threads[3], tgt, batchStart + startTimes[3]);
        batchStart += endDelay * 4;
    }
}

