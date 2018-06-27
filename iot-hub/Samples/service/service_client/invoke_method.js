// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

'use strict';

var Client = require('azure-iothub').Client;

var connectionString = process.env.IOTHUB_CONNECTION_STRING;
if (!connectionString) {
  console.log('Please set the IOTHUB_CONNECTION_STRING environment variable.');
  process.exit(-1);
}

var targetDevice = process.argv[2];
if (!targetDevice) {
  console.log('Please give pass a device id as argument to the script (the name of the method called is methodName1 by default and can be edited directly in the script)');
  process.exit(-1);
}

var methodParams = {
  methodName: 'methodName1',
  payload: '[method payload]',
  responseTimeoutInSeconds: 15 // set response timeout as 15 seconds
};

var client = Client.fromConnectionString(connectionString);

client.invokeDeviceMethod(targetDevice, methodParams, function (err, result) {
  if (err) {
    console.error('Failed to invoke method \'' + methodParams.methodName + '\': ' + err.message);
    process.exit(-1);
  } else {
    console.log(methodParams.methodName + ' on ' + targetDevice + ':');
    console.log(JSON.stringify(result, null, 2));
    process.exit(0);
  }
});