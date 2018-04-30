'use strict';

// The device connection string to authenticate the device with your IoT hub.
//
// NOTE:
// For simplicity, this sample sets the connection string in code.
// In a production environment, the recommended approach is to use
// an environment variable to make it available to your application.
//
// Using the Azure CLI:
// az iot hub device-identity show-connection-string --hub-name {YourIoTHubName} --device-id MyTestDevice --output table
var connectionString = '{your device connection string}';

// Using the Node.js Device SDK for IoT Hub:
//   https://github.com/Azure/azure-iot-sdk-node
// The sample connects to a device-specific MQTT endpoint on your IoT Hub.
var Protocol = require('azure-iot-device-mqtt').Mqtt;
var Client = require('azure-iot-device').Client;
var Message = require('azure-iot-device').Message;
var NoRetry = require('azure-iot-common').NoRetry;
var client = Client.fromConnectionString(connectionString, Protocol);

console.log('IoT Hub troubleshooting tutorial\nSimulated device #1\n')
// Disable retries so you see the connection error immediately
client.setRetryPolicy(new NoRetry());

// Callback function to run after connecting to the IoT hub.
var connectCallback = function (err) {
  if (err) {
    console.log('Could not connect: ' + err);
  } else {
    console.log('Client connected');
  }
  client.close();
  process.exit(0);
};

// Connect to the IoT hub.
client.open(connectCallback);