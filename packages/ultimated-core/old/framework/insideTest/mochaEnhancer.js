const MochaEnhancer = class {
    init() {
        this.enhanceMocha();
    }

    enhanceMocha() {
        global.oryginalIt = global.it;
        global.newIt = null;
        global.it = null;
        global.oryginalXIt = global.xit;
        global.oryginalDescribe = global.describe;
        global.describe = null;

        global.it = (description, func, params) => {
            const require = [];
            const exclude = [];
            const tryCatchFunc = () => {
                return new Promise((resolve, reject) => {
                    func()
                        .then(() => {
                            resolve();
                        })
                        .catch((err) => {
                            if (!global.finalError && err) {
                                global.finalError = err;
                            }

                            reject(err);
                        });
                });
            };

            if (!params || (params && !params.overwritten)) {
                if (this.isItParamsMet(params)) {
                    this.executeBeforeSuite(params);
                    this.addReportRecord(description);

                    return global.oryginalIt(description, tryCatchFunc, { overwritten: true });
                } else {
                    const finalDescription = `[PARAMS NOT MET] ${description}`;

                    return global.xit(finalDescription, func);
                }
            }
        };

        global.xit = (description, func) => {
            const finalDescription = `[SKIPPED] ${description}`;

            this.addReportRecord(finalDescription);

            global.newIt = global.it;
            global.it = null;
            global.it = global.oryginalIt;

            global.oryginalXIt(finalDescription, func);

            global.it = null;
            global.it = global.newIt;
        };

        global.describe = (title, func, filename) => {
            let isParamsMet = false;
            global.tempIt = global.it;
            global.it = null;
            global.it = (desc, func, params) => {
                if (this.isItParamsMet(params)) {
                    isParamsMet = true;
                }
            };

            func({ itsOnly: true });

            global.it = null;
            global.it = global.tempIt;

            const finalTitle = isParamsMet ? title : `[PARAMS NOT MET] ${title}`;

            // const finalTitle = title;

            global.lastDescribeTitle = finalTitle;
            global.oryginalDescribe(finalTitle, func);
        }
    }

    addReportRecord(description) {
        const state = description.includes('[PARAMS NOT MET]') || description.includes('[SKIPPED]') ? 'skipped' : 'pending';

        const index = SuiteManager.reportData.items.push({
            parent: {
                title: global.lastDescribeTitle
            },
            title: description,
            state,
            deviceId: SuiteManager.deviceId
        });
        if (!SuiteManager.reportData.map[global.lastDescribeTitle]) {
            SuiteManager.reportData.map[global.lastDescribeTitle] = {};
        }
        SuiteManager.reportData.map[global.lastDescribeTitle][description] = index - 1;
    }

    isItParamsMet(params) {
        const parsedParams = this.parseItParams(params);

        return this.isRequireParamsMet(parsedParams) && this.isExcludeParamsMet(parsedParams) && this.isLevelParamsMet(parsedParams);
    }

    isRequireParamsMet(parsedParams) {
        const requireParamsStatus = {};
        let isRequireParamsMet = true;

        Object.keys(parsedParams.require).forEach((paramKey) => {
            requireParamsStatus[paramKey] = false;

            parsedParams.require[paramKey].forEach((paramSingleValue) => {
                if (Framework.PARAMS[paramKey] === paramSingleValue) {
                    requireParamsStatus[paramKey] = true;
                }
            });
        });

        Object.keys(requireParamsStatus).forEach((paramKey) => {
            if (requireParamsStatus[paramKey] === false) {
                isRequireParamsMet = false;
            }
        });

        return isRequireParamsMet;
    }

    isExcludeParamsMet(parsedParams) {
        const excludeParamsStatus = {};
        let isExcludeParamsMet = true;

        Object.keys(parsedParams.exclude).forEach((paramKey) => {
            excludeParamsStatus[paramKey] = true;

            parsedParams.exclude[paramKey].forEach((paramSingleValue) => {
                if (Framework.PARAMS[paramKey] === paramSingleValue) {
                    excludeParamsStatus[paramKey] = false;
                }
            });
        });

        Object.keys(excludeParamsStatus).forEach((paramKey) => {
            if (excludeParamsStatus[paramKey] === false) {
                isExcludeParamsMet = false;
            }
        });

        return isExcludeParamsMet;
    }

    isLevelParamsMet(parsedParams) {
        let isLevelParamsMet = false;

        const maxTestLevel = Ultimated.VAULT.PARAMS['testLevel'] || Framework.TEST_LEVELS.FULL;
        const itTestLevel = parsedParams.testLevel || Framework.TEST_LEVELS.FULL;


        if (itTestLevel <= maxTestLevel) {
            isLevelParamsMet = true;
        }

        return isLevelParamsMet;
    }

    parseItParams(params) {
        const parsedParams = {
            require: {},
            exclude: {}
        };

        if (params && params.require && params.require instanceof Object && params.require.constructor === Object) {
            Object.keys(params.require).forEach((key) => {
                const value = params.require[key];
                if (typeof value === 'string') {
                    parsedParams.require[key] = [value];
                } else {
                    parsedParams.require[key] = value;
                }
            });
        }

        if (params && params.exclude && params.exclude instanceof Object && params.exclude.constructor === Object) {
            Object.keys(params.exclude).forEach((key) => {
                const value = params.exclude[key];
                if (typeof value === 'string') {
                    parsedParams.exclude[key] = [value];
                } else {
                    parsedParams.exclude[key] = value;
                }
            });
        }

        if (params && params.testLevel) {
            if (typeof params.testLevel === 'number' && parseInt(params.testLevel) === params.testLevel) {
                parsedParams.testLevel = params.testLevel;
            }
        }

        return parsedParams;
    }

    executeBeforeSuite(params) {
        if (params && params.executeBefore && Array.isArray(params.executeBefore)) {
            params.executeBefore.forEach((func) => {
                func()
            })
        } else if (params && params.executeBefore && !Array.isArray(params.executeBefore) && typeof(params.executeBefore) === 'function') {
            params.executeBefore();
        }
    }
};

export default new MochaEnhancer();