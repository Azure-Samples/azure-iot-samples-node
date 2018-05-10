// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

"use strict";

const chalk = require('chalk');
var Registry = require('azure-iothub').Registry;

var connectionString = process.argv[2];
var deviceId = 'TwinTesting';

function sleep(ms){
  return new Promise(resolve=>{
      setTimeout(resolve,ms)
  })
}

var twinPatchReset = {
  properties: {
    desired: null
  }
}

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

var twinPatchFanOn = {
  properties: {
    desired: {
      patchId: "Switch fan on",
      fanOn: "false",
    }
  }
};

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

var registry = Registry.fromConnectionString(connectionString);

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

registry.getTwin(deviceId, async (err, twin) => {
  if (err) {
    console.error(err.message);
  } else {
    console.log('Got device twin');

    sendDesiredProperties(twin,twinPatchReset);
    await sleep(5000);
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
    await sleep(5000);
    sendDesiredProperties(twin,twinPatchReset);
  }
});