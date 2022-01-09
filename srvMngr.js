// Server Manager (c) 2022 Tyrope
// Usage: run srvMngr.js [RAM] [mode]
// parameter RAM: Amount of RAM.
// parameter mode:
//  1 = Delete servers small than the RAM.
//  2 = Check price of 1 server with RAM.
//  Anything else = Buy max amount of servers with RAM.

function deleteServers(ns) {
    let srvs = ns.getPurchasedServers();
    for (let i = 0; i < srvs.length; i++) {
        if (ns.getServerMaxRam(srvs[i]) < ns.args[0]) {
            ns.killall(srvs[i]);
            ns.deleteServer(srvs[i]);
        }
    }
}

async function purchase(ns) {
    while (ns.getPurchasedServers().length < ns.getPurchasedServerLimit()) {
        if (price(ns) < ns.getServerMoneyAvailable("home")) {
            ns.purchaseServer("srv", ns.args[0]);
        } else {
            await ns.sleep(1000);
        }
    }
}

function price(ns) {
    return ns.getPurchasedServerCost(ns.args[0]);
}

export async function main(ns) {
    if (ns.args[0] === undefined) {
        ns.tprint("No RAM amount provided.");
        ns.exit();
    }

    switch (ns.args[1]) {
        case 1:
            deleteServers(ns);
            break;
        case 2:
            ns.tprint(price(ns));
            break;
        default:
            await purchase(ns);
    }
}

