// Copyright (c) Microsoft Corporation.
// Licensed under the MIT Licence.

/*
  This sample demonstrates how to use the Microsoft Azure Event Hubs Client for JavaScript to 
  read messages sent from a device. 

  If you have access to the Event Hubs-compatible endpoint, either via the Azure portal or
  by using the Azure CLI, you can skip the parts in this sample that converts the Iot Hub
  connection string to an Event Hubs compatible one.

  The conversion is done by connecting to the IoT hub endpoint and receiving a redirection
  address to the built-in event hubs. This address is then used in the Event Hubs Client to
  read messages.

  For an example that uses checkpointing, follow up this sample with the sample in the 
  eventhubs-checkpointstore-blob package on GitHub at the following link:

  https://github.com/Azure/azure-sdk-for-js/blob/master/sdk/eventhub/eventhubs-checkpointstore-blob/samples/javascript/receiveEventsUsingCheckpointStore.js
*/

const crypto = require("crypto");
const Buffer = require("buffer").Buffer;
const { Connection, ReceiverEvents, isAmqpError, parseConnectionString } = require("rhea-promise");
const { EventHubConsumerClient } = require("@azure/event-hubs");

// This code is modified from https://docs.microsoft.com/en-us/azure/iot-hub/iot-hub-devguide-security#security-tokens.
function generateSasToken(resourceUri, signingKey, policyName, expiresInMins) {
  resourceUri = encodeURIComponent(resourceUri);

  const expiresInSeconds = Math.ceil(Date.now() / 1000 + expiresInMins * 60);
  const toSign = resourceUri + "\n" + expiresInSeconds;

  // Use the crypto module to create the hmac.
  const hmac = crypto.createHmac("sha256", Buffer.from(signingKey, "base64"));
  hmac.update(toSign);
  const base64UriEncoded = encodeURIComponent(hmac.digest("base64"));

  // Construct authorization string.
  return `SharedAccessSignature sr=${resourceUri}&sig=${base64UriEncoded}&se=${expiresInSeconds}&skn=${policyName}`;
}

/**
 * Converts an IotHub Connection string into an Event Hubs-compatible connection string.
 * @param {string} connectionString An IotHub connection string in the format:
 * `"HostName=<your-iot-hub>.azure-devices.net;SharedAccessKeyName=<KeyName>;SharedAccessKey=<Key>"`
 * @returns {Promise<string>} An Event Hubs-compatible connection string in the format:
 * `"Endpoint=sb://<hostname>;EntityPath=<your-iot-hub>;SharedAccessKeyName=<KeyName>;SharedAccessKey=<Key>"`
 */
async function convertIotHubToEventHubsConnectionString(connectionString) {
  const { HostName, SharedAccessKeyName, SharedAccessKey } = parseConnectionString(
    connectionString
  );

  // Verify that the required info is in the connection string.
  if (!HostName || !SharedAccessKey || !SharedAccessKeyName) {
    throw new Error(`Invalid IotHub connection string.`);
  }

  //Extract the IotHub name from the hostname.
  const [iotHubName] = HostName.split(".");

  if (!iotHubName) {
    throw new Error(`Unable to extract the IotHub name from the connection string.`);
  }

  // Generate a token to authenticate to the service.
  const token = generateSasToken(
    `${HostName}/messages/events`,
    SharedAccessKey,
    SharedAccessKeyName,
    5 // token expires in 5 minutes
  );
  const connectionOptions = {
    transport: "tls",
    host: HostName,
    hostname: HostName,
    username: `${SharedAccessKeyName}@sas.root.${iotHubName}`,
    port: 5671,
    reconnect: false,
    password: token,
  };

  const connection = new Connection(connectionOptions);
  await connection.open();

  // Create the receiver that will trigger a redirect error.
  const receiver = await connection.createReceiver({
    source: { address: `amqps://${HostName}/messages/events/$management` },
  });

  return new Promise((resolve, reject) => {
    receiver.on(ReceiverEvents.receiverError, (context) => {
      const error = context.receiver && context.receiver.error;
      if (isAmqpError(error) && error.condition === "amqp:link:redirect") {
        const hostname = error.info && error.info.hostname;
        if (!hostname) {
          reject(error);
        } else {
          resolve(
            `Endpoint=sb://${hostname}/;EntityPath=${iotHubName};SharedAccessKeyName=${SharedAccessKeyName};SharedAccessKey=${SharedAccessKey}`
          );
        }
      } else {
        reject(error);
      }
      connection.close().catch(() => {
        /* ignore error */
      });
    });
  });
}

var printError = function (err) {
  console.log(err.message);
};

// Display the message content - telemetry and properties.
// - Telemetry is sent in the message body
// - The device can add arbitrary properties to the message
// - IoT Hub adds system properties, such as Device Id, to the message.
var printMessages = function (messages) {
  for (const message of messages) {
    console.log("Telemetry received: ");
    console.log(JSON.stringify(message.body));
    console.log("Properties (set by device): ");
    console.log(JSON.stringify(message.properties));
    console.log("System properties (set by IoT Hub): ");
    console.log(JSON.stringify(message.systemProperties));
    console.log("");
  }
};

async function main() {
  console.log("IoT Hub Quickstarts - Read device to cloud messages.");

  const iotHubConnectionString = "{your Iot Hub connection string}";
  const iotHubName = "{your Iot Hub name}";

  // You can skip calling convertIotHubToEventHubsConnectionString() to do the conversion
  // if you already have access to the Event Hubs compatible connection string from the
  // Azure portal or the Azure CLI
  // az iot hub show --query properties.eventHubEndpoints.events.endpoint --name {your IoT Hub name}
  const eventHubsConnectionString = await convertIotHubToEventHubsConnectionString(
    iotHubConnectionString
  );

  const consumerClient = new EventHubConsumerClient(
    "Default",
    eventHubsConnectionString,
    iotHubName
  );
  consumerClient.subscribe({
    processEvents: printMessages,
    processError: printError,
  });
}

main().catch((error) => {
  console.error("Error running sample:", error);
});
