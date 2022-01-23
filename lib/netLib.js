/** Breadth-first scan of the entire network.
 * @param {NS} ns
 * @return {String[]} list of servers.
**/
export function getServers(ns) {
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

/** Find a connect route from source to target
 * @param {NS} ns
 * @param {String} source
 * @param {String} target
 * @param {String[]} listOfServers
 * @return {String[]}
**/
export function getRoute(ns, source, target, listOfServers) {
    listOfServers.push(source);
    // Cycle through all the neighbors.
    for (let server of ns.scan(source)) {
        // Target acquired.
        if (server == target) {
            listOfServers.push(server);
            return listOfServers;
        }

        // Target not yet acquired. Keep searching, as long as it's not backwards.
        if (!listOfServers.includes(server)) {
            let route = getRoute(ns, server, target, listOfServers.slice());
            if (route == false) {
                continue;
            }
            if (route[route.length - 1] == target) {
                return route;
            }
        }
    }
    return false;
}