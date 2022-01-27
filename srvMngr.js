// Server Manager (c) 2022 Tyrope
// Usage: run srvMngr.js [RAM] [mode] (amount) (name)
// parameter RAM: How much RAM you want (2**n)
// parameter mode:
//  0 = Check price of 1 server with RAM.
//  1 = Delete IDLE servers small than the RAM.
//  2 = Delete ALL servers small than the RAM.
//  3 = Buy servers with RAM.
// parameter amount: Amount of server(s) to buy.
// parameter name: Name of server(s) to buy.

/** @param {NS} ns **/
function deleteServers(ns, delAll) {
    let del = 0;
    let srvs = ns.getPurchasedServers();
    for (let i = 0; i < srvs.length; i++) {
        if (
            (ns.getServerMaxRam(srvs[i]) < 2 ** ns.args[0]) &&
            (delAll || ns.getServerUsedRam(srvs[i]) == 0)
        ) {
            ns.killall(srvs[i]);
            ns.deleteServer(srvs[i]);
            del++;
        }
    }
    ns.tprint(`Deleted ${del} server(s).`);
}

/** @param {NS} ns **/
async function purchase(ns) {
    for (let i = 0; i < ns.args[2]; i++) {
        while (true) {
            if (ns.getPurchasedServerCost(2 ** ns.args[0]) < ns.getServerMoneyAvailable("home")) {
                let ret = ns.purchaseServer(ns.args[3], 2 ** ns.args[0]);
                ns.tprint(`bought ${ret}`);
                break;
            } else {
                await ns.sleep(1000);
            }
        }
    }
}

/** @param {NS} ns **/
function price(ns) {
    ns.tprint(`A server with ${ns.nFormat((2 ** ns.args[0]) * 1024 ** 3, "0.0ib")} RAM costs ${ns.nFormat(ns.getPurchasedServerCost(2 ** ns.args[0]), "$0.000a")}`);
}

/** @param {NS} ns **/
export async function main(ns) {
    if (ns.args[1] === undefined) {
        ns.tprint("Usage: RAM (number), mode (number), amount (number, ignored if mode != 3), name (string, ignored if mode != 3)");
        ns.exit();
        return;
    }

    switch (ns.args[1]) {
        case 0:
            price(ns);
            break;
        case 1:
            deleteServers(ns, false);
            break;
        case 2:
            deleteServers(ns, true);
            break;
        case 3:
            await purchase(ns);
            break;
        default:
            ns.tprint("Wrong mode: 0 = price, 1 = delete idle, 2 = delete all, 3 = buy");
    }
}