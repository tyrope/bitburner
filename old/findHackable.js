// Find Hackable (c) 2022 Tyrope
// Usage: run findHackable.js

/** Prints a server if it's below our level and has money.
 * @param {NS} ns
 * @param {String} server
**/
function checkIfTodo(ns, server) {
    let lvl = ns.getServerRequiredHackingLevel(server);
    let money = ns.getServerMaxMoney(server);

    if (lvl < ns.getHackingLevel()) {
        let isHacking = false;
        let processes = ns.ps(server);
        for (let p = 0; p < processes.length; p++) {
            if (processes[p].filename == "basicHack.js") {
                isHacking = true;
                break;
            }
        }
        if (isHacking == false && money > 0) {
            ns.print(server + " requires level " + lvl);
        }
    }
}

/** @param {NS} ns **/
export async function main(ns) {
    let scanned = [];
    let frontier = ["home"];
    let todo; let neighbors;


    ns.disableLog('ALL');
    ns.clearLog();

    // Find all servers.
    while (frontier.length > 0) {
        // Get the next server.
        todo = frontier.shift()
        // check if we need to hack this one.
        checkIfTodo(ns, todo);
        // Tell the script we've scanned it.
        scanned.push(todo);
        // Go through it's neighbors.
        neighbors = ns.scan(todo);
        for (var i = 0; i < neighbors.length; i++) {
            // Check if we've scanned it.
            if (scanned.indexOf(neighbors[i]) == -1) {
                // Add it to the list if not.
                frontier.push(neighbors[i]);
            }
        }
    }
}

