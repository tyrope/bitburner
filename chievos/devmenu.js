/** @param {NS} ns **/
export async function main(ns) {
    Object.entries(eval("document").getElementsByClassName("jss3 MuiBox-root")[0])
        .find(x => x[0].startsWith("__reactProps"))[1].children.props.router.toDevMenu();
}