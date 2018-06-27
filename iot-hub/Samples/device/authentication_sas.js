// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

'use strict';

var Protocol = require('azure-iot-device-mqtt').Mqtt;
// Uncomment one of these transports and then change it in fromConnectionString to test other transports
// var Protocol = require('azure-iot-device-amqp').AmqpWs;
// var Protocol = require('azure-iot-device-http').Http;
// var Protocol = require('azure-iot-device-amqp').Amqp;
var Client = require('azure-iot-device').Client;

// String SharedAccessSignature in the following formats:
//  "SharedAccessSignature sr=<iothub_host_name>/devices/<device_id>&sig=<signature>&se=<expiry>"
var sas = process.env.DEVICE_SAS;

if (!sas) {
  console.log('Please set the DEVICE_SAS environment variable to the Shared Access Signature you want to use before running this sample');
  process.exit(-1);
}

// fromSharedAccessSignature must specify a transport constructor, coming from any transport package.
var client = Client.fromSharedAccessSignature(sas, Protocol);

client.open(function (err) {
  if (err) {
    console.error(err.toString());
    process.exit(-1);
  } else {
    console.log('Successfully connected with the shared access signature');
    process.exit(0);
  }
});
