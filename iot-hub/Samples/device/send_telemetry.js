// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

'use strict';

var uuid = require('uuid');
var Protocol = require('azure-iot-device-mqtt').Mqtt;
// Uncomment one of these transports and then change it in fromConnectionString to test other transports
// var Protocol = require('azure-iot-device-amqp').AmqpWs;
// var Protocol = require('azure-iot-device-http').Http;
// var Protocol = require('azure-iot-device-amqp').Amqp;
// var Protocol = require('azure-iot-device-mqtt').MqttWs;
var Client = require('azure-iot-device').Client;
var Message = require('azure-iot-device').Message;

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
    console.error('Could not connect: ' + err.message);
  } else {
    console.log('Client connected');

    client.on('error', function (err) {
      console.error(err.message);
      process.exit(-1);
    });

    // any type of data can be sent into a message: bytes, JSON...but the SDK will not take care of the serialization of objects.
    var message = new Message(JSON.stringify({
      key: 'value',
      theAnswer: 42
    }));
    // A message can have custom properties that are also encoded and can be used for routing
    message.properties.add('propertyName', 'propertyValue');

    // A unique identifier can be set to easily track the message in your application
    message.messageId = uuid.v4();

    console.log('Sending message: ' + message.getData());
    client.sendEvent(message, function (err) {
      if (err) {
        console.error('Could not send: ' + err.toString());
        process.exit(-1);
      } else {
        console.log('Message sent: ' + message.messageId);
        process.exit(0);
      }
    });
  }
});