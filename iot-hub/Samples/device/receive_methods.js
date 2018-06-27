// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

'use strict';

var Protocol = require('azure-iot-device-mqtt').Mqtt;
var Client = require('azure-iot-device').Client;

// String containing Hostname, Device Id & Device Key in the following formats:
//  "HostName=<iothub_host_name>;DeviceId=<device_id>;SharedAccessKey=<device_key>"
var connectionString = process.env.DEVICE_CONNECTION_STRING;
if (!connectionString) {
  console.log('Please set the DEVICE_CONNECTION_STRING environment variable.');
  process.exit(-1);
}

// fromConnectionString must specify a transport constructor, coming from any transport package.
var client = Client.fromConnectionString(connectionString, Protocol);

client.open(function (err) {
  if (err) {
    console.error(err.toString());
    process.exit(-1);
  } else {
    console.log('client successfully connected');
    client.on('error', function (err) {
      console.error(err.toString());
      process.exit(-1);
    });

    // register handler for 'methodName1'
    client.onDeviceMethod('methodName1', function (request, response) {
      console.log('received a request for methodName1');
      console.log(JSON.stringify(request.payload, null, 2));
      var fakeResponsePayload = {
        key: 'value'
      };

      response.send(200, fakeResponsePayload, function (err) {
        if (err) {
          console.error('Unable to send method response: ' + err.toString());
          process.exit(-1);
        } else {
          console.log('response to methodName1 sent.');
          process.exit(0);
        }
      });
    });

    // register handler for 'methodName2'
    client.onDeviceMethod('methodName2', function () {
      // ...
    });
  }
});
