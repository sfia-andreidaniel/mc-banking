import * as fs from "fs";

export const loadEnvFromFileIfExists = (fileName: string): boolean => {

    if (!fs.existsSync(fileName)) {
        console.log("loadEnvFromFileIfExists(" + JSON.stringify(fileName) + "): file not found");
        return false;
    }

    let buffer: string[] = String(fs.readFileSync(fileName)).split("\n");

    for (let i: number = 0, len = buffer.length; i<len; i++ ) {

        let line: string = buffer[i].trim();

        if ('' === line) {
            continue;
        }

        let [ varName, varValue ] = line.split("=");

        if (undefined === process.env[varName]) {
            console.log("set: ", varName, " to ", varValue);
            process.env[varName] = varValue;
        }

    }

    return true;
}