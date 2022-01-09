/** @param {NS} ns**/
export async function main(ns) {
    let name = ns.getScriptName().split(".")[0];
    if (ns.args[0] === undefined) {
        let content = ns.read(ns.getScriptName());
        for (let i = 0; i < 30; i++) {
            // Create files.
            await ns.write(name + i + ".js", content);
        }
    } else {
        // Delete the files.
        for (let i = 0; i < 30; i++) {
            ns.rm(name + i + ".js");
        }
    }
}

