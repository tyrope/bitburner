import { getContracts } from '/contracts/locator.js';

import { solver as algoStocksI } from '/contracts/algoStocksI.js';
import { solver as algoStocksII } from '/contracts/algoStocksII.js';
import { solver as arrayJumping } from '/contracts/arrayJumping.js';
import { solver as generateIP } from '/contracts/generateIP.js';
import { solver as minSumTriangle } from '/contracts/minSumTriangle.js';
import { solver as uniquePathsGridI } from '/contracts/uniquePathsGridI.js';
import { solver as saneParens } from '/contracts/saneParens.js';
import { solver as spiralize } from '/contracts/spiralize.js';

/** @param {NS} ns **/
export async function main(ns) {
    const CONTRACTS = getContracts(ns);
    for (let [file, srv] of CONTRACTS) {
        let type = ns.codingcontract.getContractType(file, srv);
        let input = ns.codingcontract.getData(file, srv);


        switch (type) {
            case "Algorithmic Stock Trader I":
                ns.codingcontract.attempt(algoStocksI(input), file, srv);
                break;
            case "Algorithmic Stock Trader II":
                //ns.codingcontract.attempt(algoStocksII(input), file, srv);
                ns.tprint("algoStocksII solver not finished.");
                break;
            case "Array Jumping Game":
                ns.codingcontract.attempt(arrayJumping(input), file, srv);
                break;
            case "Generate IP Addresses":
                ns.codingcontract.attempt(generateIP(input), file, srv);
                break;
            case "Minimum Path Sum in a Triangle":
                ns.codingcontract.attempt(minSumTriangle(input), file, srv);
                break;
            case "Sanitize Parentheses in Expression":
                //ns.codingcontract.attempt(saneParens(input), file, srv);
                ns.tprint("saneParens solver not finished.");
                break;
            case "Spiralize Matrix":
                //ns.codingcontract.attempt(spiralize(input), file, srv);
                ns.tprint("spiralize solver not finished.");
                break;
            case "Unique Paths in a Grid I":
                ns.codingcontract.attempt(uniquePathsGridI(input), file, srv);
                break;
            default:
                let contractName = file.substr(0, file.length - 4);
                ns.tprint(`No solver found for ${contractName}@${srv} (Type: ${type})`);
        }
    }
}