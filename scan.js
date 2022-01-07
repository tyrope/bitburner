/** @param {NS} ns
This script goes through *all* servers in the game and runs serverGrower.script on them.
Usage: run scan.js target
parameter: target: String - exact name (case sensitive, maybe) to grow.
**/

function getTools() {
    let ret = [];
    if(ns.fileExists('BruteSSH.exe', 'home')){
        ret.push('ssh');
    }
    if(ns.fileExists('FTPCrack.exe', 'home')){
        ret.push('ftp');
    }
    if(ns.fileExists('HTTPWorm.exe', 'home')){
        ret.push('http');
    }
    if(ns.fileExists('SQLInject.exe', 'home')){
        ret.push('sql');
    }
    if(ns.fileExists('relaySMTP.exe', 'home')){
        ret.push('smtp');
    }
    return ret;
}

function getRoot(server) {
    if(ns.hasRootAccess(server) == true) {
        // We already have root you dumbdumb.
        return true;
    }

    if(ns.getServerRequiredHackingLevel(server) > ns.getHackingLevel()) {
        // You are not ready.
        return false;
    }

    let tools = getTools();
    let ports = ns.getServerNumPortsRequired(server)
    if(ports > tools.length){
        // Can't open enough ports.
        return false;
    }

    // Don't you wish we could just ns.run(tools[i])? Yeah me too.
    for(let i = 0; i < ports; i++) {
        switch(tools[i]){
            case 'ssh':
                ns.brutessh(server);
            case 'ftp':
                ns.ftpcrack(server);
            case 'http':
                ns.httpworm(server);
            case 'sql':
                ns.sqlinject(server);
            case 'smtp':
                ns.smtprelay(server);
        }
    }

    // FIRE ZE MISSILES!
    ns.nuke(server);

    if(ns.hasRootAccess(server) == false){
        ns.tprint("FAILED getting root: "+server);
        return false;
    }
    return true;
}

function control(server) {
    if(getRoot(server) == false){
        // No root, no scripts.
        return;
    }

    // Kill the serverGrower script if it's running.
    if (scriptRunning("serverGrower.script", server)) {
        scriptKill("serverGrower.script", server);
    }

    scp("serverGrower.script", "home", server);
    // Calculate how many threads of the server grower we can run.
    var threads = Math.floor((getServerMaxRam(server) - getServerUsedRam(server)) / getScriptRam("serverGrower.script"))
    // run the server grower, if we can.
    if (threads > 0) {
        exec("serverGrower.script", server, threads, args[0]);
    }
}



var scanned = []; // List of all the scanned servers.
var frontier = ["home"]; // List of the servers we're going to scan.
var todo; // Current server we're scanning.
var neighbors; // The servers adjacent to todo

// Main loop.
while (frontier.length > 0) {
    // Get the next server.
    todo = frontier.shift()
    // Control it.
    control(todo);
    // Tell the script we've scanned it.
    scanned.push(todo);
    // Go through it's neighbors.
    neighbors = scan(todo);
    for (var i = 0; i < neighbors.length; i++) {
        // Check if we've scanned it.
        if (scanned.indexOf(neighbors[i]) == -1) {
            // Add it to the list if not.
            frontier.push(neighbors[i]);
        }
    }
}
tprint("Scan complete.");
