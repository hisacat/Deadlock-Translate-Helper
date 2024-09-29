import 'source-map-support/register'

import fs from "fs";
import path from "path";
import chalk from 'chalk';
import readline from 'readline';
import deadlock_locale_helper from './utils/deadlock_locale_helper';
import logger from './logger';

const version = "v1.0.0";
// node.js version: v18.20.4

logger.log(chalk.bold.green("---------------------------------------------------------"));
logger.log(chalk.bold.green("    ___               _ _            _       _____       "));
logger.log(chalk.bold.green("   /   \\___  __ _  __| | | ___   ___| | __  /__   \\/\\  /\\"));
logger.log(chalk.bold.green("  / /\\ / _ \\/ _` |/ _` | |/ _ \\ / __| |/ /    / /\\/ /_/ /"));
logger.log(chalk.bold.green(" / /_//  __/ (_| | (_| | | (_) | (__|   <    / / / __  / "));
logger.log(chalk.bold.green("/___,' \\___|\\__,_|\\__,_|_|\\___/ \\___|_|\\_\\___\\/  \\/ /_/  "));
logger.log(chalk.bold.green("                                        |_____|          "));
logger.log(chalk.bold.white(`Deadlock TranslateHelper ${version}`));
logger.log(chalk.yellow("Contact: ahisacat@gmail.com / Discord: hisacat)"));
logger.log(chalk.bold.green("---------------------------------------------------------"));
logger.log(chalk.green());

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function enterToClose(): Promise<void> {
    return new Promise((resolve) => {
        rl.question('Press Enter to continue...', () => {
            rl.close();
            resolve();
        });
    });
}

try {
    (async () => {
        const configJsonPath = "./config.json";
        if (fs.existsSync(configJsonPath) == false) {
            logger.log(chalk.red(`Cannot find ${chalk.bold(chalk.yellow(`"${path.basename(configJsonPath)}"`))} file.`));
            logger.log(chalk.red(`Please re-install DeadlockTranslateHelper`));
            await enterToClose();
            process.exit();
        }

        const config: {
            deadlockPath: string,
            baseLanguageCode: string,
            targetLanguageCode: string
        } = JSON.parse(fs.readFileSync(configJsonPath).toString());

        const translatedDirPath = "./1.translated";
        const dumpedDirPath = "./2.dumped";
        const outputDirPath = "./3.output";

        const getOriginFilePath = (filePath: string) => path.join(config.deadlockPath, filePath);
        const getEditedFilePath = (filePath: string) => path.join(translatedDirPath, filePath);
        const getDumpedFilePath = (filePath: string) => path.join(dumpedDirPath, filePath);
        const getOutputFilePath = (filePath: string) => path.join(outputDirPath, filePath);

        const targetTextFilePostfix = `${config.targetLanguageCode}.txt`;
        const baseTextFilePostfix = `${config.baseLanguageCode}.txt`;
        const baseTxtPaths: string[] = []

        logger.log(chalk.bold('1. Find Deadlock original files...'));
        {
            if (fs.existsSync(config.deadlockPath)) {
                const koreanaTxtPaths =
                    deadlock_locale_helper.findAllTxtFiles(path.join(config.deadlockPath, 'game/citadel/resource/localization'))
                        .filter(e => e.toLowerCase().endsWith(targetTextFilePostfix))
                        .map(e => path.relative(config.deadlockPath, e));
                baseTxtPaths.push(...koreanaTxtPaths.map(e => e.toLowerCase().replace(targetTextFilePostfix, baseTextFilePostfix)));

                logger.log(`   Deadlock files detected at ${chalk.bold.green(`"${config.deadlockPath}"`)}.`);
                logger.log(`   ${chalk.green(`${chalk.bold(baseTxtPaths.length)} of localization txt file detected.`)}`);
            } else {
                logger.log(chalk.red(`   Cannot find deadlock from ${chalk.bold(chalk.yellow(`"${config.deadlockPath}"`))}`));
                logger.log(chalk.red(`   Please install deadlock.if already installed, modify ${chalk.bold.green(`"deadlockPath"`)} from ${chalk.bold.green(`"config.json"`)}`));
                await enterToClose();
                process.exit();
            }

            logger.log();
        }

        logger.log(chalk.bold(`2. Copy base ${config.baseLanguageCode} txts...`));
        {
            for (const englishTxtPath of baseTxtPaths) {
                const englishFilePath = getOriginFilePath(englishTxtPath);
                const dumpedFilePath = getDumpedFilePath(englishTxtPath.toLowerCase().replace(baseTextFilePostfix, targetTextFilePostfix));
                const outputFilePath = getOutputFilePath(englishTxtPath.toLowerCase().replace(baseTextFilePostfix, targetTextFilePostfix));

                logger.log(`   - Copy base ${chalk.bold(chalk.green(path.basename(`"${englishFilePath}"`)))} txt file as ${chalk.bold(chalk.green(`"${path.basename(outputFilePath)}"`))}...`);

                // Make directories first then copy.
                fs.mkdirSync(path.dirname(dumpedFilePath), { recursive: true });
                fs.mkdirSync(path.dirname(outputFilePath), { recursive: true });
                fs.writeFileSync(dumpedFilePath, '');
                fs.copyFileSync(englishFilePath, outputFilePath);
            }
            logger.log();
        }

        logger.log(chalk.bold(`3. Update ${config.targetLanguageCode} values from existing keys`));
        {
            for (const englishTxtPath of baseTxtPaths) {
                const englishFilePath = getOriginFilePath(englishTxtPath);
                const baseTargetFilePath = getOriginFilePath(englishTxtPath.toLowerCase().replace(baseTextFilePostfix, targetTextFilePostfix));
                const translatedTargetFilePath = getEditedFilePath(englishTxtPath.toLowerCase().replace(baseTextFilePostfix, targetTextFilePostfix));
                const dumpedFilePath = getDumpedFilePath(englishTxtPath.toLowerCase().replace(baseTextFilePostfix, targetTextFilePostfix));
                const outputFilePath = getOutputFilePath(englishTxtPath.toLowerCase().replace(baseTextFilePostfix, targetTextFilePostfix));

                const originEnglishFile = fs.readFileSync(englishFilePath).toString();
                const baseTargetFile = fs.readFileSync(baseTargetFilePath).toString();
                const translatedTargetFile = fs.readFileSync(translatedTargetFilePath).toString();
                let outputFile = fs.readFileSync(outputFilePath).toString();

                const originEnglish_kv = deadlock_locale_helper.get_kvs(originEnglishFile);
                const baseTarget_kv = deadlock_locale_helper.get_kvs(baseTargetFile);
                const translatedTarget_kv = deadlock_locale_helper.get_kvs(translatedTargetFile);

                logger.log(`   - Replace ${chalk.bold.green(`"${path.basename(outputFilePath)}"`)} values from original ${config.targetLanguageCode} txt...`);
                for (const key in baseTarget_kv) outputFile = deadlock_locale_helper.replaceValueByKey(outputFile, key, baseTarget_kv[key]);

                logger.log(`   - Replace ${chalk.bold.green(`"${path.basename(outputFilePath)}"`)} values from translated ${config.targetLanguageCode} txt...`)
                for (const key in translatedTarget_kv) outputFile = deadlock_locale_helper.replaceValueByKey(outputFile, key, translatedTarget_kv[key]);

                fs.writeFileSync(outputFilePath, outputFile);

                // Dump does not translated values.
                const notTranslated_kv = deadlock_locale_helper.getKvsOnlyInSource(deadlock_locale_helper.getKvsOnlyInSource(originEnglish_kv, baseTarget_kv), translatedTarget_kv);
                const notTranslated_kv_length = Object.keys(notTranslated_kv).length;

                if (notTranslated_kv_length > 0) {
                    logger.log(chalk.yellow(`       - ${chalk.bold(notTranslated_kv_length)} of english keys not exists in ${config.targetLanguageCode} txt.do dump...`));
                    deadlock_locale_helper.dumpKvs(dumpedFilePath, "Only exists keys on steam english file:", notTranslated_kv);
                    logger.log(chalk.yellow(`       - ${chalk.bold(notTranslated_kv_length)} of english keys not exists in ${config.targetLanguageCode} txt.do dumped.`));
                }
                logger.log(`   - ${chalk.bold.green(`"${path.basename(outputFilePath)}"`)} was updated.`)
                logger.log();
            }
        }

        logger.log(chalk.bold(`Done! check ${chalk.green(`"${outputDirPath}"`)} directory.`));
        await enterToClose();
        process.exit();
    })();
} catch (error) {
    logger.error(error);

    (async () => {
        await enterToClose();
        process.exit();
    })();
}
