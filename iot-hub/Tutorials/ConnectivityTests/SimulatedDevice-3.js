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

console.log('IoT Hub troubleshooting tutorial\nSimulated device #3\n')

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

    // Listen for TestMethod being called from the hub
    client.onDeviceMethod('TestMethod', function(request, response) {

      console.log(chalk.green('Direct method payload received:'));
      console.log(chalk.green(JSON.stringify(request.payload)));

      // Report success back to your hub.
      response.send(200, 'TestMethod received: ' + JSON.stringify(request.payload), function (err) {
        if(err) {
          console.error(chalk.red('An error ocurred when sending a method response:\n' + err.toString()));
        } else {
          console.log(chalk.green('Response to method \'' + request.methodName + '\' sent successfully.' ));
        }
      });
    });

    // Send reported properties to the hub
    client.getTwin(function(err, twin) {
      if (err) {
        console.error(chalk.red('Could not get twin'));
      } else {
        var timestamp = new Date();
        var patch = {
          devicelaststarted: timestamp
        };

        twin.properties.reported.update(patch, function(err) {
          if (err) {
            console.error(chalk.red('Could not update twin'));
          } else {
            console.log(chalk.green('Twin: Sent reported properties'));
          }
        });

        twin.on('properties.desired', function(desiredChange) {
          console.log(chalk.green('Twin: Received desired properties:\n' + JSON.stringify(desiredChange)));
        });
      }
    });

    // Create a message and send it to the IoT hub every second
    setInterval(function(){
      // Simulate telemetry.
      var temperature = 20 + (Math.random() * 15);
      var humidity = 60 + (Math.random() * 20);

      // Add the telemetry to the message body.
      var data = JSON.stringify({ temperature: temperature, humidity: humidity });
      var message = new Message(data);

      console.log('Sending message: ' + message.getData());

      // Send the message.
      client.sendEvent(message, printResultFor('Send telemetry'));
    }, 1000);
  }
});