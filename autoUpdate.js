/** @param {NS} ns **/
let repo = "https://raw.githubusercontent.com/tyrope/bitburner/master/";
let timeOut = 1000 * 60 * 1; // One minute on the download timeouts.

async function getFile(ns, fileName) {
    let timeStart = ns.getTimeSinceLastAug();
    let downloaded = await ns.wget(repo + fileName, fileName);

    // Wait for the timeout...
    while (ns.getTimeSinceLastAug() - timeStart < timeOut) {
        if (downloaded == true) {
            // We've downloaded, stop waiting.
            ns.toast("Updated: " + fileName, "success");
            return true;
        } else {
            // Don't check every millisecond.
            await ns.sleep(1000);
        }
    }

    // This is bad, sorta.
    ns.toast("Failed to update file: " + fileName, "error");
    return false;
}

export async function main(ns) {
    // Get the list of files to auto-update.
    let timeStart = ns.getTimeSinceLastAug();
    let downloaded = await ns.wget(repo + "fileNames.txt", "fileNames.txt");
    while (ns.getTimeSinceLastAug() - timeStart < timeOut) {
        if (downloaded == true) {
            break;
        } else {
            await ns.sleep(1000);
        }
    }

    // Did the download complete?
    if (downloaded == false) {
        ns.toast("Couldn't grab fileNames.txt, aborting update.", "error");
        ns.exit();
    }

    // Read the list of files and pdate all of them.
    let files = ns.read("fileNames.txt");
    for (let file of files.split("\n")) {
        if(file == ""){
            continue;
        }
        await getFile(ns, file);
    }
}

