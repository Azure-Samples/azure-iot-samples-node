# Samples for the Azure IoT service SDK for Node.js

This folder contains simple samples showing how to use the various features of the Microsoft Azure IoT Hub service from a device running C code.

## List of samples

* Device/Module Identities and the registry (in the `registry` folder)
   * **registry_sample.js**: Manage the device ID registry of IoT Hub.
   * **registry_bulk_sample.js**: Create a set of device IDs in the device ID registry of IoT Hub in bulk.
   * **create_device_with_cert.js**: Create a new device ID using an X-509 certificate.
   * **twin.js**: Interact with the Device Twins from a back-end app.
   * **twin_query.js**: Interact with the Device Twins using queries from a back-end app.

* Cloud-to-Device interactions (messages, methods, notifications...) (in the `service_client` folder)
   * **send_c2d_message.js** : Send C2D messages to a device through IoT Hub.
   * **invoke_method.js**: Invoke a C2D Direct Method on a device through IoT Hub.
   * **receive_file_notifications.js**: Track the progress of the file "upload to blob" by devices.

* Jobs samples:
   * **job_query.js**: Use the jobs query feature of the service SDK.
   * **schedule_job.js**: Schedule device management jobs.


## How to run the samples

In order to run the device samples you will first need the following prerequisites:
* Node.js v6.x.x or above on your target device. (Check out [Nodejs.org](https://nodejs.org/) for more info)
* [Create an Azure IoT Hub instance][lnk-setup-iot-hub]

Then, download the `package.json` file and the `sample.js` file that you want to run:

Finally, in order to run the samples:

1. Store your IoT Hub connection string in the `IOTHUB_CONNECTION_STRING` environment variable.
  - on Linux/MacOS (don't forget the double-quotes around the connection string)
  ```sh
  $ export IOTHUB_CONNECTION_STRING="<connection_string>"
  ```
  - or on Windows (no quotes needed here unless using powershell)

  ```sh
  > set IOTHUB_CONNECTION_STRING=<connection_string>
  ```
2. Install the dependencies for the samples
```sh
$ npm install
```
3. Run the sample itself
```sh
$ node <sample_name.js>
```

## Using the SDK with Promises rather than callbacks
If you'd like to see how to "convert" this samples to promises instead of using callbacks, please refer to [this page][promises] of the wiki!

## Read More
For more information on how to use this library refer to the documents below:
- [Setup IoT Hub][lnk-setup-iot-hub]
- [Node API reference][node-api-reference]

[lnk-setup-iot-hub]: https://aka.ms/howtocreateazureiothub
[remote-monitoring-pcs]: https://docs.microsoft.com/en-us/azure/iot-suite/iot-suite-remote-monitoring-sample-walkthrough
[node-api-reference]: https://docs.microsoft.com/en-us/javascript/api/azure-iothub/
[promises]: https://github.com/Azure/azure-iot-sdk-node/wiki/Promises
