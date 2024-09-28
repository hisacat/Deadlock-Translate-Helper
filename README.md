# Deadlock-Translate-Helper
Utility for updating and modifying localization files of Deadlock.

## Usage
1. Place the `localization` txt files to be translated in the `1.translated` folder, following the same structure as the `game` folder in Deadlock.  
   (Currently, the default Korean user patch is included.)
2. Run `DeadlockTranslateHelper.exe`.
3. Merged localization files will be generated in the `3.output` folder.  
4. Any missing key values from the `localization` txt files in the `1.translated` folder will be organized and created in the `2.dumped` folder. Use this as a reference to complete the localization.

## How It Works
1. The base language (default: English) from the Deadlock installation folder is renamed to the target language (default: Koreana) and copied to the `3.output` folder.
2. If there is any key value that exists in the target language within the installed Deadlock, the value will be overwritten with this.
3. If there is any key value that exists in the target language within the `1.translated` folder, the value will be overwritten with this.
4. If a key value does not exist in either the target language of the installed Deadlock or the `1.translated` folder, it will be recorded in the `2.dumped` folder.

## config.json
- `deadlockPath`: The installation path of Deadlock. The path separator can be either `\\` or `/`.
- `baseLanguageCode`: The base language code used to detect key values.
- `targetLanguageCode`: The code for the target language to be processed.
