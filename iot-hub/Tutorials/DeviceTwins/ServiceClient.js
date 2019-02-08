// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

"use strict";

const chalk = require('chalk');
var Registry = require('azure-iothub').Registry;

// Get the service connection string from a command line argument
var connectionString = process.argv[2];
var deviceId = 'MyTwinDevice';

// Sleep function to simulate delays
function sleep(ms){
  return new Promise(resolve=>{
      setTimeout(resolve,ms)
  })
}

// Delete all desired properties
var twinPatchReset = {
  properties: {
    desired: null
  }
}

// Set up some initial values
var twinPatchInit = {
  properties: {
    desired: {
      patchId: "Init",
      fanOn: "false",
      components: {
        system: {
          id: "17",
          units: "farenheit",
          firmwareVersion: "9.75"
        },
        climate: {
          minTemperature: "68",
          maxTemperature: "76"
        }
      }
    }
  }
};

// <patches>
// Turn the fan on
var twinPatchFanOn = {
  properties: {
    desired: {
      patchId: "Switch fan on",
      fanOn: "false",
    }
  }
};

// Set the maximum temperature for the climate component
var twinPatchSetMaxTemperature = {
  properties: {
    desired: {
      patchId: "Set maximum temperature",
      components: {
        climate: {
          maxTemperature: "92"
        }
      }
    }
  }
};

// Add a new component
var twinPatchAddWifiComponent = {
  properties: {
    desired: {
      patchId: "Add WiFi component",
      components: {
        wifi: { 
          channel: "6",
          ssid: "my_network"
        }
      }
    }
  }
};

// Update the WiFi component
var twinPatchUpdateWifiComponent = {
  properties: {
    desired: {
      patchId: "Update WiFi component",
      components: {
        wifi: { 
          channel: "13",
          ssid: "my_other_network"
        }
      }
    }
  }
};

// Delete the WiFi component
var twinPatchDeleteWifiComponent = {
  properties: {
    desired: {
      patchId: "Delete WiFi component",
      components: {
        wifi: null
      }
    }
  }
};
// </patches>

// <senddesiredproperties>
// Send a desired property update patch
async function sendDesiredProperties(twin, patch) {
  twin.update(patch, (err, twin) => {
    if (err) {
      console.error(err.message);
    } else {
      console.log(chalk.green(`\nSent ${twin.properties.desired.patchId} patch:`));
      console.log(JSON.stringify(patch, null, 2));
    }
  });
}
// </senddesiredproperties>

// <displayreportedproperties>
// Display the reported properties from the device
function printReportedProperties(twin) {
  console.log("Last received patch: " + twin.properties.reported.lastPatchReceivedId);
  console.log("Firmware version: " + twin.properties.reported.firmwareVersion);
  console.log("Fan status: " + twin.properties.reported.fanOn);
  console.log("Min temperature set: " + twin.properties.reported.minTemperature);
  console.log("Max temperature set: " + twin.properties.reported.maxTemperature);
}
// </displayreportedproperties>

// <getregistrytwin>
// Create a device identity registry object
var registry = Registry.fromConnectionString(connectionString);

// Get the device twin and send desired property update patches at intervals.
// Print the reported properties after some of the desired property updates.
registry.getTwin(deviceId, async (err, twin) => {
  if (err) {
    console.error(err.message);
  } else {
    console.log('Got device twin');
    // </getregistrytwin>

    sendDesiredProperties(twin,twinPatchReset);
    await sleep(20000);
    console.log(chalk.blue('Initial reported properties from the device'));
    printReportedProperties(twin);
    sendDesiredProperties(twin,twinPatchInit);
    await sleep(5000);
    sendDesiredProperties(twin,twinPatchFanOn);
    await sleep(5000);
    sendDesiredProperties(twin,twinPatchSetMaxTemperature);
    await sleep(5000);
    sendDesiredProperties(twin,twinPatchAddWifiComponent);
    await sleep(5000);
    sendDesiredProperties(twin,twinPatchUpdateWifiComponent);
    await sleep(5000);
    sendDesiredProperties(twin,twinPatchDeleteWifiComponent);
    await sleep(20000);
    console.log(chalk.blue('\nFinal reported properties from the device'));
    printReportedProperties(twin);
  }
});

