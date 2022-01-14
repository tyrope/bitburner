// Hyper Batcher (c) 2022 Tyrope
// Usage: run hyperBatcher.js [target] (source) (verbose) (percentage) (simulate)
// Parameter target: The server to take money from.
// Parameter source: The server to run the attack. (default: the server this runs on.)
// Parameter verbose: If true,s how a toast for every completed hack. (default: false)
// Parameter percentage: Percentage of maxMoney to steal. (Default: 0.2)
// Parameter simulate: If true, don't run scripts; print the expected results instead. (Default: false)

import { timeFormat } from '/lib/format.js';

export function autocomplete(data, args) {
    return [...data.servers];
}

/** Calculate the amount of hack threads needed for a batch attack.
 * @param {NS} ns
 * @param {String} tgt      The hostname of the target server.
 * @param {Number} moneyPct The percent of the target's maximum money we want to hack.
 * @return {Number[]}       The amount of threads, hack duration, security increase, actual money hacked.
 */
function calcHack(ns, tgt, moneyPct) {
    // Calculate the hack.
    let maxMoney = ns.getServerMaxMoney(tgt);
    if (moneyPct > 1) { moneyPct /= 100; }
    let srv = ns.getServer(tgt);
    srv.hackDifficulty = srv.minDifficulty;
    srv.moneyAvailable = srv.moneyMax;
    let p = ns.getPlayer();

    let threads = Math.floor(moneyPct / ns.formulas.hacking.hackPercent(srv, p));
    return [
        threads,
        ns.formulas.hacking.hackTime(srv, p),
        ns.hackAnalyzeSecurity(threads),
        ns.formulas.hacking.hackPercent(srv, p) * threads * maxMoney
    ];
}

/** Calculate the amount of grow threads needed for a batch attack.
 * @param {NS} ns
 * @param {String} tgt The hostname of the target server.
 * @param {Number} money The amount of money we've stolen.
 * @return {Number[]}  The amount of threads, grow duration, security increase.
 */
function calcGrow(ns, tgt, money) {
    let max = ns.getServerMaxMoney(tgt);
    let regrow = Math.max(1, max / (max - money));
    let srv = ns.getServer(tgt);
    srv.hackDifficulty = srv.minDifficulty;
    srv.moneyAvailable = srv.moneyMax - money;
    let p = ns.getPlayer();
    let threads = Math.ceil(Math.log(regrow) / Math.log(ns.formulas.hacking.growPercent(srv, 1, p)));
    return [
        threads,
        ns.formulas.hacking.growTime(srv, p),
        ns.growthAnalyzeSecurity(threads)
    ];
}

/** Calculate the amount of weaken threads needed for a batch attack.
 * @param {NS} ns
 * @param {String} tgt        The hostname of the target server.
 * @param {Number} secIncrase The amount of security we need to lower.
 * @return {Number[]}         The amount of threads, weaken duration, security decrease.
 */
function calcWeaken(ns, tgt, secIncrease) {
    // Calculate the weaken we need to counter hack.
    let secEffect = 0;
    let threads = Math.ceil(secIncrease / ns.weakenAnalyze(1));
    let srv = ns.getServer(tgt);
    srv.hackDifficulty = srv.minDifficulty;
    srv.moneyAvailable = srv.moneyMax;
    let p = ns.getPlayer();

    return [threads, ns.formulas.hacking.weakenTime(srv, p), secEffect];
}

/** Calculate the maximum amount of batches we can run based on server RAM
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

/** Calculates every batch we can feasibly start before the first hack lands.
 * @param {NS} ns
 * @param {Number} delay       the delay between landings.
 * @param {Number[4]} runTimes the runtime of each script.
 * @param {Number[4]} threads  the number of threads for each script.
 * @param {String} src         the hostname of the server launching the attack.
 */
function calcBatches(ns, delay, runTimes, threads, src) {
    // Calculate our delays.
    const delays = calcDelays(runTimes, delay);
    // We can run this many batches before the first hack lands.
    const firstHackLand = delays[0] + runTimes[0];
    // we can run this many batches before RAM runs out.
    let ramUse =
        ns.getScriptRam('/batch/hack.js', src) * threads[0] +
        ns.getScriptRam('/batch/grow.js', src) * threads[2] +
        ns.getScriptRam('/batch/weaken.js', src) * (threads[1] + threads[3]);
    // This will break if multiple batchers are running.
    let maxBatches = ns.getServerMaxRam(src) - ns.getServerUsedRam(src);

    // Get the start times.
    let execs = Array();
    let i = 0;
    while (maxBatches > i && firstHackLand > delays[1] + delay * (4 * i)) {
        execs.push([delays[0] + delay * (4 * i), 'H']);
        execs.push([delays[1] + delay * (4 * i), 'Wh']);
        execs.push([delays[2] + delay * (4 * i), 'G']);
        execs.push([delays[3] + delay * (4 * i), 'Wg']);
        i++;
    }
    return execs.sort((a, b) => a[0] - b[0]);
}

/** Run the batch hacks.
 * @param {NS} ns
 * @param {String} tgt        The server we're stealing money from.
 * @param {String} src        The server running the hacks.
 * @param {Number[4]} threads The amount of threads of the script types.
 * @param {Array} execs       Array of [Number,String]; indicating delay and type of script.
 * @param {Number} profit     The expected money to get per hack.
 * @return {Boolean}          Whether or not we need to recalculate threads due to level-up.
**/
async function startBatching(ns, tgt, src, threads, execs, firstLand, profit, verbose) {
    ns.print(`Launching attack: ${src} -> ${tgt}.\nFirst hack will land at T+${timeFormat(ns, firstLand)}, yielding ${ns.nFormat(profit, "0.00a")}`);
    const currLvl = ns.getHackingLevel;
    const startLvl = currLvl();
    const now = ns.getTimeSinceLastAug;
    const batchStart = now();

    let script = ""; let t; let slept = 0;
    for (let x of execs) {
        if (currLvl() != startLvl) {
            ns.print(`WARNING: [T+${timeFormat(now() - batchStart, false)}]Hack level increased, aborting hack.`);
            return true;
        }
        // Check if an abort has been called.
        if (ns.fileExists(`ABORT_${tgt}.txt`, src)) {
            // Check if this is for our target
            ns.print(`ERROR: [T+${timeFormat(now() - batchStart, false)}]ABORT received from hack.js.`);
            ns.rm(`ABORT_${tgt}.txt`, src);
            // Abort.
            return true;
        }
        switch (x[1]) {
            case "H":
                script = "/batch/hack.js";
                t = threads[0];
                break;
            case "G":
                script = "/batch/grow.js";
                t = threads[2];
                break;
            case "Wh":
                script = "/batch/weaken.js";
                t = threads[1];
                break;
            case "Wg":
                script = "/batch/weaken.js";
                t = threads[3];
                break;
        }

        if (x[0] - slept < 0) {
            ns.print(`ERROR: [T+${timeFormat(now() - batchStart, false)}]Trying to sleep a negative amount. We've fallen behind!`);
            return true;
        }
        await ns.sleep(x[0] - slept);
        slept = x[0];

        /*if (Math.abs(slept - (now() - batchStart)) > 0.2) {
            ns.print(`WARNING: Aborting script(${x[1]}) due to drift. Expected slept: ${x[0]}, actual: ${now() - batchStart} (${Math.abs((now() - batchStart) - x[0])} drift)`);
            return false;
        }*/

        // Ensure we're not bumping into RAM limitations
        if (ns.getServerMaxRam(src) - ns.getServerUsedRam(src) < ns.getScriptRam(script, src)) {
            ns.print(`ERROR: [T+${timeFormat(now() - batchStart, false)}]Aborting, out of RAM.`);
            return true;
        }
        ns.exec(script, src, t, tgt, profit, verbose, now());
    }
    return false;
}

/** Calculate the threads needed to hack tgt for pct% of maxMoney.
 * @param  {String} tgt Server hostname to attack.
 * @param  {Number} pct Percentage of maxMoney we want to steal.
 * @return {Object[3]}  Threads required, Script runtimes, money hacked per batch.
 */
function calcThreads(ns, tgt, pct) {
    let threads = Array(4), runTimes = Array(4); let sec; let profit;
    [threads[0], runTimes[0], sec, profit] = calcHack(ns, tgt, pct);
    [threads[1], runTimes[1]] = calcWeaken(ns, tgt, sec);
    [threads[2], runTimes[2], sec] = calcGrow(ns, tgt, profit);
    [threads[3], runTimes[3]] = calcWeaken(ns, tgt, sec);

    return [threads, runTimes, profit];
}

/** @param {NS} ns **/
export async function main(ns) {
    ns.clearLog();
    ns.disableLog('ALL');
    //Parameter parsing.
    if (ns.args[0] == undefined) {
        ns.tprint("ERROR: Invalid target.");
        ns.tprint("INFO: Usage: target(string), source(string), percent(number, optional), verbose(boolean, optional), simulate(boolean, optional).");
        ns.exit();
    }
    const tgt = ns.args[0];
    const src = ns.args[1] ? ns.args[1] : ns.getHostname();
    const pct = ns.args[2] ? ns.args[2] : 0.2;
    const verbose = ns.args[3] ? ns.args[3] : false;
    const sim = ns.args[4];

    // Constants.
    const delay = 100;

    // Calculate the threads needed, runTimes and actual money hacked.
    let threads, runTimes, profit;
    [threads, runTimes, profit] = calcThreads(ns, tgt, pct);

    // If we're only simulating, we just got enough info.
    if (sim) {
        let ram =
            ns.getScriptRam('/batch/hack.js') * threads[0] +
            ns.getScriptRam('/batch/grow.js') * threads[2] +
            ns.getScriptRam('/batch/weaken.js') * (threads[1] + threads[3]);
        let time = runTimes[3] + delay * 2;
        ns.tprint(`${src} -> ${tgt}, stealing \$${ns.nFormat(profit, "0.000a")} in ${ns.tFormat(time)} using ${ns.nFormat(ram * 1e9, "0.00b")} RAM`);
        ns.tprint(`Threads: hack(${threads[0]}), weaken(${threads[1]}), grow(${threads[2]}), weaken(${threads[3]});`);
        ns.exit();
    }

    if (ns.getServerMaxMoney(tgt) != ns.getServerMoneyAvailable(tgt) ||
        ns.getServerMinSecurityLevel(tgt) != ns.getServerSecurityLevel(tgt)) {
        ns.tprint(`ERROR: Server ${tgt} not prepared.`);
        ns.exit();
    }

    // ensure the src server has the latest hacking scripts.
    if (src != 'home') {
        for (let file of ['/batch/hack.js', '/batch/grow.js', '/batch/weaken.js']) {
            ns.print(`uploading ${file}`);
            await ns.scp(file, 'home', src);
        }
    }

    let recalc = false;
    while (true) {
        if (recalc) {
            if (ns.getHostname() == src) {
                ns.tprint(`FAIL: [${src}]Recalc is telling us to killall, but we're hacking from the dispatcher.`);
            }
            ns.killall(src);
            [threads, runTimes, profit] = calcThreads(ns, tgt, pct);
            recalc = false;
        }
        let execs = calcBatches(ns, delay, runTimes, threads, src);
        let time = execs.filter(x => x[1] == "H")[0][0];
        recalc = await startBatching(ns, tgt, src, threads, execs, time + runTimes[0], profit, verbose);
        // If a batch fails, make sure we let it fully run out.
        await ns.sleep(runTimes[1] + delay * 2);
    }
}

/**Returns information about a percent% batch hack against tgt (Used in gradeServers.js)
 * @params {NS} ns
 * @params {String} tgt Target server
 * @params {number} percent decimal-represented money percentage
 * @return {number[]} [RAM Usage, Time in ms, hacked money.]
 */
export function getBatchInfo(ns, tgt, percent) {
    let profit = calcHack(ns, tgt, percent)[3];
    percent = profit / ns.getServerMaxMoney(tgt);
    let threads = calcThreads(ns, tgt, percent)[0];
    let time = calcWeaken(ns, tgt, calcGrow(ns, tgt, profit)[2])[1] + 200;
    return ([
        ns.getScriptRam('/batch/hack.js', "home") * threads[0] +
        ns.getScriptRam('/batch/grow.js', "home") * threads[2] +
        ns.getScriptRam('/batch/weaken.js', "home") * (threads[1] + threads[3]),
        time,
        profit
    ]);
}