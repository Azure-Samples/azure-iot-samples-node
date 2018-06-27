// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

"use strict";

var Registry = require('azure-iothub').Registry;

var connectionString = process.env.IOTHUB_CONNECTION_STRING;
if (!connectionString) {
  console.log('Please set the IOTHUB_CONNECTION_STRING environment variable.');
  process.exit(-1);
}

var deviceId = process.argv[2];
if (!deviceId) {
  console.error('Please provide the device id for an edge device as an argument');
  process.exit(-1);
}

var moduleId = process.argv[3];
if (!moduleId) {
  console.error('Please provide the module id for which to get the twin as a second argument');
  process.exit(-1);
}


var registry = Registry.fromConnectionString(connectionString);
registry.getModuleTwin(deviceId, moduleId, function(err, twin) {
  if (err) {
    console.error(err.message);
    process.exit(-1);
  } else {
    console.log(JSON.stringify(twin, null, 2));
    var twinPatch = {
      tags: {
        city: "Redmond"
      },
      properties: {
        desired: {
          telemetryInterval: 1000
        }
      }
    };

    // method 1: using the update method directly on the twin
    twin.update(twinPatch, function(err, twin) {
      if (err) {
        console.error(err.message);
        process.exit(-1);
      } else {
        console.log(JSON.stringify(twin, null, 2));
        // method 2: using the updateTwin method on the Registry object
        registry.updateModuleTwin(twin.deviceId, twin.moduleId, { properties: { desired: { telemetryInterval: 2000 }}}, twin.etag, function(err, twin) {
          if (err) {
            console.error(err.message);
            process.exit(-1);
          } else {
            console.log(JSON.stringify(twin, null, 2));
            process.exit(0);
          }
        });
      }
    });
  }
});