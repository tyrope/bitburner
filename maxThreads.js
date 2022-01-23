/** @param {NS} ns **/
export async function main(ns) {
    let script = ns.args[0];
    let host = ns.args[1] ? ns.args[1] : ns.getHostname();

    // Current free RAM.
    let availRam = ns.getServerMaxRam(host) - ns.getServerUsedRam(host);

    // If we're checking for the server we're running on, remove this script's usage.
    if (host == ns.getHostname()) {
        availRam += ns.getScriptRam(ns.getScriptName(), host);
    }
    ns.tprint(
        Math.floor(availRam / ns.getScriptRam(script, host))
    );
}