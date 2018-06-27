# Samples for the Azure IoT Device SDK for Node.js

This folder contains simple samples showing how to use the various features of the Microsoft Azure IoT Hub service from a module running JavaScript code.

## List of samples
- **twin_updates.js**: Shows how to use the Twin APIs with modules.
- **receive_method.js**: Shows how to receive a method request from an Azure IoT hub or Azure IoT Edge hub. This method request can be sent either from another module or from a service connected to your Azure IoT hub.
- **invoke_method.js**: Shows how to invoke a method on another module or a downstream device connected to the same Azure IoT Edge hub (this feature is only available when running the module connected to an Edge hub)
- **edge_input_output.js**: Shows how to make use of the routing feature of Azure IoT Edge Hub by sending messages to specific outputs and receiving from specific inputs. (this feature is only available when running the module connected to an Edge hub)

## How to run the samples

In order to run the device samples you will first need the following prerequisites:
* Node.js v6.x.x or above on your target device. (Check out [Nodejs.org](https://nodejs.org/) for more info)
* [Create an Azure IoT Hub instance][lnk-setup-iot-hub]
* [Create a device identity for your device][lnk-manage-iot-hub]

Then, download the `package.json` file and the `sample.js` file that you want to run:


Finally, in order to run the samples:

1. Store your newly-created device identity connection string in the `DEVICE_CONNECTION_STRING` environment variable. All samples rely on it to use the proper credentials.
  - on Linux/MacOS (don't forget the double-quotes around the connection string)
  ```sh
  $ export DEVICE_CONNECTION_STRING="<connection_string>"
  ```
  - or on Windows (no quotes needed here unless using powershell)

  ```sh
  > set DEVICE_CONNECTION_STRING=<connection_string>
  ```
2. Install the dependencies for the samples
```sh
$ npm install
```
3. Run the sample itself
```sh
$ node <sample_name.js>
```

## Read More
For more information on how to use this library refer to the documents below:
- [Setup IoT Hub][lnk-setup-iot-hub]
- [Provision devices][lnk-manage-iot-hub]
- [Node API reference][node-api-reference]

[lnk-setup-iot-hub]: https://aka.ms/howtocreateazureiothub
[lnk-manage-iot-hub]: https://aka.ms/manageiothub
[node-api-reference]: https://docs.microsoft.com/en-us/javascript/api/azure-iot-device/
