---
page_type: sample
description: "Get familiar with Azure IoT using the Microsoft IoT Pack for Raspberry Pi 3 Starter Kit."
languages:
- javascript
products:
- azure
- azure-iot-hub
---
# IoT Hub Raspberry Pi 3 Client application

[![Build Status](https://travis-ci.com/Azure-Samples/iot-hub-node-raspberrypi-client-app.svg?token=5ZpmkzKtuWLEXMPjmJ6P&branch=master)](https://travis-ci.com/Azure-Samples/iot-hub-node-raspberrypi-client-app)

> This repo contains the source code to help you get familiar with Azure IoT using the Microsoft IoT Pack for Raspberry Pi 3 Starter Kit. You will find the [lesson-based tutorials on Azure.com](https://docs.microsoft.com/en-us/azure/iot-hub/iot-hub-raspberry-pi-kit-node-get-started).

This repo contains an arduino application that runs on Raspberry Pi 3 with a BME280 temperature&humidity sensor, and then sends these data to your IoT Hub. Also, this application receives Cloud-to-Device message from your IoT Hub, and takes actions according to the C2D command.

## Set up your Pi

### Enable SSH on your Pi

Follow [this page](https://www.raspberrypi.org/documentation/remote-access/ssh/) to enable SSH on your Pi.

### Enable I2C on your Pi

Follow [this page](https://learn.adafruit.com/adafruits-raspberry-pi-lesson-4-gpio-setup/configuring-i2c#installing-kernel-support-manually) to enable I2C on your Pi

### Install new nodejs new version

Check your nodejs version on your Pi:

```bash
node -v
```

If your nodejs' version is below v4.x, please follow the instruction to install a new version of nodejs

```bash
curl -sL http://deb.nodesource.com/setup_4.x | sudo -E bash
sudo apt-get -y install nodejs
```

## Connect your sensor with your Pi

### Connect with a physical BEM280 sensor and LED

You can follow the image to connect your BME280 and a LED with your Raspberry Pi 3.

![BME280](https://docs.microsoft.com/en-us/azure/iot-hub/media/iot-hub-raspberry-pi-kit-node-get-started/3_raspberry-pi-sensor-connection.png)

### DON'T HAVE A PHYSICAL BME280?

You can use the application to simulate temperature and humidity data and send to your IoT Hub.

1. Open the `config.json` file.
1. Change the `simulatedData` value from `false` to `true`.

## Running this sample

### Install package

Install all packages by the following command:

```bash
npm install
```

### Run the client application

Run the client application with root priviledge, and you also need provide your Azure IoT Hub device connection string, note your connection should be quoted in the command.

```bash
sudo node index.js '<your Azure IoT hub device connection string>'
```

### Send Cloud-to-Device command

You can send a C2D message to your device. You can see the device prints out the message and blinks once receiving the message.

### Send Device Method command

You can send `start` or `stop` device method command to your Pi to start/stop sending message to your IoT Hub.

### Run the client using the AMQP transport

By default, the app will use MQTT. If you wish to use AMQP:

1. Open the `config.json` file.
1. Change the `transport` value from `mqtt` to `amqp`.

### Connect the client to an IoT Edge gateway

If you have an IoT Edge gateway and wish to use it, you'll need to modify the connection string to include the GatewayHostName.

If that gateway uses non-production certificates, this client will need to be configured to use the root cert. Instructions can be found [here](https://docs.microsoft.com/en-us/azure/iot-edge/how-to-create-transparent-gateway). After the root cert is installed and trusted on the Pi:

1. Open the `config.json` file.
1. Change the `iotEdgeRootCertFilePath` value specify the full path to the certificate.

## Troubleshooting

### writeByte error

If you've run, stopped, and re-run the app and see an error like `{ Error: , Remote I/O error errno: 121, code: '', syscall: 'writeByte' }` the BME 280 chip may be in a bad state. Try removing and reinserting the power wire (or the BME 280 chip, if you are unsure). Then try rerunning the app again.

### LED not lighting

Make sure the longer of the two pins is connected to the positive terminal.
