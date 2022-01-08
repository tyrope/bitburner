/** @param {NS} ns **/

function checkIfTodo(ns, server) {
    // TODO change below to the effective hacking level required.
    let lvl = ns.getServerRequiredHackingLevel(server);

    if (lvl < ns.getHackingLevel()) {
        let isHacking = false;
        let processes = ns.ps(server);
        for (let p = 0; p < processes.length; p++) {
            if (processes[p].filename == "basicHack.js") {
                isHacking = true;
                break;
            }
        }
        if (isHacking == false && lvl > 1) {
            ns.print(server + " requires level " + lvl);
        }
    }
}

export async function main(ns) {
    let scanned = [];
    let frontier = ["home"];
    let todo; let neighbors;


    ns.disableLog('scan');
    ns.disableLog('getHackingLevel');
    ns.disableLog('getServerRequiredHackingLevel');
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

