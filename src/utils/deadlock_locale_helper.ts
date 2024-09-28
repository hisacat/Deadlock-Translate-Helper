import fs from "fs";
import path from "path";

function findAllTxtFiles(dir: string): string[] {
    let results: string[] = [];
    const list = fs.readdirSync(dir);

    list.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat && stat.isDirectory()) {
            results = results.concat(findAllTxtFiles(fullPath));
        } else if (file.endsWith('.txt')) {
            results.push(fullPath);
        }
    });

    return results;
}

function parse_kv_line(line: string) {
    const kvPattern = /^(\s*)"([^"]+)"(\s+)"((?:\\.|[^"])*?)"(\s*(?:\/\/.*)?)$/;

    const match = line.match(kvPattern);
    if (match == null) return null;

    return {
        leadingWhitespace: match[1], // Preserve the leading whitespace
        key: match[2],
        middleWhitespace: match[3], // Preserve whitespace between key and value
        value: match[4],
        trailingContent: match[5], // Capture any content after the value
    }
}

function get_kvs(text: string) {
    const lines = text.split(/\r?\n/);

    const dict: Record<string, string> = {};
    lines.forEach(line => {
        const parsed = parse_kv_line(line);
        if (parsed) dict[parsed.key] = parsed.value;
    });

    return dict;
}

function replaceValueByKey(text: string, targetKey: string, newValue: string) {
    const lines = text.split(/\r?\n/);

    return lines.map(line => {
        const parsed = parse_kv_line(line);

        if (parsed != null && parsed.key == targetKey)
            return `${parsed.leadingWhitespace}"${parsed.key}"${parsed.middleWhitespace}"${newValue}"${parsed.trailingContent}`;
        else
            return line;
    }).join('\r\n');
}

function getKvsOnlyInSource(source: Record<string, string>, dest: Record<string, string>) {
    const result: Record<string, string> = {};

    for (const key in source) {
        if (!(key in dest)) result[key] = source[key];
    }

    return result;
}

function dumpKvs(dumpedFilePath: string, title: string, kvs: Record<string, string>) {
    let dumpedFile = fs.readFileSync(dumpedFilePath).toString();

    const maxKeyLength = Math.max(...Object.keys(kvs).map(key => `"${key}"`.length));
    dumpedFile += "//-----------------------------------------------------------------------------\r\n";
    dumpedFile += `// ${title}\r\n`;
    dumpedFile += "//-----------------------------------------------------------------------------\r\n";
    dumpedFile += "\r\n";

    for (const key in kvs) {
        const tabCount = Math.ceil((maxKeyLength - `"${key}"`.length) / 4) + 2; // +2 tabs for consistent spacing
        const tabs = '\t'.repeat(tabCount);
        dumpedFile += `"${key}"${tabs}"${kvs[key]}"\r\n`;
    }

    fs.writeFileSync(dumpedFilePath, dumpedFile);
}

export default {
    findAllTxtFiles,
    get_kvs,
    replaceValueByKey,
    getKvsOnlyInSource,
    dumpKvs,
}
