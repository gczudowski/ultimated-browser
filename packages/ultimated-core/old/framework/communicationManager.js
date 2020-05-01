import request from 'request';
import queryString from 'query-string';
import SuiteParser from './suiteParser';
import UltimatedDetector from './ultimatedDetector';

const SlaveCommunicationManager = class {
    updateTestStatus(deviceId, message) {
        UltimatedDetector.executeUltimatedCode(() => {
            console.log('Framework: updateTestStatus - finished', deviceId);

            const query = queryString.stringify({
                deviceId: deviceId,
                message: 'finished'
            });

            request.get(`http://localhost:9000/testStatusUpdate?${query}`, {async:true});
        });
    }

    updateTestSuitesList() {
        UltimatedDetector.executeUltimatedCode(() => {
            const activeSuitesStructure = SuiteParser.getActiveSuitesStructure();
            const query = queryString.stringify(activeSuitesStructure);

            request.get(`http://localhost:9000/testsSuitesListUpdate?${query}`, {async:true});
        });
    }

    updateItStatus(updateObject) {
        UltimatedDetector.executeUltimatedCode(() => {
            const query = queryString.stringify(updateObject);

            request.get(`http://localhost:9000/testSuiteItStatusUpdate?${query}`, {async:true});
        });
    }
};

export default new SlaveCommunicationManager();