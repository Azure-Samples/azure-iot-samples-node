// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

'use strict';

var Http = require('azure-iot-device-http').Http;
var Client = require('azure-iot-device').Client;
var Message = require('azure-iot-device').Message;

// String containing Hostname, Device Id & Device Key in the following formats:
//  "HostName=<iothub_host_name>;DeviceId=<device_id>;SharedAccessKey=<device_key>"
var connectionString = process.env.DEVICE_CONNECTION_STRING;
if (!connectionString) {
  console.log('Please set the DEVICE_CONNECTION_STRING environment variable.');
  process.exit(-1);
}

// Note: message batching is only supported with Http in the Node SDK for now.
var client = Client.fromConnectionString(connectionString, Http);

// Create two messages and send them to the IoT hub as a batch.
var data = [
  { id: 1, message: 'hello' },
  { id: 2, message: 'world' }
];

var messages = [];
data.forEach(function (value) {
  messages.push(new Message(JSON.stringify(value)));
});

console.log('sending ' + messages.length + ' events in a batch');

client.sendEventBatch(messages, function (err) {
  if (err) {
    console.error(err.toString());
    process.exit(-1);
  } else {
    console.log('Message batch successfully sent');
    process.exit(0);
  }
});