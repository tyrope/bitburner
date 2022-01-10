/** @param {NS} ns **/
let repo = "https://raw.githubusercontent.com/tyrope/bitburner/master/";
let timeOut = 1000 * 60 * 1; // One minute on the download timeouts.

async function getFile(ns, fileName) {
    let timeStart = ns.getTimeSinceLastAug();

    // Subfoldered files need their slashy prefix because "reasons"
    if (fileName.includes('/')) fileName = '/' + fileName;

    let downloaded;

    if (ns.scriptRunning(fileName, ns.getHostname())) {
        ns.kill(fileName);
    }

    try {
        downloaded = await ns.wget(repo + fileName, fileName);
    } catch (e) {
        ns.toast("Failed to update " + fileName, "error");
        return false;
    }

    // Wait for the timeout...
    while (ns.getTimeSinceLastAug() - timeStart < timeOut) {
        if (downloaded == true) {
            // We've downloaded, stop waiting.
            ns.toast("Updated: " + fileName, "success");
            return true;
        } else {
            // Don't check every millisecond.
            ns.print("Waiting on " + fileName);
            await ns.sleep(1000);
        }
    }
}

export async function main(ns) {
    ns.disableLog("sleep");

    if (ns.getHostname() != "home") {
        ns.tprint("FAIL: Run this script on home.");
        ns.exit();
    }

    // Get the list of files to auto-update.
    let timeStart = ns.getTimeSinceLastAug();
    let downloaded = await ns.wget(repo + "fileNames.txt", "fileNames.txt");
    while (ns.getTimeSinceLastAug() - timeStart < timeOut) {
        if (downloaded == true) {
            break;
        } else {
            ns.print("Waiting on filenames.txt");
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
        if (file == "") {
            continue;
        }
        await getFile(ns, file);
    }

    // Let's play nice and clean up the text file.
    ns.rm("fileNames.txt");
    ns.toast("Update complete.");
}

