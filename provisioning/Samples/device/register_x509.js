// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

'use strict';

var fs = require('fs');
var Transport = require('azure-iot-provisioning-device-http').Http;

// Feel free to change the preceding using statement to anyone of the following if you would like to try another protocol.
// var Transport = require('azure-iot-provisioning-device-amqp').Amqp;
// var Transport = require('azure-iot-provisioning-device-amqp').AmqpWs;
// var Transport = require('azure-iot-provisioning-device-mqtt').Mqtt;
// var Transport = require('azure-iot-provisioning-device-mqtt').MqttWs;

var X509Security = require('azure-iot-security-x509').X509Security;
var ProvisioningDeviceClient = require('azure-iot-provisioning-device').ProvisioningDeviceClient;

//
// For the public clouds the address of the provisioning host would be: global.azure-devices-provisioning.net
//
var provisioningHost = process.env.PROVISIONING_HOST;
if (!provisioningHost) {
  console.error('please set the PROVISIONING_HOST environment variable to the one you want to use. The default public provisioning host is: global.azure-devices-provisioning.net');
  process.exit(-1);
}
//
// You can find your idScope in the portal overview section for your dps instance.
//
var idScope = process.env.ID_SCOPE;
if (!idScope) {
  console.error('please set the ID_SCOPE environment variable to the one you want to use.');
  process.exit(-1);
}

//
// REGISTRATION_ID is the device id which was used for certificate generation.
// This id will be shown at the device enrollment registration records
//
var registrationId = process.env.REGISTRATION_ID;
if (!registrationId) {
  console.error('please set the REGISTRATION_ID environment variable to the one you want to use.');
  process.exit(-1);
}

var deviceCert = {
  cert: fs.readFileSync('<cert filename>').toString(),
  key: fs.readFileSync('<key filename>').toString()
};

var transport = new Transport();
var securityClient = new X509Security(registrationId, deviceCert);
var deviceClient = ProvisioningDeviceClient.create(provisioningHost, idScope, transport, securityClient);

// Register the device.  Do not force a re-registration.
deviceClient.register(function(err, result) {
  if (err) {
    console.log("error registering device: " + err);
    process.exit(-1);
  } else {
    console.log('registration succeeded');
    console.log('assigned hub=' + result.assignedHub);
    console.log('deviceId=' + result.deviceId);
    process.exit(0);
  }
});
