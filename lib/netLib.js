/** Breadth-first scan of the entire network.
 * @param {NS} ns
 * @return {String[]} list of servers.
**/
function getServers(ns) {
    let scanned = []; // List of all the scanned servers.
    let frontier = ["home"]; // List of the servers we're going to scan.
    let todo; // Current server we're scanning.
    let neighbors; // The servers adjacent to todo

    // Main loop.
    while (frontier.length > 0) {
        // Get the next server.
        todo = frontier.shift()
        // Tell the script we've scanned it.
        scanned.push(todo);
        // Go through it's neighbors.
        neighbors = ns.scan(todo);
        for (let i = 0; i < neighbors.length; i++) {
            // Check if we've scanned it.
            if (scanned.indexOf(neighbors[i]) == -1) {
                // Add it to the list if not.
                frontier.push(neighbors[i]);
            }
        }
    }
    return scanned;
}