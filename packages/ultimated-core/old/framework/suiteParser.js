import fs from 'fs';
import commonUtils from './commonUtils';

const SuiteParser = class {
    getActiveSuitesStructure() {
        let suitesStructure = {};
        const activeSuitesFiles = this._getActiveSuitesFilesPath();

        activeSuitesFiles.forEach((suiteFilePath) => {
            const suiteFile = fs.readFileSync(suiteFilePath, 'utf-8');
            const suiteFileLines = suiteFile.split('\n');
            const suiteStructure = this._getSuitesStructure(suiteFileLines);
            suitesStructure = Object.assign(suitesStructure, suiteStructure);
        });

        return suitesStructure;
    }

    _getActiveSuitesFilesPath() {
        const mainPath = commonUtils.getMainPath();
        const testListFile = fs.readFileSync(`${mainPath}/tests/tests.js`, 'utf-8');
        const testListFileLines = testListFile.trim().split(' ').join('').split('\n');
        let activeSuiteFiles = [];

        testListFileLines.forEach((line) => {
            if (!commonUtils.isFileLineCommented(line)) {
                const filePath = commonUtils.getStringBetweenSingleQuotes(line).replace('./', '');
                activeSuiteFiles.push(`${mainPath}/tests/${filePath}.js`);
            }
        });

        return activeSuiteFiles;
    }

    _getSuitesStructure(suiteFileLines) {
        const suitesStructure = {};
        let lastDescribe;

        suiteFileLines.forEach((suiteFileLine) => {
            if (suiteFileLine.indexOf('describe(') > -1) {
                lastDescribe = commonUtils.getStringBetweenDoubleQuotes(suiteFileLine);
                suitesStructure[lastDescribe] = [];
            } else if (suiteFileLine.indexOf('it(') > -1) {
                suitesStructure[lastDescribe].push(commonUtils.getStringBetweenDoubleQuotes(suiteFileLine))
            }
        });

        return suitesStructure;
    }
};

export default new SuiteParser();