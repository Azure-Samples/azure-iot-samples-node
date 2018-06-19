'use strict';

// Pass in a test SAS token. To generate using the CLI:
// az iot hub generate-sas-token --device-id MyTestDevice --hub-name {YourIoTHubName}
var test_token = process.argv[2];

// Using the Node.js Device SDK for IoT Hub:
//   https://github.com/Azure/azure-iot-sdk-node
// The sample connects to a device-specific MQTT endpoint on your IoT Hub.

var Protocol = require('azure-iot-device-mqtt').Mqtt;
var Client = require('azure-iot-device').Client;
var Message = require('azure-iot-device').Message;
var NoRetry = require('azure-iot-common').NoRetry;
var crypto = require('crypto');

// // Example code showing how to generate a SAS token using the SDK.
// function generateSasToken(resourceUri, signingKey, policyName, expiresInMins) {
//   resourceUri = encodeURIComponent(resourceUri);

//   // Set expiration in seconds
//   var expires = (Date.now() / 1000) + expiresInMins * 60;
//   expires = Math.ceil(expires);
//   var toSign = resourceUri + '\n' + expires;

//   // Use crypto
//   var hmac = crypto.createHmac('sha256', new Buffer(signingKey, 'base64'));
//   hmac.update(toSign);
//   var base64UriEncoded = encodeURIComponent(hmac.digest('base64'));

//   // Construct authorization string
//   var token = "SharedAccessSignature sr=" + resourceUri + "&sig="
//   + base64UriEncoded + "&se=" + expires;
//   if (policyName) token += "&skn="+policyName;
//   return token;
// };
//
// // Example code showing how to generate a SAS token using the SDK
// 
// var SharedAccessSignature = require('azure-iot-common').SharedAccessSignature;
// function generateSasToken(resourceUri, signingKey, policyName, expiresInMins) {
//
//   // Set expiration in seconds
//   var expires = (Date.now() / 1000) + expiresInMins * 60;
//   expires = Math.ceil(expires);
//
//   var token = SharedAccessSignature.create(resourceUri, policyName, signingKey, expires);
//
//   return token;
// };
//
// // There are two ways to create a SAS token for a device to connect:
//
// var token = generateSasToken(
//  'hubname.azure-devices.net/devices/devicename',
//  'device shared access policy key',
//  'device',
//  expiryInMins)
//
// var token = generateSasToken(
//  'hubname.azure-devices.net/devices/devicename',
//  'device key',
//  null,
//  expiryInMins)

var client = Client.fromSharedAccessSignature(test_token, Protocol);

console.log('IoT Hub troubleshooting tutorial\nSimulated device #2\n')

// Disable retries so you see the connection error immediately
client.setRetryPolicy(new NoRetry());

// Connect to the IoT hub.
client.open(function (err) {
  if (err) {
    console.log('Could not connect: ' + err);
  } else {
    console.log('Client connected');
  }
  client.close(function() {
    process.exit(0);
  });
});