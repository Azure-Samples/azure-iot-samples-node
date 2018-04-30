'use strict';

// The device connection string to authenticate the device with your IoT hub.
//
// NOTE:
// For simplicity, this sample sets the connection string in code.
// In a production environment, the recommended approach is to use
// an environment variable to make it available to your application
// or use an HSM or an x509 certificate.
// https://docs.microsoft.com/azure/iot-hub/iot-hub-devguide-security
//
// Using the Azure CLI:
// az iot hub device-identity show-connection-string --hub-name {YourIoTHubName} --device-id MyNodeDevice --output table
var connectionString = '{Your device connection string here}';

// Using the Node.js Device SDK for IoT Hub:
//   https://github.com/Azure/azure-iot-sdk-node
// The sample connects to a device-specific MQTT endpoint on your IoT Hub.
var clientFromConnectionString = require('azure-iot-device-mqtt').clientFromConnectionString;
var Message = require('azure-iot-device').Message;

var client = clientFromConnectionString(connectionString);

// Print results.
function printResultFor(op) {
  return function printResult(err, res) {
    if (err) console.log(op + ' error: ' + err.toString());
    if (res) console.log(op + ' status: ' + res.constructor.name);
  };
}

// Callback function to run after connecting to the IoT hub.
var connectCallback = function (err) {
  if (err) {
    console.log('Could not connect: ' + err);
  } else {
    console.log('Client connected');

    // Create a message and send it to the IoT hub every second
    setInterval(function(){
      // Simulate telemetry.
      var temperature = 20 + (Math.random() * 15);
      var humidity = 60 + (Math.random() * 20);

      // Add the telemetry to the message body.
      var data = JSON.stringify({ temperature: temperature, humidity: humidity });
      var message = new Message(data);

      // Add a custom application property to the message.
      // An IoT hub can filter on these properties without access to the message body.
      message.properties.add('temperatureAlert', (temperature > 30) ? 'true' : 'false');
      console.log('Sending message: ' + message.getData());

      // Send the message.
      client.sendEvent(message, printResultFor('send'));
    }, 1000);
  }
};

// Connect to the IoT hub.
client.open(connectCallback);