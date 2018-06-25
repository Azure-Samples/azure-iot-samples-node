// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

'use strict';

var Registry = require('azure-iothub').Registry;
//var JobClient = require('azure-iothub').JobClient;
//var uuid = require('uuid');
const chalk = require('chalk');

var connectionString = process.argv[2];
var fwVersion = '2.8.5';
var fwPackageURI = 'https://secureuri/package.bin';
var fwPackageCheckValue = '123456abcde';
var sampleConfigId = 'firmware285';

// Receive the IoT Hub connection string as a command line parameter
if (process.argv.length < 3) {
  console.error('Usage: node ServiceClient.js <<IoT Hub Connection String>>');
  process.exit(1);
}

var registry = Registry.fromConnectionString(connectionString);

// <configuration>
var firmwareConfig = {
  id: sampleConfigId,
  content: {
    deviceContent: {
      'properties.desired.firmware': {
        fwVersion: fwVersion,
        fwPackageURI: fwPackageURI,
        fwPackageCheckValue: fwPackageCheckValue
      }
    }
  },

  // Maximum of 5 metrics per configuration
  metrics: {
    queries: {
      current: 'SELECT deviceId FROM devices WHERE configurations.[[firmware285]].status=\'Applied\' AND properties.reported.firmware.fwUpdateStatus=\'current\'',
      applying: 'SELECT deviceId FROM devices WHERE configurations.[[firmware285]].status=\'Applied\' AND ( properties.reported.firmware.fwUpdateStatus=\'downloading\' OR properties.reported.firmware.fwUpdateStatus=\'verifying\' OR properties.reported.firmware.fwUpdateStatus=\'applying\')',
      rebooting: 'SELECT deviceId FROM devices WHERE configurations.[[firmware285]].status=\'Applied\' AND properties.reported.firmware.fwUpdateStatus=\'rebooting\'',
      error: 'SELECT deviceId FROM devices WHERE configurations.[[firmware285]].status=\'Applied\' AND properties.reported.firmware.fwUpdateStatus=\'error\'',
      rolledback: 'SELECT deviceId FROM devices WHERE configurations.[[firmware285]].status=\'Applied\' AND properties.reported.firmware.fwUpdateStatus=\'rolledback\''
    }
  },

  // Specify the devices the firmware update applies to
  targetCondition: 'tags.devicetype = \'chiller\'',
  priority: 20
};
// </configuration>

// <createConfiguration>
var createConfiguration = function(done) {
  console.log();
  console.log('Add new configuration with id ' + firmwareConfig.id + ' and priority ' + firmwareConfig.priority);

  registry.addConfiguration(firmwareConfig, function(err) {
    if (err) {
      console.log('Add configuration failed: ' + err);
      done();
    } else {
      console.log('Add configuration succeeded');
      done();
    }
  });
};
// </createConfiguration>

// <monitorConfiguration>
var monitorConfiguration = function(done) {
  console.log('Monitor metrics for configuration: ' + sampleConfigId);
  setInterval(function(){
    registry.getConfiguration(sampleConfigId, function(err, config) {
      if (err) {
        console.log('getConfiguration failed: ' + err);
      } else {
        console.log('System metrics:');
        console.log(JSON.stringify(config.systemMetrics.results, null, '  '));
        console.log('Custom metrics:');
        console.log(JSON.stringify(config.metrics.results, null, '  '));
      }
    });
  }, 20000);
  done();
};
// </monitorConfiguration>

createConfiguration(function() {
  monitorConfiguration(function() {
  });
});