/**Format a given number in ms to a human-readable string, except shorter.
 * @param {NS} ns
 * @param {Number} time
 * @param {Boolean} msAcc
 * @return {String} a shortened ns.tFormat();
 */
export function timeFormat(ns, time, msAcc) {
    return ns.tFormat(time, msAcc)
        .replaceAll("days", "d")
        .replaceAll("hours", "h")
        .replaceAll("minutes", "m")
        .replaceAll("seconds", "s")

        .replaceAll("day", "d")
        .replaceAll("hour", "h")
        .replaceAll("minute", "m")
        .replaceAll("second", "s")

        .replaceAll(",", "")
        .replaceAll(" ", "");
}

/**Format a given number into an exponent.
 * @param {Number} num
 * @return {String} the number represented in exponents.
 */
export function exponentFormat(num) {
    let exp = Math.floor(Math.log10(num));
    let base = Math.round(num / 10 ** (exp - 3)) / 1e3;
    return base + 'e' + exp;
}

/**Kind of like ns.nFormat, but better.
 * @param {Number} num
 * @param {String?} type 'game' or 'SI' suffix style (Default: 'game')
 * @return {String} formatted number.
 */
export function numFormat(num, type = 'game') {
    const GAME_SUFFIX = ['', 'k', 'm', 'b', 't', 'q', 'Q', 's', 'S', 'o', 'n'];
    const SI_SUFFIX = ['', 'k', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y'];
    let suffix;

    // pick the correct suffix array.
    if (type.toLowerCase() == 'game') {
        suffix = GAME_SUFFIX;
    } else if (type.toUpperCase() == 'SI') {
        suffix = SI_SUFFIX;
    } else {
        // No valid suffix? have an exponent.
        return exponentFormat(num);
    }

    // Get the exponent
    let exp = Math.floor(Math.log10(num));

    // Do we have a suffix that big?
    if (exp / 3 >= suffix.length || exp < 0) {
        return exponentFormat(num);
    }

    // Get the right base.
    let base = num / 10 ** (exp - exp % 3);

    // Return it with the right suffix.
    return Math.round(base * 1e3) / 1e3 + suffix[Math.floor(exp / 3)];
}