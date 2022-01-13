/**Format a given number in ms to a human-readable string, except shorter.
 * @param {NS} ns
 * @param {Number} time
 * @param {boolean} msAcc
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