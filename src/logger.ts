import fs from "fs";

const logFilePath = `./logs.txt`;

function clearLogFile(logFilePath: string) {
    fs.writeFileSync(logFilePath, '');
};
clearLogFile(logFilePath);

function logToFile(logFilePath: string, level: string, message?: any, ...optionalParams: any[]) {
    const logTitle = `${new Date().toISOString()} [${level.toUpperCase()}]: `;

    let logContent = `${message}${optionalParams.length <= 0 ? `` : ` ${optionalParams.join(' ')}`}`;

    // Indent to match logTitle.
    logContent = logContent.split('\n').map((line, index) =>
        index === 0 ? logTitle + line : ' '.repeat(logTitle.length) + line)
        .join(`\n`);

    fs.appendFileSync(logFilePath, logContent + '\n');
}

export default {
    log: (message?: any, ...optionParams: any[]) => {
        if (message === undefined) message = '';
        console.log(message, ...optionParams);

        logToFile(logFilePath, 'log', message, ...optionParams);
    },
    warn: (message?: any, ...optionParams: any[]) => {
        if (message === undefined) message = '';
        console.log(message, ...optionParams);

        logToFile(logFilePath, 'warn', message, ...optionParams);
    },
    error: (message?: any, ...optionParams: any[]) => {
        if (message === undefined) message = '';
        console.log(message, ...optionParams);

        logToFile(logFilePath, 'error', message, ...optionParams);
    }
}
