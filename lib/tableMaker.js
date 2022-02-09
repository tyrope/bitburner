// Table Maker (c) 2022 Tyrope
// Usage: import {squishLines, makeTable} from '/lib/tableMaker.js'

/**
 * Modifies one css property of the specified log
 * @param logName name that appears in the tilebar of the log
 * @param style property name of the style to change (hyphen-case)
 * @param value value to change the property to
 * @returns true if the log was found, false otherwise
 * @link https://discord.com/channels/415207508303544321/895204896788328448/930188523888336956
 * @author Discord cyn#1161
 */
function modifyLogStyle(logName, style, value) {
    const doc = eval('document');
    const titleBar = doc.querySelector(`[title="${logName}"]`)
    if (titleBar == null || titleBar == undefined) return false

    const paragraphs = titleBar.parentNode.parentNode.parentNode
        .lastChild.firstChild.firstChild.childNodes

    for (const p of paragraphs) {
        if (p.style.getPropertyValue(style) != value) {
            p.style.setProperty(style, value)
        }
    }
    return true
}

/**Wrapper for modifyLogStyle
 * @param {String} logName script name and arguments.
 */
export function squishLines(logName) {
    if (logName.includes(" ") == false) {
        // There's no arguments, add a trailing space.
        logName += " ";
    }
    modifyLogStyle(logName, 'line-height', '1');
}

/** Because all self-respecting datasheets should be displayed in a pretty way.
 * @param {Object[]} data          Information to put in a table.
 * @param {Boolean} hasMiddleRows? When true, adds horizontal lines between ALL rows, not just below the header.
 * @return {String}                The table, in a multiline string.
**/
export function makeTable(data, hasMiddleRows) {
    // Thanks to @Daturo#2506 on the Bitburner Discord for showing me these ASCII characters.
    let border = [['╔', '╦', '╗'], ['╠', '╬', '╣'], ['╚', '╩', '╝'], ['═', '║']];
    // Find the widest text in each colomn
    let widths = Array();
    // Loop rows.
    for (let y = 0; y < data.length; y++) {
        // Loop columns.
        for (let x = 0; x < data[y].length; x++) {
            // Check if we're bigger (+2 for spaces between data and borders).
            if (widths[x] == undefined) {
                widths[x] = String(data[y][x]).length + 2;
            } else if (widths[x] < String(data[y][x]).length + 2) {
                widths[x] = String(data[y][x]).length + 2;
            }
        }
    }
    let table = "";
    // Top row.
    table += border[0][0]
    for (let w of widths) {
        table += "".padEnd(w, border[3][0]);
        table += border[0][1];
    }
    table = table.substr(0, table.length - 1) + border[0][2] + "\n";
    // Draw the actual data bits.
    for (let y = 0; y < data.length; y++) {
        table += border[3][1];
        for (let x = 0; x < widths.length; x++) {
            if (data[y].length > x) {
                table += " " + String(data[y][x]).padEnd(widths[x] - 1) + border[3][1];
            } else {
                table += "".padEnd(widths[x]) + border[3][1];
            }
        }
        table += "\n";

        if (hasMiddleRows || y == 0) {
            // Insert a horizontal line.
            if (y != data.length - 1) {
                table += border[1][0];
                for (let x = 0; x < data[y].length; x++) {
                    table += "".padEnd(widths[x], border[3][0]);
                    if (x != data[y].length - 1) {
                        table += border[1][1];
                    } else {
                        table += border[1][2] + "\n";
                    }
                }
            }
        }
    }

    // Bottom row.
    table += border[2][0];
    for (let w of widths) {
        table += "".padEnd(w, border[3][0]);
        table += border[2][1];
    }
    table = table.substr(0, table.length - 1) + border[2][2];

    return table;
}