// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

'use strict';

var Client = require('azure-iot-device').Client;
var Protocol = require('azure-iot-device-mqtt').Mqtt;
var async = require('async');
const chalk = require('chalk');

// Receive the IoT Hub device connection string as a command line parameter
if(process.argv.length < 3) {
  console.error('Usage: node SimulatedDevice.js <<IoT Hub Device Connection String>>');
  process.exit(1);
}

var connectionString = process.argv[2];
var client = Client.fromConnectionString(connectionString, Protocol);
var desiredFirmwareProperties = null;
var fwUpdateInProgress = false;
var deviceTwin = null;

// <reportedProperties>
// Firmware update patch
//  currentFwVersion: The firmware version currently running on the device.
//  pendingFwVersion: The next version to update to, should match what's
//                    specified in the desired properties. Blank if there
//                    is no pending update (fwUpdateStatus is 'current').
//  fwUpdateStatus:   Defines the progress of the update so that it can be
//                    categorized from a summary view. One of:
//     - current:     There is no pending firmware update. currentFwVersion should
//                    match fwVersion from desired properties.
//     - downloading: Firmware update image is downloading.
//     - verifying:   Verifying image file checksum and any other validations.
//     - applying:    Update to the new image file is in progress.
//     - rebooting:   Device is rebooting as part of update process.
//     - error:       An error occurred during the update process. Additional details
//                    should be specified in fwUpdateSubstatus.
//     - rolledback:  Update rolled back to the previous version due to an error.
//  fwUpdateSubstatus: Any additional detail for the fwUpdateStatus . May include
//                     reasons for error or rollback states, or download %.
//
// var twinPatchFirmwareUpdate = {
//   firmware: {
//     currentFwVersion: '1.0.0',
//     pendingFwVersion: '',
//     fwUpdateStatus: 'current',
//     fwUpdateSubstatus: '',
//     lastFwUpdateStartTime: '',
//     lastFwUpdateEndTime: ''
//   }
// };
// </reportedProperties>

// Send firmware update status to the hub
function initializeStatus(callback) {
  var patch = {
    firmware: {
      currentFwVersion: '1.0.0',
      pendingFwVersion: '',
      fwUpdateStatus: 'current',
      fwUpdateSubstatus: '',
      lastFwUpdateStartTime: '',
      lastFwUpdateEndTime: ''
    }
  };
  deviceTwin.properties.reported.update(patch, function(err) {
    callback(err);
  });
}

// <sendStatusUpdate>
// Send firmware update status to the hub
function sendStatusUpdate(status, substatus, callback) {
  var patch = {
    firmware: {
      fwUpdateStatus: status,
      fwUpdateSubstatus: substatus
    }
  };
  deviceTwin.properties.reported.update(patch, function(err) {
    callback(err);
  });
}
// </sendStatusUpdate>

// <sendUpdateStarting>
// Send firmware update starting to the hub
function sendStartingUpdate(pending, callback) {
  var patch = {
    firmware: {
      pendingFwVersion: pending,
      fwUpdateStatus: 'current',
      fwUpdateSubstatus: '',
      lastFwUpdateStartTime: new Date().toISOString()
    }
  };
  deviceTwin.properties.reported.update(patch, function(err) {
    callback(err);
  });
}
// </sendUpdateStarting>

// <sendUpdateFinished>
// Send firmware update finished to the hub
function sendFinishedUpdate(version, callback) {
  var patch = {
    firmware: {
      currentFwVersion: version,
      pendingFwVersion: '',
      fwUpdateStatus: 'current',
      fwUpdateSubstatus: '',
      lastFwUpdateEndTime: new Date().toISOString()
    }
  };
  deviceTwin.properties.reported.update(patch, function(err) {
    callback(err);
  });
}
// </sendUpdateFinished>

client.open(function(err) {
  if (!err) {
    // Get the device twin
    client.getTwin(function(err, twin) {
      if (err) {
        console.error(chalk.red('Could not get device twin'));
      } else {
        console.log(chalk.green('Got device twin'));
        deviceTwin = twin;
        initializeStatus(function (err) {
          if (err) {
            console.error(chalk.red('Error initializing twin: ' + err.message));
          }
          return;
        });
        

        // <initiateUpdate>
        // Handle firmware desired property updates - this triggers the firmware update flow
        twin.on('properties.desired.firmware', function(fwUpdateDesiredProperties) {
          console.log(chalk.green('\nCurrent firmware version: ' + twin.properties.reported.firmware.currentFwVersion));
          console.log(chalk.green('Starting firmware update flow using this data:'));
          console.log(JSON.stringify(fwUpdateDesiredProperties, null, 2));
          desiredFirmwareProperties = twin.properties.desired.firmware;

          if (fwUpdateDesiredProperties.fwVersion == twin.properties.reported.firmware.currentFwVersion) {
            sendStatusUpdate('current', 'Firmware already up to date', function (err) {
              if (err) {
                console.error(chalk.red('Error occured sending status update : ' + err.message));
              }
              return;
            });
          }
          if (fwUpdateInProgress) {
            sendStatusUpdate('current', 'Firmware update already running', function (err) {
              if (err) {
                console.error(chalk.red('Error occured sending status update : ' + err.message));
              }
              return;
            });
          }
          if (!fwUpdateDesiredProperties.fwPackageURI.startsWith('https')) {
            sendStatusUpdate('error', 'Insecure package URI', function (err) {
              if (err) {
                console.error(chalk.red('Error occured sending status update : ' + err.message));
              }
              return;
            });
          }

          fwUpdateInProgress = true;

          sendStartingUpdate(fwUpdateDesiredProperties.fwVersion, function (err) {
            if (err) {
              console.error(chalk.red('Error occured sending starting update : ' + err.message));
            }
            return;
          });
          initiateFirmwareUpdateFlow(function(err, result) {
            fwUpdateInProgress = false;
            if (!err) {
              console.log(chalk.green('Completed firmwareUpdate flow. New version: ' + result));
              sendFinishedUpdate(result, function (err) {
                if (err) {
                  console.error(chalk.red('Error occured sending finished update : ' + err.message));
                }
                return;
              });
            }
          }, twin.properties.reported.firmware.currentFwVersion);
        });
        // </initiateUpdate>
      }
    });
    console.log(chalk.green('Client connected to IoT Hub. Waiting for desired properties update.'));
  }
});

// <firmwareupdateflow>
// Implementation of firmwareUpdate flow
function initiateFirmwareUpdateFlow(callback, currentVersion) {

  async.waterfall([
    downloadImage,
    verifyImage,
    applyImage,
    reboot
  ], function(err, result) {
    if (err) {
      console.error(chalk.red('Error occured firmwareUpdate flow : ' + err.message));
      sendStatusUpdate('error', err.message, function (err) {
        if (err) {
          console.error(chalk.red('Error occured sending status update : ' + err.message));
        }
      });
      setTimeout(function() {
        console.log('Simulate rolling back update due to error');
        sendStatusUpdate('rolledback', 'Rolled back to: ' + currentVersion, function (err) {
          if (err) {
            console.error(chalk.red('Error occured sending status update : ' + err.message));
          }
        });
        callback(err, result);
      }, 5000);
    } else {
      callback(null, result);
    }
  });
}
// </firmwareupdateflow>

// <downloadimagephase>
// Simulate downloading an image
function downloadImage(callback) {
  console.log('Simulating image download from: ' + desiredFirmwareProperties.fwPackageURI);

  async.waterfall([
    function(callback) {
      sendStatusUpdate('downloading', 'Start downloading', function (err) {
        if (err) {
          console.error(chalk.red('Error occured sending status update : ' + err.message));
        }
      });
      callback(null);
    },
    function(callback) {
      // Simulate a delay downloading the image.
      setTimeout(function() {
        // Simulate some firmware image data
        var imageData = '[Fake firmware image data]';
        callback(null, imageData); 
      }, 30000);
    },
    function(imageData, callback) {
      console.log('Downloaded image data: ' + imageData);
      sendStatusUpdate('downloading', 'Finished downloading', function (err) {
        if (err) {
          console.error(chalk.red('Error occured sending status update : ' + err.message));
        }
      });
      callback(null, imageData);
    }
  ], function (err, result) {
    callback(err, result);
  });
}
// </downloadimagephase>

// <verifyimagephase>
// Simulate verifying an image
function verifyImage(imageData, callback) {
  console.log('Simulating image verification using checksum: ' + desiredFirmwareProperties.fwPackageCheckValue);

  async.waterfall([
    function(callback) {
      sendStatusUpdate('verifying', 'Start verifying download', function (err) {
        if (err) {
          console.error(chalk.red('Error occured sending status update : ' + err.message));
        }
      });
      callback(null);
    },
    function(callback) {
      // Simulate verifying the image.
      setTimeout(function() {
        // Simulate verifying image data
        callback(null);
        // Simulate an error verifying the image data
        //callback(new Error('Image verification failed'));
      }, 10000);
    },
    function(callback) {
      sendStatusUpdate('verifying', 'Finished verifying download', function (err) {
        if (err) {
          console.error(chalk.red('Error occured sending status update : ' + err.message));
        }
      });
      callback(null);
    }
  ], function (err) {
    callback(err, imageData);
  });
}
// </verifyimagephase>

// <applyimagephase>
// Simulate applying an image
function applyImage(imageData, callback) {
  console.log('Simulating applying image');

  async.waterfall([
    function(callback) {
      sendStatusUpdate('applying', 'Start applying image', function (err) {
        if (err) {
          console.error(chalk.red('Error occured sending status update : ' + err.message));
        }
      });
      callback(null);
    },
    function(callback) {
      // Simulate a delay applying the image.
      setTimeout(function() {
        callback(null, imageData); 
      }, 30000);
    },
    function(imageData, callback) {
      console.log('Applied image data: ' + imageData);
      sendStatusUpdate('applying', 'Finished applying image', function (err) {
        if (err) {
          console.error(chalk.red('Error occured sending status update : ' + err.message));
        }
      });
      callback(null);
    }
  ], function (err) {
    callback(err);
  });
}
// </applyimagephase>

// <rebootphase>
// Simulate rebooting the device
function reboot(callback) {
  console.log('Simulating reboot phase');

  async.waterfall([
    function(callback) {
      sendStatusUpdate('rebooting', 'Start reboot', function (err) {
        if (err) {
          console.error(chalk.red('Error occured sending status update : ' + err.message));
        }
      });
      callback(null);
    },
    function(callback) {
      // Simulate a delay rebooting the device.
      setTimeout(function() {
        callback(null); 
      }, 40000);
    },
    function(callback) {
      sendStatusUpdate('rebooting', 'Finished reboot', function (err) {
        if (err) {
          console.error(chalk.red('Error occured sending status update : ' + err.message));
        }
      });
      callback(null);
    }
  ], function (err) {
    callback(err, desiredFirmwareProperties.fwVersion);
  });
}
// </rebootphase>