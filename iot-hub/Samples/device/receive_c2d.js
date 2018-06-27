// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

'use strict';

var Protocol = require('azure-iot-device-mqtt').Mqtt;
// Uncomment one of these transports and then change it in fromConnectionString to test other transports
// var Protocol = require('azure-iot-device-amqp').AmqpWs;
// var Protocol = require('azure-iot-device-http').Http;
// var Protocol = require('azure-iot-device-amqp').Amqp;
// var Protocol = require('azure-iot-device-mqtt').MqttWs;
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

    // Subscribing to the message event will automatically subscribe to the appropriate topic in MQTT, establish links in AMQP,
    // or start a timer to receive at specific intervals in HTTP.
    // The HTTP behavior can be customized with a call to `Client.setOptions`.
    client.on('message', function (msg) {
      console.log('----');
      console.log(msg.data.toString());
      console.log('----');

      client.complete(msg, function (err) {
        if (err) {
          client.error('could not settle message: ' + err.toString());
          process.exit(-1);
        } else {
          console.log('message successfully accepted');
          process.exit(0);
        }
      });
      // The AMQP and HTTP transports also have the notion of completing, rejecting or abandoning the message.
      // When completing a message, the service that sent the C2D message is notified that the message has been processed.
      // When rejecting a message, the service that sent the C2D message is notified that the message won't be processed by the device. the method to use is client.reject(msg, callback).
      // When abandoning the message, IoT Hub will immediately try to resend it. The method to use is client.abandon(msg, callback).
      // MQTT is simpler: it accepts the message by default, and doesn't support rejecting or abandoning a message.
    });

    client.on('error', function (err) {
      console.error(err.message);
    });

    console.log('now listening for C2D messages...');
  }
});