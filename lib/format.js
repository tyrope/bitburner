/**Format a given number in ms to a human-readable string, except shorter.
 * @param {NS} ns
 * @param {Number} time
 * @param {Boolean} msAcc
 * @return {String} a shortened ns.tFormat();
 */
export function timeFormat(ns, time, msAcc) {
    return ns.tFormat(time, msAcc)
        .replaceAll(" second ", "s")
        .replaceAll(" seconds ", "s")
        .replaceAll(" minute ", "m")
        .replaceAll(" minutes ", "m")
        .replaceAll(" hour ", "h")
        .replaceAll(" hours ", "h");
}

/**Format a given number into an exponent.
 * @param {Number} num
 * @return {String} the number represented in exponents.
 */
export function exponentFormat(num){
    let exp = 0;
    while(num > 10){
        exp++;
        num /= 10;
    }
    return num+'e'+exp;
}