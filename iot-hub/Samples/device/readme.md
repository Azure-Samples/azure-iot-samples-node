# Samples for the Azure IoT Device SDK for Node.js

This folder contains simple samples showing how to use the various features of the Microsoft Azure IoT Hub service from a device running JavaScript code.

## List of samples

* Device APIs:
   * **authentication_sas.js**: Shows how to connect to an Azure IoT hub using a SAS Token instead of a Connection String.
   * **authentication_x509.js**: Shows how to connect to an Azure IoT hub using an X509 certificate (and key).
   * **receive_c2d.js**: Shows howh to subscribe to Cloud-to-Device (C2D) messages coming from an Azure IoT hub and handle them on a device.
   * **receive_methods.js**: Shows howh to subscribe to method requests coming from an Azure IoT hub and handle them on a device.
   * **send_telemetry.js**: Connect to IoT Hub and send a telemetry message.
   * **send_telemetry_batch.js**: Connect to IoT Hub and send a batch of telemetry messages (supported only over HTTP for now).
   * **twin_updates.js**: Shows how to receive Twin desired properties updates, and send updates to reported properties to an Azure IoT hub.
   * **upload_to_blob.js**: Shows how to upload a file to a blob in Azure Storage using the file upload API of an Azure IoT hub.

* Module APIs:
*Module APIs samples are located in the `module` subfolder.*
  - **module/win_updates.js**: Shows how to use the Twin APIs with modules.
  - **module/receive_method.js**: Shows how to receive a method request from an Azure IoT hub or Azure IoT Edge hub. This method request can be sent either from another module or from a service connected to your Azure IoT hub.
  - **module/invoke_method.js**: Shows how to invoke a method on another module or a downstream device connected to the same Azure IoT Edge hub (this feature is only available when running the module connected to an Edge hub)
  - **module/edge_input_output.js**: Shows how to make use of the routing feature of Azure IoT Edge Hub by sending messages to specific outputs and receiving from specific inputs. (this feature is only available when running the module connected to an Edge hub)


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
