// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

'use strict';

var Client = require('azure-iothub').Client;
var Message = require('azure-iot-common').Message;

var connectionString = process.env.IOTHUB_CONNECTION_STRING;
if (!connectionString) {
  console.log('Please set the IOTHUB_CONNECTION_STRING environment variable.');
  process.exit(-1);
}

var targetDevice = process.argv[2];
if (!targetDevice) {
  console.log('Please give pass a target device id as argument to the script');
  process.exit(-1);
}

var client = Client.fromConnectionString(connectionString);

client.open(function (err) {
  if (err) {
    console.error('Could not connect: ' + err.message);
    process.exit(-1);
  } else {
    console.log('Client connected');

    var message = new Message(JSON.stringify({ key : 'value' }));
    console.log('Sending message: ' + message.getData());
    client.send(targetDevice, message, function (err) {
      if (err) {
        console.error(err.toString());
        process.exit(-1);
      } else {
        console.log('sent c2d message');
        process.exit(0);
      }
    });
  }
});
