import fs from 'fs';
import CommonUtils from './../commonUtils';
import shelljs from 'shelljs';

const ReportCreator = class {
    constructor() {
        this.absolutePath = shelljs.exec('pwd', {silent: true}).stdout.trim();
        this.deviceId = null;
        this.visualId = null;
    }

    createReport({ items, map, oryginalMap = {}, beginDateTime, finalReport = false }) {
        this.beginDateTime = beginDateTime;
        if (finalReport) {
            console.log(`######### #debug items`, items);
            console.log(`######### #debug map`, map);
            console.log(`######### #debug oryginalMap`, oryginalMap);
        }

        const absolutePath = shelljs.exec('pwd', {silent: true}).stdout.trim();
        const fileBegin = this.getReportUpperPart();

        const fileFinish = `
                    </div>
                </body>
            </html>
        `;

        let lastDescribe = '';
        let fileContent = '';
        const summaryData = {
            pass: 0,
            fail: 0,
            pending: 0,
            skipped: 0
        };
        const finalMap = finalReport ? oryginalMap : map;
        items.forEach((testData) => {
            this.deviceId = testData.deviceId;
            this.visualId = testData.visualId;


            const visualTestId = finalMap[testData.parent.title][testData.title];
            const mapIndex = Object.keys(finalMap).indexOf(testData.parent.title);
            const executionTime = !!mapIndex || mapIndex === 0 ? finalMap[Object.keys(finalMap)[mapIndex]].executionTime : null;
            const executionTimeLabel = executionTime ? `(${executionTime} minutes)` : '';

            if (testData.parent.title !== lastDescribe && lastDescribe === '') {
                fileContent = `${fileContent}
                <div class="text">
                    <div class="text__header">
                        [device: ${testData.deviceId.substring(0, 14)}] ${testData.parent.title} ${executionTimeLabel} 
                    </div>
                `;
            } else if (testData.parent.title !== lastDescribe && lastDescribe !== '') {
                fileContent = `${fileContent}
                </div><div class="text">
                    <div class="text__header">
                        [device: ${testData.deviceId.substring(0, 14)}] ${testData.parent.title} ${executionTimeLabel}
                    </div>
                `;
            }
            lastDescribe = testData.parent.title;

            if (testData.state === 'failed') {
                // if (typeof testData.finalError !== 'string' && Ultimated.VAULT.PROJECT_CONFIG.ultimatedConfig.reportDebug) {
                //     console.log('######### #debug ERROR NOT STRING', testData.finalError);
                // }
                const screenshotName = encodeURIComponent(`${testData.moduleName}-FAILED-${testData.title}`).replace("'", '%27');
                const imgPath = `${testData.visualId}/${testData.deviceId}/${screenshotName}.png`;
                let visualTestContent = '';

                if (testData.finalError
                    && typeof testData.finalError === 'string'
                    && testData.finalError.indexOf('Visual test') > -1
                    && testData.finalError.indexOf('ended with error') > -1) {
                    testData.visualTestId = testData.finalError.split('Visual test "')[1].split('" ended with error:')[0];
                    const referenceScreenshotPath = `${testData.visualId}/${testData.deviceId}/${testData.visualTestId}/`;

                    let oryginalReferenceContent = '';
                    const referencePath = `${absolutePath}/screenshot-reference/${testData.moduleName}/${testData.visualTestId}${testData.prefixPathPart}`;
                    const targetPath = `${referencePath}/${testData.visualId}.png`;
                    const copyCommand = `cp ${absolutePath}/reports/${beginDateTime}/${testData.visualId}/${testData.deviceId}/${testData.visualTestId}/currentImage.png ${targetPath}`;
                    const otherDevicesScreenshotContent = this.getScreenshotContentForOtherDevices(referencePath, testData);

                    if (fs.existsSync(`${absolutePath}/reports/${beginDateTime}/${testData.visualId}/${testData.deviceId}/${testData.visualTestId}/oryginalImage.png`)) {
                        oryginalReferenceContent = `
                            <div class="visual-test-item">
                                <a href="${referenceScreenshotPath}oryginalImage.png" target="_blank"><img src="${referenceScreenshotPath}oryginalImage.png" style="height: 200px; width: auto; padding: 20px 20px 0 0"/></a>
                                <br/>oryginal
                            </div>
                        `
                    }

                    visualTestContent = `
                        <div class="visual-test-container">
                            ${oryginalReferenceContent}
                            <div class="visual-test-item">
                                <a href="${referenceScreenshotPath}referenceImage.png" target="_blank"><img src="${referenceScreenshotPath}referenceImage.png" style="height: 200px; width: auto; padding: 20px 20px 0 0"/></a>
                                <br/>reference
                            </div>
                            
                            <div class="visual-test-item">
                                <a href="${referenceScreenshotPath}currentImage.png" target="_blank"><img src="${referenceScreenshotPath}currentImage.png" style="height: 200px; width: auto; padding: 20px 20px 0 0"/></a>
                                <br/><div onClick="copyToClipboard('${copyCommand}')">current</div>
                            </div>
                            ${otherDevicesScreenshotContent}
                        </div>
                    `;
                }

                let videoFullScreenLink = '';
                if (fs.existsSync(`${absolutePath}/reports/${beginDateTime}/${testData.visualId}/${testData.deviceId}/${visualTestId}.mp4`)) {
                    videoFullScreenLink = `
                            <a href="${testData.visualId}/${testData.deviceId}/${visualTestId}.mp4" target="_blank" class="link">
                                <div class="it__error-video-link">see movie</div>
                            </a>
                    `;
                }

                let failScreenshotContent = '';
                if (testData.failScreenshot) {
                    failScreenshotContent = `
                        <div class="it__error-image-container">
                            ${videoFullScreenLink}
                            <a href="${imgPath}" target="_blank"><img src="${imgPath}" class="it__error-image"/></a>
                        </div>
                    `;
                }

                // let videoContent = '';
                // if (fs.existsSync(`${absolutePath}/reports/${beginDateTime}/${testData.visualId}/${visualTestId}.mp4`)) {
                //     console.log('######### #debug video file exists!');
                //     failScreenshotContent = `
                //             <div class="it__error-image-container">
                //                 <video height="auto" width="80px" id="vid${visualTestId}" class="video-error" controls>
                //                     <source src="${testData.visualId}/${visualTestId}.mp4" type="video/mp4">
                //                     Your browser does not support HTML5 video.
                //                 </video>
                //             </div>
                //         `
                // } else {
                //     console.log('######### #debug no video!');
                // }

                if (finalReport) {
                    console.log('#debug error', testData.finalError);
                    console.log(`#debug error ES6 1 ${testData.finalError}`);
                    console.log('#debug error ES6 2' + testData.finalError);
                    console.log(`#debug error ES6 3 ${String(testData.finalError)}`);


                    console.log(`wtf
                    <div class="it">
                        <div class="it__status it__status--fail" onClick="showError(this)">Failed</div>
                        <div class="it__body" onClick="showError(this)">${testData.title} (${Math.round(testData.duration/1000)}s)</div>
                        <div class="it__error js--hide">
                            ${failScreenshotContent}
                            <div class="it__error-body">${JSON.stringify(testData.finalError)}${visualTestContent}</div>
                        </div>
                    </div>
                `);
                }


                fileContent = `${fileContent}
                    <div class="it">
                        <div class="it__status it__status--fail" onClick="showError(this)">Failed</div>
                        <div class="it__body" onClick="showError(this)">${testData.title} (${Math.round(testData.duration/1000)}s)</div>
                        <div class="it__error js--hide">
                            ${failScreenshotContent}
                            <div class="it__error-body">${testData.finalError}${visualTestContent}</div>
                        </div>
                    </div>
                `;
                summaryData.fail++;
            } else if (testData.state === 'passed') {
                fileContent = `${fileContent}
                    ${this.getPassedSuiteContent(testData)}
                `;
                summaryData.pass++;
            } else if (testData.state === 'pending') {
                fileContent = `${fileContent}
                    <div class="it">
                        <div class="it__status it__status--pending">Pending</div>
                        <div class="it__body it__body--pending">${testData.title}</div>
                    </div>
                `;
                summaryData.pending++;
            } else if (testData.state === 'skipped') {
                fileContent = `${fileContent}
                    <div class="it">
                        <div class="it__status it__status--skipped">Skipped</div>
                        <div class="it__body it__body--pending">${testData.title}</div>
                    </div>
                `;
                summaryData.skipped++;
            }
        });

        let summary = `
            <div class="summary">
                <div class="summary__title">SUMMARY</div>
                <div class="it__status it__status--pass">${summaryData.pass}</div>
                <div class="it__status it__status--fail">${summaryData.fail}</div>
                <div class="it__status it__status--pending">${summaryData.pending}</div>
                <div class="it__status it__status--skipped">${summaryData.skipped}</div>
            </div>
        `;

        if (finalReport) {
            // console.log(`######### #debug fileBegin`, fileBegin);
            // console.log(`######### #debug summary`, summary);
            // console.log(`######### #debug fileContent`, fileContent);
            // console.log(`######### #debug fileFinish`, fileFinish);
            // console.log(`######### #debug finalFileContent`, finalFileContent);
        }


        const finalFileContent = `${fileBegin}${summary}${fileContent}${fileFinish}`;
        shelljs.exec(`mkdir ${this.absolutePath}/reports/${beginDateTime}/combinedReportData`, { silent: true });
        const finalPath = finalReport ? `./reports/${beginDateTime}/combinedReport.html` : `./reports/${beginDateTime}/${this.deviceId}_new.html`;
        fs.writeFile(finalPath, finalFileContent, function(err) {
            if(err) {
                return console.log(err);
            }
        });

        // if (finalReport && Ultimated.VAULT.PROJECT_CONFIG.ultimatedConfig.reportDebug) {
        //     TODO show test.js optimal code
        //     this.generateOptimizedTestsJsFile(items, finalMap);
        // }

        return summaryData;
    }

    generateOptimizedTestsJsFile(items, finalMap) {
        console.log('Ultimated --reportDebug flag active. Generating optimized tests.js file...');
        const suites = items.map((testData) => {
            const mapIndex = Object.keys(finalMap).indexOf(testData.parent.title);
            const exactExecutionTime = !!mapIndex || mapIndex === 0 ? finalMap[Object.keys(finalMap)[mapIndex]].exactExecutionTime : null;

            return { duration: exactExecutionTime, moduleName: testData.moduleName, modulePath: testData.modulePath };
        });

        const sortedSuitesMap = suites.sort((a, b) => (a.duration > b.duration) ? 1 : -1);
        const sortedSuites = {};

        sortedSuitesMap.forEach((suiteItem) => {
            if (suiteItem.moduleName) {
                sortedSuites[suiteItem.moduleName] = {
                    duration: suiteItem.duration,
                    modulePath: `.${suiteItem.modulePath.split('.ultimated/tests')[1].split('.js')[0]}`
                };
            }
        });

        console.log('Success! Optimized tests.js generated:');
        console.log('');

        for (let sortedSuitesItemIndex in sortedSuites) {
            const sortedSuitesItem = sortedSuites[sortedSuitesItemIndex];
            console.log(`import '${sortedSuitesItem.modulePath}'; //${sortedSuitesItem.duration}`);
        }
    }

    getPassedSuiteContent(testData) {
        if (testData.visualTestId) {
            const referencePath = `${this.absolutePath}/screenshot-reference/${testData.moduleName}/${testData.visualTestId}${testData.prefixPathPart}`;
            const referencePathFile = `${referencePath}/${testData.visualId}.png`;

            const newAbsolutePath = `${this.absolutePath}/reports/${this.beginDateTime}/${testData.visualId}/${testData.deviceId}`;
            const referenceScreenshotNewRelativeDir = `${testData.visualTestId}`;
            const referenceScreenshotNewRelativeFile = `${referenceScreenshotNewRelativeDir}/referenceImage.png`;
            const currentScreenshotNewRelativeFile = `${referenceScreenshotNewRelativeDir}/currentImage.png`;

            const otherDevicesContent = this.getScreenshotContentForOtherDevices(referencePath, testData);

            if (!fs.existsSync(`${newAbsolutePath}/${referenceScreenshotNewRelativeFile}`) && fs.existsSync(referencePathFile)) {
                shelljs.exec(`mkdir ${newAbsolutePath}/${referenceScreenshotNewRelativeDir}`, { silent: true });
                shelljs.exec(`cp ${referencePathFile} ${newAbsolutePath}/${referenceScreenshotNewRelativeFile}`, { silent: true });
            }
            return `
                <div class="it">
                    <div class="it__status it__status--pass" onClick="showError(this)">Passed</div>
                    <div class="it__body" onClick="showError(this)">${testData.title} (${Math.round(testData.duration/1000)}s)</div>
                    <div class="it__error js--hide">
                        <div class="it__error-body">
                            <div class="visual-test-container">
                                <div class="visual-test-item">
                                    <a href="${testData.visualId}/${testData.deviceId}/${currentScreenshotNewRelativeFile}" target="_blank"><img src="${testData.visualId}/${testData.deviceId}/${currentScreenshotNewRelativeFile}" style="height: 200px; width: auto; padding: 20px 20px 0 0"/></a>
                                    <br/>current
                                </div>
                                <div class="visual-test-item">
                                    <a href="${testData.visualId}/${testData.deviceId}/${referenceScreenshotNewRelativeFile}" target="_blank"><img src="${testData.visualId}/${testData.deviceId}/${referenceScreenshotNewRelativeFile}" style="height: 200px; width: auto; padding: 20px 20px 0 0"/></a>
                                    <br/>reference
                                </div>
                                ${otherDevicesContent}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        } else {
            return `
                <div class="it">
                    <div class="it__status it__status--pass">Passed</div>
                    <div class="it__body">${testData.title} (${Math.round(testData.duration/1000)}s)</div>
                </div>
            `;
        }
    }

    getScreenshotContentForOtherDevices(referencePath, testData) {
        const allScreenshots = CommonUtils.getAllFilesFromDirectory(referencePath);
        let screenshotReportContent = '';

        allScreenshots.forEach((screenshotFileObject) => {
            const label = screenshotFileObject.fileName.replace(/.png/g, '');

            if (!screenshotFileObject.fileName.includes(testData.deviceId)) {
                let newPath = `${testData.visualId}/${testData.deviceId}/${testData.visualTestId}/${screenshotFileObject.fileName}`;
                shelljs.exec(`cp ${referencePath}/${screenshotFileObject.fileName} ${this.absolutePath}/reports/${this.beginDateTime}/${newPath}`, { silent: true });

                screenshotReportContent = `${screenshotReportContent}
                    <div class="visual-test-item">
                        <a href="${newPath}" target="_blank"><img src="${newPath}" style="height: 200px; width: auto; padding: 20px 20px 0 0"/></a>
                        <br/><div>${label}</div>
                    </div>
                `;
            }
        });

        return screenshotReportContent;
    }

    getReportUpperPart() {
        return `
            <html>
                <head>
                    <title>Test Report</title>
                    <link href="https://fonts.googleapis.com/css?family=Aldrich:400,700,300,100,400italic,700italic" rel="stylesheet" type="text/css">
                    <link href="https://fonts.googleapis.com/css?family=Coda:regular,extra-bold" rel="stylesheet" type="text/css">
                    <link href="https://fonts.googleapis.com/css?family=Open%20Sans:regular,extra-bold" rel="stylesheet" type="text/css">
                    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.6.2/css/font-awesome.min.css">
                    <style type="text/css">
                        body {
                            font-family: Arial;
                            font-size: 14px;
                        }
                        
                        @font-face {
                            font-family: "Greek";
                            src: local('Greek'), local('Greek'),
                            url(greek.ttf);
                            font-weight: normal;
                            font-style: normal;
                        }
            
                        body {
                            margin: 0;
                            padding: 0;
                            font-family: "Coda";
                            font-weight: normal;
                            color: #404040;
                        }
            
                        
                        .header-wrapper {
                            height: 80px;
                            background-color: #262626;
                            color: #FFF;
                            position: fixed;
                            left: 0;
                            right: 0;
                            z-index: 1;
                        }
            
                        .header-body {
                            display: flex;
                            justify-content: center;
                            flex-direction: column;
                            height: inherit;
                            padding-left: 30px;
                        }
            
                        .header__u {
                            font-family: "Coda";
                            display: inline-block;
                            font-size: 36px;
                        }
            
                        .header__small {
                            padding-left: 5px;
                            display: inline-block;
                            font-family: "Coda";
                            letter-spacing: 5px;
                        }
            
                        .header__small--right {
                            float: right;
                            transform: translateY(50%);
                            padding-right: 30px;
                        }
                        
                        .page-content {
                            top: 80px;
                            display: inline;
                            position: absolute;
                            left: 0;
                            right: 0;
                            padding: 15px;
                        }
            
                       .summary {
                            float: right;
                            margin-right: 9%;
                        }
            
                        .summary__title {
                            text-align: left;
                        }
                        
                        .link, .link:hover, .link:hover, .link:visited{
                            border:none;
                            outline:none;
                            text-decoration:none;
                            color:inherit;
                            -webkit-user-select: none;
                            -moz-user-select: none;
                            -ms-user-select: none;
                            user-select: none;
                        }
            
                        .link:link {
                            text-decoration: none;
                            color: inherit;
                        }
            
                        .link:visited {
                            text-decoration: none;
                            color: inherit;
                        }
            
                        .link:hover {
                            text-decoration: none;
                            color: inherit;
                        }
            
                        .link:active {
                            text-decoration: none;
                            color: inherit;
                        }
                        
                        .text {
                            padding: 30px 10%;
                            background-color: #fff;
                        }
            
                        .text__header {
                            font-size: 26px;
                        }
            
                        .text__description {
                            font-family: "Verdana";
                            font-size: 16px;
                            padding: 40px 0;
                            /*max-width: 900px;*/
                        }
            
                        .text__box {
                            background-color: #f6f8fa;
                            padding: 20px;
                            margin-bottom: 20px;
                            word-break: break-all;
                        }
            
                        .describe {
                            padding-top: 15px;
                        }
                        
                        .it {
                            padding-bottom: 5px;
                            padding-top: 5px;
                            border-bottom: 1px solid #eaecef;
                            font-family: "Verdana";
                            font-size: 16px;
                        }
                        
                        .it__body {
                            display: inline-block;
                            padding: 3px;
                        }
                        
                        .it__body--pending {
                            color: silver;
                        }
                        
                        .it__status {
                            display: inline-block;
                            width: 70px;
                            text-align: center;
                            margin-right: 15px;
                            border-radius: 5px;
                            color: white;
                            padding: 3px;
                        }
                        
                        .it__status--pass {
                            background-color: green;
                        }
                        
                        .it__status--fail {
                            background-color: red;
                        }
                        
                        .it__status--pending {
                            background-color: #378FE1;
                        }
                        
                        .it__status--skipped {
                            background-color: silver;
                        }
            
                        .it__error {
                            display: flex;
                            margin-top: 10px;
                            padding: 3px;
                        }
                        
                        .it__error-body {
                            color: brown;
                            width: 100%;
                            margin-left: 25px;
                        }
            
                        .it__error-image-container {
                            width: 80px;
                        }
                        
                        .it__error-video-link {
                            font-size: 10px;
                            margin-bottom: 15px;
                            background-color: #3366cc;
                            color: white;
                            text-align: center;
                            border-radius: 5px;
                            padding: 3px;
                        }
            
                        .it__error-image {
                            width: 100%;
                            height: auto;
                            text-align: right;
                        }
                         
                        .js--hide {
                            display: none;
                        }
                        

                        .visual-test-container {
                            display: block;
                            position: relative;
                            color: black;
                            margin-top: 15px;
                        }
                        
                        .visual-test-item {
                            display: inline-block;   
                        }
                    </style>
                    <script>
                        function showError(target) {
                             target.parentNode.querySelector('.it__error').classList.toggle('js--hide')
                        }
                        
                        function copyToClipboard(text) {
                            var copyInput = document.createElement('input');
                            copyInput.style.position = "absolute";
                            copyInput.style.opacity = 0;
                    
                            document.body.appendChild(copyInput);
                            copyInput.value = text;
                            copyInput.select();
                    
                            try {
                                document.execCommand('copy');
                                
                                console.log('Screenshot replace command copied :)');
                            } catch (err) {
                                console.log('Oops, unable to copy command');
                            }
                            document.body.removeChild(copyInput);
                        }
                    </script>  
                </head>
                
                <body>
                    
                    <div class="header-wrapper">
                        <div class="header-body">
                            <div>
                                <a href="http://ultimatedtesting.com/" class="header__u link">U</a><a href="http://ultimatedtesting.com/" class="header__small link">LTIMATED</a>
                            </div>
                        </div>
                    </div>
                    
                    <div class="page-content">
            `;
    }
};

export default new ReportCreator();