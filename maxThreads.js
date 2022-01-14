/** @param {NS} ns **/
export async function main(ns) {
    let script = ns.args[0];
    let host = ns.args[1] ? ns.args[1] : ns.getHostname();
    let threads = Math.floor(
        (ns.getServerMaxRam(host) - ns.getServerUsedRam(host))
        / ns.getScriptRam(script, host)
    );
    ns.tprint(threads);
}