const UltimatedDetector = class {
    executeUltimatedCode (func) {
        if (process.env.ULTIMATED) {
            //console.log('#debug ultimated detected, executing function');
            func();
        } else {
            //console.log('#debug cancelling ultimated function');
        }
    }
};

export default new UltimatedDetector();