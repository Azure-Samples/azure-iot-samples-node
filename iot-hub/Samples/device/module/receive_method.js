// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

'use strict';

var Protocol = require('azure-iot-device-mqtt').Mqtt;
var ModuleClient = require('azure-iot-device').ModuleClient;

ModuleClient.fromEnvironment(Protocol, function (err, client) {
  if (err) {
    console.log('error:' + err);
  } else {
    console.log('got client');
    client.on('error', function (err) {
      console.error(err.message);
    });

    // connect to the edge instance
    client.open(function (err) {
      if (err) {
        console.error('Could not connect: ' + err.message);
      } else {
        console.log('Client connected');

        client.onDeviceMethod('<methodName>', function(request, response) {
          console.log('<methodName> called');

          if(request.payload) {
            console.log('Payload:');
            console.dir(request.payload);
          }

          var responseBody = {
            message: '<methodName> succeeded'
          };
          response.send(200, responseBody, function(err) {
            if (err) {
              console.log('failed sending method response: ' + err);
            } else {
              console.log('successfully sent method response');
            }
          });

        });
      }
    });
  }
});