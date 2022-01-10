// Server Manager (c) 2022 Tyrope
// Usage: run srvMngr.js [RAM] [mode]
// parameter RAM: Amount of RAM.
// parameter mode:
//  0 = Buy servers with RAM.
//  1 = Delete servers small than the RAM.
//  2 = Check price of 1 server with RAM.
// parameter amount: Amount of server(s) to buy.
// parameter name: Name of server(s) to buy.


function deleteServers(ns) {
    let del = 0;
    let srvs = ns.getPurchasedServers();
    for (let i = 0; i < srvs.length; i++) {
        if (ns.getServerMaxRam(srvs[i]) < ns.args[0]) {
            ns.killall(srvs[i]);
            ns.deleteServer(srvs[i]);
            del++;
        }
    }
    ns.tprint(`Deleted ${del} servers.`);
}

async function purchase(ns) {
    for (i = 0; i < ns.args[2]; i++) {
        while (true) {
            if (price(ns) < ns.getServerMoneyAvailable("home")) {
                ns.tprint(`bought ${ns.purchaseServer(ns.args[3], ns.args[0])}`);
                continue;
            } else {
                await ns.sleep(1000);
            }
        }
    }
}

function price(ns) {
    ns.tprint(ns.getPurchasedServerCost(ns.args[0]));
}

export async function main(ns) {
    if (ns.args[0] === undefined) {
        ns.tprint("No RAM amount provided.");
        ns.exit();
    }

    switch (ns.args[1]) {
        case 0:
            await purchase(ns);
            break;
        case 1:
            deleteServers(ns);
            break;
        case 2:
            price(ns);
            break;
        default:
            ns.tprint("Wrong parameters.");
    }
}

