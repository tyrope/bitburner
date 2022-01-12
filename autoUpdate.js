// Auto Updater (c) 2022 Tyrope
// This script automatically updates all my *other* scripts
// NOTE: DOESN'T UPDATE ITSELF!

let repo = "https://raw.githubusercontent.com/tyrope/bitburner/master/";
let timeOut = 1000 * 60 * 1; // One minute on the download timeouts.

/** Download a file from the repo, making sure it's not running first.
 * @param {NS} ns
 * @param {String] fileName
**/
async function getFile(ns, fileName) {
    let timeStart = ns.getTimeSinceLastAug();

    // Subfoldered files need their slashy prefix because "reasons"
    if (fileName.includes('/')) fileName = '/' + fileName;

    let downloaded;

    if (ns.scriptRunning(fileName, 'home')) {
        ns.kill(fileName, 'home');
    }

    try {
        downloaded = await ns.wget(repo + fileName, fileName);
    } catch (e) {
        ns.toast("Failed to update " + fileName, "error", null);
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

/** @param {NS} ns **/
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