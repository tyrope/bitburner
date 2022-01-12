import { makeTable } from '/lib/tableMaker.js'

export function autocomplete(data, args) {
    return [...data.servers];
}

/** @param {NS} ns **/
export async function main(ns) {
    if (ns.args[0] == undefined) {
        ns.tprint("We require at least 1 server to spy on...");
        ns.exit();
    }
    let servers = Array();
    for (let i = 0; i < ns.args.length; i++) {
        servers.push(ns.args[i]);
    }

    ns.tail();
    ns.disableLog('ALL');
    let serverData;
    while (true) {
        ns.clearLog();
        serverData = [["Server", "$", "Sec"]];
        for (let s of servers) {
            serverData.push([
                s,
                `${ns.nFormat(ns.getServerMoneyAvailable(s), "0.00a")}/${ns.nFormat(ns.getServerMaxMoney(s), "0.00a")}`,
                `${ns.nFormat(ns.getServerSecurityLevel(s), "0.000")}/${ns.nFormat(ns.getServerMinSecurityLevel(s), "0.000")}`
            ]);
        }
        ns.print("\n" + makeTable(serverData));
        await ns.sleep(1);
    }
}