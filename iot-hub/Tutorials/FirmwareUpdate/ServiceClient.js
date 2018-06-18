// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

'use strict';

var Registry = require('azure-iothub').Registry;
var JobClient = require('azure-iothub').JobClient;
var uuid = require('uuid');
const chalk = require('chalk');

// Receive the IoT Hub connection string as a command line parameter
if (process.argv.length < 3) {
  console.error('Usage: node ServiceClient.js <<IoT Hub Connection String>>');
  process.exit(1);
}

var connectionString = process.argv[2];

var fwVersion = '2.8.5';
var fwPackageURI = 'https://secureuri/package.bin';
var fwPackageCheckValue = '123456abcde';
// <queryCondition>
// Use a device twin tag to select the devices to update
var queryCondition = "tags.devicetype = 'chiller'";
// </queryCondition>
var startTime = new Date();
var maxExecutionTimeInSeconds =  300;

var registry = Registry.fromConnectionString(connectionString);
var jobClient = JobClient.fromConnectionString(connectionString);

// <monitorJob>
// Monitor the device twin update job
function monitorJob (jobId, callback) {
  var jobMonitorInterval = setInterval(function() {
    jobClient.getJob(jobId, function(err, result) {
      if (err) {
        console.error(chalk.red('Job: Could not get status: ' + err.message));
      } else {
        console.log(chalk.green('Job: ' + jobId + ' - status: ' + result.status));
        if (result.status === 'completed' || result.status === 'failed' || result.status === 'cancelled') {
          clearInterval(jobMonitorInterval);
          callback(null, result);
        }
      }
    });
  }, 5000);
}
// </monitorJob>

// <firmwarePatch>
// Firmware update patch
//   fwVersion: desired firmware version 
//   fwPackageURI: download location of firmware package
//   fwPackageCheckValue: a checksum or other value to verify the integrity of the firmware package
var twinPatchFirmwareUpdate = {
  etag: '*', 
  properties: {
    desired: {
      patchId: "Firmware update",
      firmware: {
        fwVersion: fwVersion,
        fwPackageURI: fwPackageURI,
        fwPackageCheckValue: fwPackageCheckValue
      }
    }
  }
};
// </firmwarePatch>

// <scheduleJob>
var twinJobId = uuid.v4();

console.log(chalk.green('Job: Scheduling twin update job id: ' + twinJobId));
jobClient.scheduleTwinUpdate(twinJobId,
                            queryCondition,
                            twinPatchFirmwareUpdate,
                            startTime,
                            maxExecutionTimeInSeconds,
                            function(err) {
  if (err) {
    console.error(chalk.red('Job: Could not schedule twin update: ' + err.message));
  } else {
    monitorJob(twinJobId, function(err, result) {
      if (err) {
        console.error(chalk.red('Job: Could not monitor twin update: ' + err.message));
      } else {
        console.log(chalk.green('Job: submitted:'));
        console.log(chalk.green(JSON.stringify(result, null, 2)));
      }
    });
    queryFirmwareUpdateStatus( function (err){
      if (err) console.log(chalk.red('Query: ' + err.message));
    });
  }
});
// </scheduleJob>

// <queryTwins>
// Query the device twins and output the reported properties every 5 seconds
function queryFirmwareUpdateStatus(callback) {
  var timer = setInterval(() => {
    var query = registry.createQuery('SELECT * FROM devices WHERE ' + queryCondition, 100);
    var onResults = function(err, results) {
      if (err) {
        console.error(chalk.red('Query: Failed to fetch the results: ' + err.message));
      } else {
        // Do something with the results
        results.forEach(function(twin) {
          console.log('\nQuery: Reported properties for: ' + twin.deviceId);
          console.log(twin.properties.reported.firmware);
        });
        if (query.hasMoreResults) {
          query.nextAsTwin(onResults);
        }
      }
    };

    query.nextAsTwin(onResults);
  }, 5000);
}
// </queryTwins>