// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

'use strict';

var Client = require('azure-iot-device').Client;
var Protocol = require('azure-iot-device-mqtt').Mqtt;
var url = require('url');
var async = require('async');
const chalk = require('chalk');

// Receive the IoT Hub device connection string as a command line parameter
if(process.argv.length < 3) {
  console.error('Usage: node SimulatedDevice.js <<IoT Hub Device Connection String>>');
  process.exit(1);
}

var connectionString = process.argv[2];
var client = Client.fromConnectionString(connectionString, Protocol);

client.open(function(err) {
  if (!err) {
    // <handledirectmethod>
    client.onDeviceMethod('firmwareUpdate', function(request, response) {
      // Get the firmware image Uri from the body of the method request
      var fwPackageUri = request.payload.fwPackageUri;
      var fwPackageUriObj = url.parse(fwPackageUri);
      
      // Ensure that the url is to a secure url
      if (fwPackageUriObj.protocol !== 'https:') {
        response.send(400, 'Invalid URL format.  Must use https:// protocol.', function(err) {
          if (err) console.error(chalk.red('Error sending direct method response :\n' + err.toString()));
          else console.log(chalk.green('Response to direct method \'' + request.methodName + '\' sent successfully.'));
        });
      } else {
        // Respond the cloud app for the device method
        response.send(200, 'Firmware update started.', function(err) {
          if (err) console.error(chalk.red('Error sending direct method response :\n' + err.toString()));
          else console.log(chalk.green('Response to direct method \'' + request.methodName + '\' sent successfully.'));
        });

        initiateFirmwareUpdateFlow(fwPackageUri, function(err){
          if (!err) console.log("Completed firmwareUpdate flow")
          else console.log("Error occured firmwareUpdate flow");
        });
      }
    });
    // </handledirectmethod>
    console.log('Client connected to IoT Hub. Waiting for firmwareUpdate device method.');
  }
});

// <firmwareupdateflow>
// Implementation of firmwareUpdate flow
function initiateFirmwareUpdateFlow(fwPackageUri, callback) {
  async.waterfall([
    function (callback) {
      downloadImage(fwPackageUri, callback);
    },
    applyImage
  ], function(err) {
    if (err) {
      console.error('Error : ' + err.message);
    } 
    callback(err);
  });
}
// </firmwareupdateflow>

// <downloadimagephase>
// Function that implements the 'downloadImage' phase of the 
// firmware update process.
function downloadImage(fwPackageUriVal, callback) {
  var imageResult = '[Fake firmware image data]';
  
  async.waterfall([
    function (callback) {
      reportFWUpdateThroughTwin ({ 
        status: 'downloading',
        startedDownloadingTime: new Date().toISOString()
      }, 
      callback);
    },
    function (callback) {
      console.log("Downloading image from URI: " + fwPackageUriVal); 

      // Replace this line with the code to download the image.  Delay used to simulate the download.
      setTimeout(function() { 
        callback(null); 
      }, 4000);
    },
    function (callback) {
      reportFWUpdateThroughTwin ({ 
        status: 'download complete',
        downloadCompleteTime : new Date().toISOString()
      }, 
      callback);
    },
  ],
  function(err) {
    if (err) {
      reportFWUpdateThroughTwin( { status : 'download image failed' }, function(err) {
        if (err) {
          callback(err); 
        }  
      })
    }
    callback(err, imageResult);
  });
}
// </downloadimagephase>

// <applyimagephase>
// Implementation for the apply phase, which reports status after 
// completing the image apply.
function applyImage(imageData, callback) {
  async.waterfall([
    function(callback) {
      reportFWUpdateThroughTwin ({ 
        status: 'applying',
        startedApplyingImage: new Date().toISOString()
      }, 
      callback);
    },
    function (callback) {
      console.log("Applying firmware image"); 

      // Replace this line with the code to download the image.  Delay used to simulate the download.
      setTimeout(function() { 
        callback(null);
      }, 4000);      
    },
    function (callback) {
      reportFWUpdateThroughTwin ({ 
        status: 'apply firmware image complete',
        lastFirmwareUpdate: new Date().toISOString()
      }, 
      callback);
    },
  ], 
  function (err) {
    if (err) {
      reportFWUpdateThroughTwin({ status : 'apply image failed' }, function(err) {
        if (err) {
          callback(err); 
        }
      })
    }
    callback(err);
  })
}
// </applyimagephase>

// Helper function to update the twin reported properties.
// Used by every phase of the firmware update.
function reportFWUpdateThroughTwin(firmwareUpdateValue, callback) {
  var patch = {
    firmwareUpdate : firmwareUpdateValue
  };
  console.log(JSON.stringify(patch, null, 2));
  client.getTwin(function(err, twin) {
    if (!err) {
      twin.properties.reported.update(patch, function(err) {
        callback(err);
      });      
    } else {
      callback(err);
    }
  });
};