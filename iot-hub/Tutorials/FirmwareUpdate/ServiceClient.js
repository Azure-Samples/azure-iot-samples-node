// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

'use strict';

var Registry = require('azure-iothub').Registry;
var Client = require('azure-iothub').Client;
var async = require('async');
const chalk = require('chalk');

// Receive the IoT Hub connection string as a command line parameter
if (process.argv.length < 3) {
  console.error('Usage: node ServiceClient.js <<IoT Hub Connection String>>');
  process.exit(1);
}

var connectionString = process.argv[2];
var registry = Registry.fromConnectionString(connectionString);
var client = Client.fromConnectionString(connectionString);
var deviceToUpdate = 'MyFirmwareUpdateDevice';

// <appflow>
// First, initiate the firmware update process on the device using a device method.
// Then, listen for status updates from the device.
async.waterfall([
  invokeFirmwareUpdate,
  displayFirmwareUpdateStatus 
],
function(err) {
  if (err) {
    console.error(err);
  } else {
    console.log('Firmware update complete');
  } 
});
// </appflow>

// <initiateupdate>
// Initiate the firmware update through a method
function invokeFirmwareUpdate(callback) {
  client.invokeDeviceMethod(deviceToUpdate, 
    {
      methodName: "firmwareUpdate",
      payload: {
        fwPackageUri: 'https://secureurl'
      },
      timeoutInSeconds: 30
    }, function (err, result) {
      console.log(chalk.green(JSON.stringify(result, null, 2)));
      callback(err);
    }
  );
}
// </initiateupdate>

// <reportstatus>
// Get the twin and output the firmwareUpdate status from reported properties
function displayFirmwareUpdateStatus(callback) {
  var timer = setInterval(() => {
    registry.getTwin(deviceToUpdate, function(err, twin){
      if (err) {
        clearInterval(timer);
        callback(err);
      } else {
        // Output the value of the device twin reported properties, which includes the firmwareUpdate details
        if (twin.properties.reported.firmwareUpdate) {
          console.log(JSON.stringify(twin.properties.reported.firmwareUpdate, null, 2));
          if (twin.properties.reported.firmwareUpdate.status == 'apply firmware image complete') {
            clearInterval(timer);
            callback(null);
          }
          if (twin.properties.reported.firmwareUpdate.status == 'apply image failed' ||
              twin.properties.reported.firmwareUpdate.status == 'download image failed') {
            clearInterval(timer);
            callback(twin.properties.reported.firmwareUpdate.status);
          }
        }
      }
    });
  }, 1000);
}
// </reportstatus>
