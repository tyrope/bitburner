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
        // Look at all files on this server.
        for (let file of ns.ls(srv, '.cct')) {
            // Add it to the list.
            CONTRACTS.push([file, srv]);
        }
    }
    return CONTRACTS;
}

/** @param {NS} ns **/
export async function main(ns) {
    let ret = Array();
    for (let contracts of getContracts(ns)) {
        let type = ns.codingcontract.getContractType(contracts[0], contracts[1]);
        ret.push(`${contracts[1]}: ${contracts[0]} (type: ${type})`);
    }
    ns.tprint('\n' + ret.join('\n'));
}