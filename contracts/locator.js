import { getServers } from '/lib/netLib.js'

/** Gets all the contracts network-wide.
 * @param {NS} ns 
 * @return {Array<string, Array<string>>} An array of server and their contracts.
**/
export function getContracts(ns) {
    const SERVERS = getServers(ns);
    const CONTRACTS = Array();

    // Look at all servers.
    for (let srv of SERVERS) {
        let contractList = Array();

        // Look at all files on this server.
        for (let file of ns.ls(srv, '.cct')) {
            // Add it to the list.
            contractList.push(file);
        }
        // This server has contracts.
        if (contractList.length > 0) {
            CONTRACTS.push([srv, contractList]);
        }
    }
    return CONTRACTS;
}

/** @param {NS} ns **/
export async function main(ns) {
    let ret = Array();
    for (let contracts of getContracts(ns)) {
        ret.push(contracts[0] + ": " + contracts[1].join('\n'));
    }
    ns.tprint('\n' + ret.join('\n'));
}