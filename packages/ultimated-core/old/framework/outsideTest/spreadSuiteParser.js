import fs from 'fs';

const SpreadSuiteParser = class {
    parseSuitesForDevices(androidDevicesIdList, iosDevicesIdList) {
        const devicesCount = this.getSpreadDevicesCount(androidDevicesIdList, iosDevicesIdList);
        const devicesList = this.getSpreadDevicesList(androidDevicesIdList, iosDevicesIdList);

        if (devicesCount === 0) {
            return;
        }

        const testsFileLines = this.getTestsFileContent();
        const commonContentLines = this.getCommonContentLines(testsFileLines);
        const suitesLines = this.getSuitesLines(testsFileLines);
        // const spreadSuitesLines = this.spreadSuitesLines(suitesLines, devicesCount);
        // const spreadSuitesLines = this.spreadSuitesLinesOneByOne(suitesLines, devicesCount);
        const spreadSuitesLines = this.spreadSuitesLinesOneLast(suitesLines, devicesCount);
        const queuedSuitesLines = this.parseQueuedSuitesLines(suitesLines, devicesCount);

        devicesList.map((deviceId, index) => {
            const preparedSpreadFileContent = this.prepareFileContent(commonContentLines, spreadSuitesLines[index]);

            fs.writeFileSync(`./.ultimated/tests/tests-${deviceId}.js`, preparedSpreadFileContent);
        });

        fs.writeFileSync(`./.ultimated/tests/tests-queued.js`, this.prepareFileContent([], queuedSuitesLines));
    }

    getTestsFileContent() {
        const data = fs.readFileSync('tests/tests.js', 'utf8');
        return data.split('\n');
    }

    getCommonContentLines(linesArray) {
        let configs = [];

        linesArray.forEach((line) => {
            if (!line.includes('/suites/')) {
                configs.push(line);
            }
        });

        return configs;
    }

    getSuitesLines(linesArray) {
        let suites = [];

        linesArray.forEach((line) => {
            if (line.includes('/suites/')) {
                suites.push(line);
            }
        });

        return suites;
    }

    spreadSuitesLines(suitesLines, devicesCount) {
        const suitesLinesCount = suitesLines.length;
        const chunkCount = Math.ceil(suitesLinesCount / devicesCount);

        const doChunk = (list, size) => list.reduce((r, v) =>
            (!r.length || r[r.length - 1].length === size ?
                r.push([v]) : r[r.length - 1].push(v)) && r
            , []);

        return doChunk(suitesLines, chunkCount);
    }

    spreadSuitesLinesOneByOne(suitesLines, devicesCount) {
        if (devicesCount) {
            const spreadSuites = [];

            for (let i = 0; i < devicesCount; i++) {
                spreadSuites[i] = [];
            }

            let deviceIndex = 0;
            suitesLines.forEach((line) => {
                spreadSuites[deviceIndex].push(line);

                deviceIndex++;
                if (deviceIndex > devicesCount - 1) {
                    deviceIndex = 0;
                }
            });

            return spreadSuites;
        } else {
            return '';
        }
    }

    spreadSuitesLinesOneLast(suitesLines, devicesCount) {
        if (devicesCount) {
            const lastLineSuites = [];

            for (let i = 0; i < devicesCount; i++) {
                lastLineSuites[i] = [ suitesLines[suitesLines.length - 1 - i] ];
            }

            return lastLineSuites;
        } else {
            return '';
        }
    }

    parseQueuedSuitesLines(suitesLines, devicesCount) {
        if (devicesCount) {
            const length = suitesLines.length;

            for (let i = 0; i < devicesCount; i++) {
                const deleteIndex = length - 1 - i;
                suitesLines.splice(deleteIndex);
            }

            return suitesLines;
        } else {
            return '';
        }
    }

    getSpreadDevicesCount(androidDevicesIdList, iosDevicesIdList) {
        return androidDevicesIdList.length + iosDevicesIdList.length;
    }

    getSpreadDevicesList(androidDevicesIdList, iosDevicesIdList) {
        const devicesList = androidDevicesIdList.concat(iosDevicesIdList);

        return devicesList.map(x => [Math.random(), x]).sort(([a], [b]) => a - b).map(([_, x]) => x);
    }

    prepareFileContent(commonContentLines, uniqueSuiteLines) {
        let string = '';

        commonContentLines.map((line) => {
            if (string !== '') {
                string = `${string}\n${line}`;
            } else {
                string = line;
            }
        });

        uniqueSuiteLines.map((line) => {
            if (string !== '') {
                string = `${string}\n${line}`;
            } else {
                string = line;
            }
        });

        return string;
    }
};

export default new SpreadSuiteParser();