// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

'use strict';

var Protocol = require('azure-iot-device-mqtt').Mqtt;
var Client = require('azure-iot-device').Client;
var fs = require('fs');

var connectionString = process.env.DEVICE_CONNECTION_STRING;
if (!connectionString) {
  console.log('Please set the DEVICE_CONNECTION_STRING environment variable.');
  process.exit(-1);
}

var filePath = process.argv[2];

var client = Client.fromConnectionString(connectionString, Protocol);

fs.stat(filePath, function (err, fileStats) {
  if (err) {
    console.error('could not read file: ' + err.toString());
    process.exit(-1);
  } else {
    var fileStream = fs.createReadStream(filePath);

    client.uploadToBlob('testblob.txt', fileStream, fileStats.size, function (err, result) {
      fileStream.destroy();
      if (err) {
        console.error('error uploading file: ' + err.constructor.name + ': ' + err.message);
        process.exit(-1);
      } else {
        console.log('Upload successful - ' + result);
        process.exit(0);
      }
    });
  }
});