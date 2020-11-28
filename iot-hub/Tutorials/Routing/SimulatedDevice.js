'use strict';

// Pass in the device connection string to authenticate the device with your IoT hub.
// Using the Azure CLI:
// az iot hub device-identity show-connection-string --hub-name {YourIoTHubName} --device-id MyTestDevice --output table
var connectionString = process.argv[2];

// Using the Node.js Device SDK for IoT Hub:
//   https://github.com/Azure/azure-iot-sdk-node
// The sample connects to a device-specific MQTT endpoint on your IoT Hub.
var Protocol = require('azure-iot-device-mqtt').Mqtt;
var Client = require('azure-iot-device').Client;
var Message = require('azure-iot-device').Message;
var NoRetry = require('azure-iot-common').NoRetry;
var client = Client.fromConnectionString(connectionString, Protocol);
const chalk = require('chalk');
const myDeviceId = 'Contoso-Test-Device';

console.log('IoT Hub routing tutorial\nSimulated device\n')

// Print results.
function printResultFor(op) {
  return function printResult(err, res) {
    if (err) console.log(op + ' error: ' + err.toString());
    if (res) console.log(op + ' status: ' + res.constructor.name);
  };
}

// Connect to the IoT hub.
client.open(function (err) {
  if (err) {
    console.log(chalk.red('Could not connect: ' + err));
  } else {
    console.log('Client connected');

    // Create a message and send it to the IoT hub every second
    setInterval(function(){
      // Simulate telemetry.
      var temperature = 20 + (Math.random() * 15);
      var humidity = 60 + (Math.random() * 20);
      var levelValue;
      var infoString;

      if (Math.random() > 0.7) {
        if( Math.random() > 0.5 ) {
          levelValue = 'critical';
          infoString = 'This is a critical message.';
        }else{
          levelValue = 'storage';
          infoString = 'This is a storage message.';
        }
      } else {
        levelValue = 'normal';
        infoString = 'This is a normal message.';
      }

      // Add the telemetry to the message body.
      var data = JSON.stringify({ deviceId: myDeviceId, temperature: temperature, humidity: humidity, pointInfo: infoString });
      var message = new Message(data);

      // Add the level for routing
      message.properties.add('level', levelValue);
      console.log('Sending message: ' + message.getData());

      // Send the message.
      client.sendEvent(message, printResultFor('Send telemetry'));
    }, 1000);
  }
});