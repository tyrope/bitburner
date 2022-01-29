import { getContracts } from '/contracts/locator.js';

import { solver as algoStocksI } from '/contracts/algoStocksI.js';
import { solver as algoStocksII } from '/contracts/algoStocksII.js';
import { solver as algoStocksIII } from '/contracts/algoStocksIII.js';
import { solver as algoStocksIV } from '/contracts/algoStocksIV.js';
import { solver as arrayJumping } from '/contracts/arrayJumping.js';
import { solver as findValidMath } from '/contracts/findValidMath.js';
import { solver as generateIP } from '/contracts/generateIP.js';
import { solver as largestPrimeFactor } from '/contracts/largestPrimeFactor.js';
import { solver as mergeOverlap } from '/contracts/mergeOverlap.js';
import { solver as minSumTriangle } from '/contracts/minSumTriangle.js';
import { solver as saneParens } from '/contracts/saneParens.js';
import { solver as totalWaysToSum } from '/contracts/totalWaysToSum.js';
import { solver as spiralize } from '/contracts/spiralize.js';
import { solver as uniquePathsGridI } from '/contracts/uniquePathsGridI.js';
import { solver as uniquePathsGridII } from '/contracts/uniquePathsGridII.js';

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
            case "Algorithmic Stock Trader III":
                //func = algoStocksIII;
                ns.tprint("INFO: algoStocksIII solver not finished.");
                break;
            case "Algorithmic Stock Trader IV":
                //func = algoStocksIV;
                ns.tprint("INFO: algoStocksIV solver not finished.");
                break;
            case "Array Jumping Game":
                func = arrayJumping;
                break;
            case "Find All Valid Math Expressions":
                func = findValidMath;
                break;
            case "Find Largest Prime Factor":
                //func = largestPrimeFactor;
                ns.tprint("INFO: largestPrimeFactor solver not finished.");
                break;
            case "Generate IP Addresses":
                func = generateIP;
                break;
            case "Merge Overlapping Intervals":
                func = mergeOverlap;
                break;
            case "Minimum Path Sum in a Triangle":
                func = minSumTriangle;
                break;
            case "Sanitize Parentheses in Expression":
                func = saneParens;
                break;
            case "Total Ways to Sum":
                //func = totalWaysToSum;
                ns.tprint("INFO: totalWaysToSum solver not finished.");
                break;
            case "Spiralize Matrix":
                func = spiralize;
                break;
            case "Unique Paths in a Grid I":
                func = uniquePathsGridI;
                break;
            case "Unique Paths in a Grid II":
                func = uniquePathsGridII;
                break;
            default:
                ns.tprint(`ERROR: No solver found for [${file}@${srv}]${type}`);
                break;
        }
        if (func != null) {
            reward = ns.codingcontract.attempt(func(input), file, srv, { returnReward: true });
            if (reward == "") {
                if (ns.fileExists(file, srv)) {
                    ns.tprint(
                        `FAILURE: [${file}@${srv}]${type} - ` +
                        ` (${ns.codingcontract.getNumTriesRemaining(file, srv)} tries remaining)`
                    );
                } else {
                    ns.tprint(
                        `FAILURE: [${file}@${srv}]${type} - Contract self-destructed.`
                    );
                }
            } else {
                ns.tprint(`SUCCESS: [${file}@${srv}]${type} - ${reward}`);
            }
        }
    }
}