import { getContracts } from '/contracts/locator.js';

import { solver as algoStocksI } from '/contracts/algoStocksI.js';
import { solver as algoStocksII } from '/contracts/algoStocksII.js';
import { solver as arrayJumping } from '/contracts/arrayJumping.js';
import { solver as findValidMath } from '/contracts/findValidMath.js';
import { solver as generateIP } from '/contracts/generateIP.js';
import { solver as minSumTriangle } from '/contracts/minSumTriangle.js';
import { solver as saneParens } from '/contracts/saneParens.js';
import { solver as spiralize } from '/contracts/spiralize.js';
import { solver as uniquePathsGridI } from '/contracts/uniquePathsGridI.js';

/** @param {NS} ns **/
export async function main(ns) {
    const CONTRACTS = getContracts(ns);
    for (let [file, srv] of CONTRACTS) {
        let type = ns.codingcontract.getContractType(file, srv);
        let input = ns.codingcontract.getData(file, srv);
        let reward = false;
        let func = null;

        switch (type) {
            case "Algorithmic Stock Trader I":
                func = algoStocksI;
                break;
            case "Algorithmic Stock Trader II":
                func = algoStocksII;
                break;
            case "Array Jumping Game":
                func = arrayJumping;
            case "Find All Valid Math Expressions":
                //func = findValidMath;
                ns.tprint("findValidMath solver not finished.");
                break;
            case "Generate IP Addresses":
                func = generateIP;
                break;
            case "Minimum Path Sum in a Triangle":
                func = minSumTriangle;
                break;
            case "Sanitize Parentheses in Expression":
                //func = saneParens;
                ns.tprint("saneParens solver not finished.");
                break;
            case "Spiralize Matrix":
                //func = spiralize;
                ns.tprint("spiralize solver not finished.");
                break;
            case "Unique Paths in a Grid I":
                func = uniquePathsGridI;
                break;
            default:
                ns.tprint(`No solver found for ${file}@${srv} (Type: ${type})`);
                break;
        }
        if (func != null) {
            reward = ns.codingcontract.attempt(func(input), file, srv, { returnReward: true });
            if (reward == "") {
                ns.tprint(
                    `ERROR: Failed ${file}@${srv} Type: ${type}` +
                    ` (${ns.codingcontract.getNumTriesRemaining(file, srv)} tries remaining)`
                );
            } else {
                ns.tprint(`SUCCESS: [${file}@${srv}]${reward} `);
            }
        }
    }
}