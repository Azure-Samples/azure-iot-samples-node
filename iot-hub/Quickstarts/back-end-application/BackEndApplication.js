// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

'use strict';

// Connection string for the IoT Hub service
//
// NOTE:
// For simplicity, this sample sets the connection string in code.
// In a production environment, the recommended approach is to use
// an environment variable to make it available to your application
// or use an x509 certificate.
// https://docs.microsoft.com/azure/iot-hub/iot-hub-devguide-security
//
// Using the Azure CLI:
// az iot hub show-connection-string --hub-name {YourIoTHubName} --policy-name service --output table
var connectionString = '{Your service connection string here}';

// Using the Node.js Service SDK for IoT Hub:
//   https://github.com/Azure/azure-iot-sdk-node
// The sample connects to service-side endpoint to call direct methods on devices.
var Client = require('azure-iothub').Client;

var deviceId = 'MyNodeDevice';

// Connect to the service-side endpoint on your IoT hub.
var client = Client.fromConnectionString(connectionString);

// Set the direct method name, payload, and timeout values
var methodParams = {
  methodName: 'SetTelemetryInterval',
  payload: 10, // Number of seconds.
  responseTimeoutInSeconds: 30
};

// Call the direct method on your device using the defined parameters.
client.invokeDeviceMethod(deviceId, methodParams, function (err, result) {
  if (err) {
      console.error('Failed to invoke method \'' + methodParams.methodName + '\': ' + err.message);
  } else {
      console.log('Response from ' + methodParams.methodName + ' on ' + deviceId + ':');
      console.log(JSON.stringify(result, null, 2));
  }
});