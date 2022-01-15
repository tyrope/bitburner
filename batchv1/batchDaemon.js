// Batch Daemon v1 (c) 2022 Tyrope
// Usage: run batchDaemon.js [target] [moneyPercent] (simulate) (source) (batches) (delay)
// Parameter target:       The server to take money from.
// Parameter moneyPercent: The percentage of money to hack.
// Parameter simulate:     If true, only output what would happen, don't actually hack. (default: false)
// Parameter source        The server to execute the hack. (default: The server this script runs on)
// Parameter batches       The amount of batches to run. Will be limited by RAM. (default: Infinity)
// Parameter delay         The delay between attack resolutions in ms. (default: 200)

export function autocomplete(data, args) {
    return [...data.servers];
}

/**
 * Checks if the target server has been prepared for batch-hacking
 * @param {NS} ns
 * @param {String} tgt    The hostname of the target server.
 * @param {String} source The hostname of the hacking server.
 */
async function checkServerPrep(ns, tgt, source) {
    if (
        ns.getServerMaxMoney(tgt) != ns.getServerMoneyAvailable(tgt) ||
        ns.getServerSecurityLevel(tgt) != ns.getServerMinSecurityLevel(tgt)
    ) {
        ns.tprint(`WARN: ${tgt} Not properly prepared, running a serverGrower instead.`);
        await ns.scp("serverGrower.js", "home", source);
        // Calculate how many threads of the server grower we can run.
        let threads = Math.floor((ns.getServerMaxRam(source) - ns.getServerUsedRam(source)) / ns.getScriptRam("serverGrower.js"))
        // run the server grower, if we can.
        if (threads > 0) {
            ns.exec("serverGrower.js", source, threads, ns.args[0]);
        } else {
            ns.tprint(`ERROR: ${source} Doesn't have enough RAM to grow servers.`);
        }
        ns.exit();
    }
}

/**
 * Calculate the amount of hack threads needed for a batch attack.
 * @param {NS} ns
 * @param {String} tgt      The hostname of the target server.
 * @param {Number} moneyPct The percent of the target's maximum money we want to hack.
 * @param {Boolean} canSim  True is using ns.formulas instead of live data.
 * @return {Number[]}       The amount of threads, hack duration, actual money hacked, security increase.
 */
function calcHack(ns, tgt, moneyPct, canSim) {
    // Calculate the hack.
    let maxMoney = ns.getServerMaxMoney(tgt);
    if (moneyPct > 1) {
        moneyPct /= 100;
        ns.print('INFO: moneyPct was above 1, is now ' + moneyPct);
    }
    if (canSim) {
        // We're simulating using formulas, modify the target.
        let srv = ns.getServer(tgt);
        srv.hackDifficulty = srv.minDifficulty;
        srv.moneyAvailable = srv.moneyMax;
        let p = ns.getPlayer();

        let threads = Math.floor(moneyPct / ns.formulas.hacking.hackPercent(srv, p));
        return [
            threads,
            ns.formulas.hacking.hackTime(srv, p),
            ns.formulas.hacking.hackPercent(srv, p) * threads * maxMoney,
            ns.hackAnalyzeSecurity(threads)
        ];
    } else {
        let threads = Math.floor(ns.hackAnalyzeThreads(tgt, maxMoney * moneyPct));
        return [
            threads,
            ns.getHackTime(tgt),
            ns.hackAnalyze(tgt) * threads * maxMoney,
            ns.hackAnalyzeSecurity(threads)
        ];
    }
}

/**
 * Calculate the amount of grow threads needed for a batch attack.
 * @param {NS} ns
 * @param {String} tgt The hostname of the target server.
 * @param {Number} moneyPct The amount of money we've stolen.
 * @param {Boolean} canSim  True is using ns.formulas instead of live data.
 * @return {Number[]}  The amount of threads, grow duration.
 */
function calcGrow(ns, tgt, moneyPct, canSim) {
    let max = ns.getServerMaxMoney(tgt);
    let regrow = Math.max(1, max / (max - moneyPct));
    if (canSim) {
        // We're simulating using formulas, modify the target.
        let srv = ns.getServer(tgt);
        srv.hackDifficulty = srv.minDifficulty;
        srv.moneyAvailable = srv.moneyMax - moneyPct;
        let p = ns.getPlayer();

        return [
            Math.ceil(Math.log(regrow) / Math.log(ns.formulas.hacking.growPercent(srv, 1, p))),
            ns.formulas.hacking.growTime(srv, p)
        ];
    } else {
        return [
            Math.ceil(ns.growthAnalyze(tgt, regrow)),
            ns.getGrowTime(tgt)
        ];
    }
}

/**
 * Calculate the amount of weaken threads needed for a batch attack.
 * @param {NS} ns
 * @param {String} tgt        The hostname of the target server.
 * @param {Number} secIncrase The amount of security we need to lower.
 * @param {Boolean} canSim    True is using ns.formulas instead of live data.
 * @return {Number[]}         The amount of threads, weaken duration.
 */
function calcWeaken(ns, tgt, secIncrease, canSim) {
    // Calculate the weaken we need to counter hack.
    let secEffect = 0;
    let threads = 0;
    while (secEffect < secIncrease) {
        threads++;
        secEffect = ns.weakenAnalyze(threads);
    }
    if (canSim) {
        let srv = ns.getServer(tgt);
        srv.hackDifficulty = srv.minDifficulty;
        srv.moneyAvailable = srv.moneyMax;
        let p = ns.getPlayer();

        return [threads, ns.formulas.hacking.weakenTime(srv, p)];
    } else {
        return [threads, ns.getWeakenTime(tgt)];
    }
}

/**
 * Calculate the maximum amount of batches we can run based on server RAM
 * @param {NS} ns
 * @param {String} tgt        The hostname of the target server.
 * @param {String} source     The hostname of the hacking server.
 * @param {Number} batches    The maximum amount of batches we'd ever want.
 * @param {Number[4]} threads The amount of threads we need for 1 batch; order: HWGW.
 * @return {Number}           The amount of batches we can run.
 */
function calcBatches(ns, tgt, source, batches, threads) {
    // Calculate RAM.
    let ramUsed =
        ns.getScriptRam('/batchv1/hack.js', source) * threads[0] +
        ns.getScriptRam('/batchv1/weaken.js', source) * (threads[1] + threads[3]) +
        ns.getScriptRam('/batchv1/grow.js', source) * threads[2];

    // get the max batches we can run for this server.
    let maxBatches = Math.floor((ns.getServerMaxRam(source) - ns.getServerUsedRam(source)) / ramUsed);

    // limit.
    if (batches > maxBatches) {
        return maxBatches;
    }
    return batches;
}

/**
 * Calculate the maximum amount of batches we can run based on server RAM
 * @param  {String} runTimes The duration of all attacks (in ms); order: HWGW.
 * @param  {String} delay    The delay between end times (in ms).
 * @return {Number[]}        The start time of all attacks (in ms); order: HWGW.
 */
function calcDelays(runTimes, delay) {
    return [
        runTimes[1] - delay - runTimes[0],
        0,
        runTimes[1] + delay - runTimes[2],
        delay * 2
    ];
}

/**
 * Returns information about a percent% batch hack against tgt
 * @params {NS} ns
 * @params {String} tgt Target server
 * @params {number} percent decimal-represented money percentage
 * @param {Boolean} canSim  True is using ns.formulas instead of live data.
 * @return {number[]} [RAM Usage, Time in ms, hacked money.]
 */
export function getBatchInfo(ns, tgt, percent, canSim) {
    if (!ns.fileExists("Formulas.exe", "home")) {
        canSim = false;
    }

    let threads = Array(4);
    // Calculate the hacking threads.
    let calc = calcHack(ns, tgt, percent, canSim);
    threads[0] = calc[0];
    let moneyPct = calc[2];

    // Calculate the weaken we need to counter hack.
    calc = calcWeaken(ns, tgt, calc[3], canSim);
    threads[1] = calc[0];

    // Calculate the grow we need.
    calc = calcGrow(ns, tgt, moneyPct, canSim);
    threads[2] = calc[0];

    // Calculate the weaken we need to counter grow.
    calc = calcWeaken(ns, tgt, ns.growthAnalyzeSecurity(threads[2]), canSim);
    threads[3] = calc[0];

    return ([
        ns.getScriptRam('/batchv1/hack.js', "home") * threads[0] +
        ns.getScriptRam('/batchv1/grow.js', "home") * threads[2] +
        ns.getScriptRam('/batchv1/weaken.js', "home") * (threads[1] + threads[3]),
        calc[1],
        moneyPct
    ]);
}

/** @param {NS} ns **/
export async function main(ns) {
    let runTimes = [];
    let threads = [];

    ns.disableLog('exec');

    // TODO: Better argument parsing.
    if (ns.args[1] == undefined) {
        ns.tprint("Usage: target: string, moneyPercent: number, simulate?: boolean, source?: string, batches?: number, delay?: number");
        ns.exit();
    }

    let tgt = ns.args[0];
    let moneyPct = ns.args[1];
    let simulate = ns.args[2] ? ns.args[2] : false;
    let source = ns.args[3] ? ns.args[3] : ns.getHostname();
    let batches = ns.args[4] ? ns.args[4] : Infinity;
    let delay = ns.args[5] ? ns.args[5] : 200;

    // Ensure the server is prepped.
    if (!simulate) {
        await checkServerPrep(ns, tgt, source);
    }

    let cansim = ns.fileExists('Formulas.exe', 'home');

    // Calculate the hacking threads.
    let calc = calcHack(ns, tgt, moneyPct, cansim);
    threads.push(calc[0]); runTimes.push(calc[1]);
    moneyPct = calc[2];

    // Calculate the weaken we need to counter hack.
    calc = calcWeaken(ns, tgt, calc[3], cansim);
    threads.push(calc[0]); runTimes.push(calc[1]);

    // Calculate the grow we need.
    calc = calcGrow(ns, tgt, moneyPct, cansim);
    threads.push(calc[0]); runTimes.push(calc[1]);

    // Calculate the weaken we need to counter grow.
    calc = calcWeaken(ns, tgt, ns.growthAnalyzeSecurity(threads[2]), cansim);
    threads.push(calc[0]); runTimes.push(calc[1]);

    // Ensure the source server has the latest version of the batchfiles.
    for (let file of ["hack", "grow", "weaken"]) {
        await ns.scp(`/batchv1/${file}.js`, "home", source);
    }

    // Get the max amount of Batches we're allowed to run.
    batches = calcBatches(ns, tgt, source, batches, threads);

    // Calculate delays.
    let startTimes = calcDelays(runTimes, delay);

    if (simulate) {
        let ram = [
            ns.getScriptRam('/batchv1/hack.js', source) * threads[0],
            ns.getScriptRam('/batchv1/weaken.js', source) * threads[1],
            ns.getScriptRam('/batchv1/grow.js', source) * threads[2],
            ns.getScriptRam('/batchv1/weaken.js', source) * threads[3]
        ];

        if (batches == 0) {
            // If we can't run any batches during a simulation, just run one.
            batches = 1;
        }

        ns.tprint(
            `Gain \$${ns.nFormat(moneyPct * batches, "0.0a")} in ${ns.tFormat(startTimes[3] + runTimes[3] + (delay * 4 * batches))}\n` +
            `In ${batches} batches using ${ns.nFormat(((ram[0] + ram[1] + ram[2] + ram[3]) * batches) * 1e9, "0.0b")} RAM total.\n` +
            `Hack(${threads[0]}) uses ${ns.nFormat(ram[0] * 1e9, "0.0b")} RAM.\n` +
            `Weaken(${threads[1]}) uses ${ns.nFormat(ram[1] * 1e9, "0.0b")} RAM.\n` +
            `Grow(${threads[2]}) uses ${ns.nFormat(ram[2] * 1e9, "0.0b")} RAM.\n` +
            `Weaken(${threads[3]}) uses ${ns.nFormat(ram[3] * 1e9, "0.0b")} RAM.\n`);
    } else {
        ns.tprint(`INFO: ${source} running ${batches} batches against ${tgt}.`);
        let batchStart = ns.getTimeSinceLastAug() + delay;
        for (let i = 0; i < batches; i++) {
            ns.exec('/batchv1/hack.js', source, threads[0], tgt, batchStart + startTimes[0], moneyPct);
            ns.exec('/batchv1/weaken.js', source, threads[1], tgt, batchStart + startTimes[1]);
            ns.exec('/batchv1/grow.js', source, threads[2], tgt, batchStart + startTimes[2]);
            ns.exec('/batchv1/weaken.js', source, threads[3], tgt, batchStart + startTimes[3]);
            batchStart += delay * 4;
        }
    }
}