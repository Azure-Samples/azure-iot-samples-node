/*
* IoT Hub Raspberry Pi NodeJS - Microsoft Sample Code - Copyright (c) 2017 - Licensed MIT
*/
'use strict';


const fs = require('fs');
const path = require('path');

const wpi = require('node-wiring-pi');

const Client = require('azure-iot-device').Client;
const ConnectionString = require('azure-iot-device').ConnectionString;
const Message = require('azure-iot-device').Message;
const MqttProtocol = require('azure-iot-device-mqtt').Mqtt;
const AmqpProtocol = require('azure-iot-device-amqp').Amqp;

const bi = require('az-iot-bi');

const MessageProcessor = require('./messageProcessor.js');

var isMessageSendOn = true;
var messageId = 0;
var client, config, messageProcessor;

function sendMessage() {
  if (!isMessageSendOn) { return; }

  messageId++;

  messageProcessor.getMessage(messageId, (content, temperatureAlert) => {
    var message = new Message(content.toString('utf-8'));
    message.contentEncoding = 'utf-8';
    message.contentType = 'application/json';
    message.properties.add('temperatureAlert', temperatureAlert ? 'true' : 'false');

    console.log('[Device] Sending message: ' + content);

    client.sendEvent(message, (err) => {
      if (err) {
        console.error('[Device] Failed to send message to Azure IoT Hub due to:\n\t' + err.message);
      } else {
        blinkLED();
        console.log('[Device] Message sent to Azure IoT Hub');
      }

      setTimeout(sendMessage, config.interval);
    });
  });
}

function onStart(request, response) {
  console.log('[Device] Trying to invoke method start(' + request.payload || '' + ')');

  isMessageSendOn = true;

  response.send(200, 'Successully start sending message to cloud', function (err) {
    if (err) {
      console.error('[IoT Hub Client] Failed sending a start method response due to:\n\t' + err.message);
    }
  });
}

function onStop(request, response) {
  console.log('[Device] Trying to invoke method stop(' + request.payload || '' + ')');

  isMessageSendOn = false;

  response.send(200, 'Successully stop sending message to cloud', function (err) {
    if (err) {
      console.error('[IoT Hub Client] Failed sending a stop method response due to:\n\t' + err.message);
    }
  });
}

function receiveMessageCallback(msg) {
  blinkLED();

  var message = msg.getData().toString('utf-8');

  client.complete(msg, () => {
    console.log('Received message:\n\t' + message);
  });
}

function blinkLED() {
  // Light up LED for 500 ms
  wpi.digitalWrite(config.LEDPin, 1);
  setTimeout(function () {
    wpi.digitalWrite(config.LEDPin, 0);
  }, 500);
}

function initClient(connectionStringParam, credentialPath) {
  var connectionString = ConnectionString.parse(connectionStringParam);
  var deviceId = connectionString.DeviceId;

  // select transport
  if (config.transport === "amqp") {
    console.log('[Device] Using AMQP transport protocol');
    // fromConnectionString must specify a transport constructor, coming from any transport package.
    client = Client.fromConnectionString(connectionStringParam, AmqpProtocol);
  } else {
    console.log('[Device] Using MQTT transport protocol');
    client = Client.fromConnectionString(connectionStringParam, MqttProtocol);
  }

  // Configure the client to use X509 authentication if required by the connection string.
  if (connectionString.x509) {
    // Read X.509 certificate and private key.
    // These files should be in the current folder and use the following naming convention:
    // [device name]-cert.pem and [device name]-key.pem, example: myraspberrypi-cert.pem
    var connectionOptions = {
      cert: fs.readFileSync(path.join(credentialPath, deviceId + '-cert.pem')).toString(),
      key: fs.readFileSync(path.join(credentialPath, deviceId + '-key.pem')).toString()
    };

    client.setOptions(connectionOptions);

    console.log('[Device] Using X.509 client certificate authentication');
  }

  if (connectionString.GatewayHostName && config.iotEdgeRootCertFilePath) {
    var deviceClientOptions = {
      sa: fs.readFileSync(config.iotEdgeRootCertFilePath, 'utf-8'),
    }

    client.setOptions(deviceClientOptions, function(err) {
      if (err) {
        console.error('[Device] error specifying IoT Edge root certificate: ' + err);
      }
    });

    console.log('[Device] Using IoT Edge private root certificate');
  }

  return client;
}

(function (connectionString) {
  // read in configuration in config.json
  try {
    config = require('./config.json');
  } catch (err) {
    console.error('Failed to load config.json:\n\t' + err.message);
    return;
  }

  // set up wiring
  wpi.setup('wpi');
  wpi.pinMode(config.LEDPin, wpi.OUTPUT);
  messageProcessor = new MessageProcessor(config);

  try {
    var firstTimeSetting = false;
    if (!fs.existsSync(path.join(process.env.HOME, '.iot-hub-getting-started/biSettings.json'))) {
      firstTimeSetting = true;
    }

    bi.start();

    var deviceInfo = { device: "RaspberryPi", language: "NodeJS" };

    if (bi.isBIEnabled()) {
      bi.trackEventWithoutInternalProperties('yes', deviceInfo);
      bi.trackEvent('success', deviceInfo);
    } else {
      bi.disableRecordingClientIP();
      bi.trackEventWithoutInternalProperties('no', deviceInfo);
    }

    if (firstTimeSetting) {
      console.log("Telemetry setting will be remembered. If you would like to reset, please delete following file and run the sample again");
      console.log("~/.iot-hub-getting-started/biSettings.json\n");
    }

    bi.flush();
  } catch (e) {
    //ignore
  }

  // create a client
  // read out the connectionString from process environment
  connectionString = connectionString || process.env['AzureIoTHubDeviceConnectionString'];
  client = initClient(connectionString, config);

  client.open((err) => {
    if (err) {
      console.error('[IoT Hub Client] Connect error:\n\t' + err.message);
      return;
    }

    // set C2D and device method callback
    client.onDeviceMethod('start', onStart);
    client.onDeviceMethod('stop', onStop);
    client.on('message', receiveMessageCallback);
    setInterval(() => {
      client.getTwin((err, twin) => {
        if (err) {
          console.error('[IoT Hub Client] Got twin message error:\n\t' + err.message);
          return;
        }
        config.interval = twin.properties.desired.interval || config.interval;
      });
    }, config.interval);
    sendMessage();
  });
})(process.argv[2]);
