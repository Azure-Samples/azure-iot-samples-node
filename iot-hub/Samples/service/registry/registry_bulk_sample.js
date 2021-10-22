// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

"use strict";

var iothub = require("azure-iothub");
var azureStorage = require("@azure/storage-blob");

async function main() {
  var iothubConnectionString = process.env.IOTHUB_CONNECTION_STRING;
  if (!iothubConnectionString) {
    console.log("Please set the IOTHUB_CONNECTION_STRING environment variable.");
    process.exit(-1);
  }

  var storageConnectionString = process.env.STORAGE_CONNECTION_STRING;
  if (!storageConnectionString) {
    console.log("Please set the STORAGE_CONNECTION_STRING environment variable.");
    process.exit(-1);
  }

  var registry = iothub.Registry.fromConnectionString(iothubConnectionString);
  var blobSvc = azureStorage.BlobServiceClient.fromConnectionString(storageConnectionString);

  var startDate = new Date();
  var expiryDate = new Date(startDate);
  expiryDate.setMinutes(startDate.getMinutes() + 100);
  startDate.setMinutes(startDate.getMinutes() - 100);

  var inputContainerName = "importcontainer";
  var outputContainerName = "exportcontainer";
  var deviceFile = "devices.txt";

  var inputContainerClient = blobSvc.getContainerClient(inputContainerName);

  try {
    await inputContainerClient.createIfNotExists();
  } catch (err) {
    console.error("Could not create input container: " + err.message);
  }
  var inputSasUrl = inputContainerClient.generateSasUrl({
    startsOn:startDate,
    expiresOn:expiryDate,
    permissions:azureStorage.AccountSASPermissions.parse("rl")
  })

  var blobClient = inputContainerClient.getBlockBlobClient(deviceFile);

  try {
    await blobClient.uploadFile(deviceFile);
  } catch (err) {
    console.error("Could not create devices.txt: " + err.message);
  }

  var outputContainerClient = blobSvc.getContainerClient(outputContainerName);

  try {
    await outputContainerClient.createIfNotExists();
  } catch (err) {
    console.error("Could not create output container: " + err.message);
  }

  var outputSasUrl = outputContainerClient.generateSasUrl({
    startsOn:startDate,
    expiresOn:expiryDate,
    permissions:azureStorage.AccountSASPermissions.parse("rwd")
  })

  /**
   * There can only be one active job at a time, therefore, you can uncomment the export section and comment the import
   * session or vice versa depending on what part of the code you would like to test.
   */

  //    registry.exportDevicesToBlob(outputSasUrl, false, function (error, result) {
  //        if (error) {
  //            console.error('Could not create export job: ' + error.message);
  //        } else {
  //            console.log('--------------\r\nDevices Export Job Identifier:--------------\r\n' + result);
  //            var jobId = result.jobId;
  //            var interval = setInterval(function () {
  //                registry.getJob(jobId, function (error, result) {
  //                   if (error) {
  //                       console.error('Could not get job status: ' + error.message + ' : ' + error.responseBody);
  //                   } else {
  //                       console.log('--------------\r\njob ' + jobId + ' status:\r\n--------------\r\n' + result);
  //                       var status = result.status;
  //                       if (status === "completed") {
  //                           clearInterval(interval);
  //                       }
  //                   }
  //               });
  //            }, 500);
  //        }
  //    });


  registry.importDevicesFromBlob(inputSasUrl, outputSasUrl, function (error, result) {
    if (error) {
      console.error("Could not create import devices: " + error.message + " : " + error.responseBody);
    } else {
      console.log("--------------\r\nDevices Import Job Identifier:--------------\r\n" + result);
      var jobId = result.jobId;
      var interval = setInterval(function () {
        /**
         * Uncomment this code to test cancelling a job.
         */
        //   registry.cancelJob(jobId, function (error, result) {
        //       if (error) {
        //           console.error('Could not cancel job: ' + error.message + ' : ' + error.responseBody);
        //       } else {
        //           console.log('--------------\r\njob ' + jobId + ' cancelled:\r\n--------------\r\n' + result);
        //           clearInterval(interval);
        //       }
        //   });

        registry.getJob(jobId, function (error, result) {
          if (error) {
            console.error("Could not get job status: " + error.message + " : " + error.responseBody);
          } else {
            console.log("--------------\r\njob " + jobId + " status:\r\n--------------\r\n" + result);
            var status = result.status;
            if (status === "completed") {
              console.log("completed");
              clearInterval(interval);
            }
          }
        });
      }, 500);
    }
  });

  registry.listJobs(function (error, result) {
    if (error) {
      console.error("Could not list jobs: " + error.message + " : " + error.responseBody);
    } else {
      console.log("Job list:\r\n----------\r\n" + result);
    }
  });
}

main();