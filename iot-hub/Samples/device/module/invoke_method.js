'use strict';


var ModuleClient = require('azure-iot-device').ModuleClient;
var Mqtt = require('azure-iot-device-mqtt').Mqtt;

ModuleClient.fromEnvironment(Mqtt, (err, client) => {
    if (err) {
        console.error(err.toString());
        process.exit(-1);
    } else {
        client.invokeMethod('<targetDevice>', '<targetModule>', {
            methodName: '<methodName>',
            payload: '<payload>',
            responseTimeoutInSeconds: 60,
            connectTimeoutInSeconds: 30
        }, (err, resp) => {
            if (err) {
                console.error(err.toString());
                process.exit(-1);
            } else {
                console.log(JSON.stringify(resp, null, 2));
                process.exit(0);
            }
        });
    }
});