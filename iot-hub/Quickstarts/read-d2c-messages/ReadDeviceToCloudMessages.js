// Copyright (c) Microsoft Corporation.
// Licensed under the MIT Licence.

/*
  This sample demonstrates how to use the Microsoft Azure Event Hubs Client for JavaScript to 
  read messages sent from a device. Please see the documentation for @azure/event-hubs package
  for more details at https://www.npmjs.com/package/@azure/event-hubs

  For an example that uses checkpointing, follow up this sample with the sample in the 
  eventhubs-checkpointstore-blob package on GitHub at the following link:

  https://github.com/Azure/azure-sdk-for-js/blob/master/sdk/eventhub/eventhubs-checkpointstore-blob/samples/javascript/receiveEventsUsingCheckpointStore.js
*/

const { EventHubConsumerClient } = require("@azure/event-hubs");

// If using websockets, uncomment the below require statement
// const WebSocket = require("ws");

// If you need proxy support, uncomment the below code to create proxy agent
// const HttpsProxyAgent = require("https-proxy-agent");
// const proxyAgent = new HttpsProxyAgent(proxyInfo);

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

  // Event Hub-compatible endpoint
  // az iot hub show --query properties.eventHubEndpoints.events.endpoint --name {your IoT Hub name}
  const s_eventHubsCompatibleEndpoint = "{your Event Hubs compatible endpoint}";

  // Event Hub-compatible name
  // az iot hub show --query properties.eventHubEndpoints.events.path --name {your IoT Hub name}
  const s_eventHubsCompatiblePath = "{your Event Hubs compatible name}";

  // Primary key for the "service" policy to read messages
  // az iot hub policy show --name service --query primaryKey --hub-name {your IoT Hub name}
  const s_iotHubSasKey = "{your service primary key}";

  const connectionString = `Endpoint=${s_eventHubsCompatibleEndpoint}/;EntityPath=${s_eventHubsCompatiblePath};SharedAccessKeyName=service;SharedAccessKey=${s_iotHubSasKey}`;

  // If using websockets, uncomment the webSocketOptions below
  // If using proxy, then set `webSocketConstructorOptions` to
  // { agent: proxyAgent }
  // You can also use the `retryOptions` in the client options to configure the retry policy
  const clientOptions = {
    // webSocketOptions: {
    //   webSocket: WebSocket,
    //   webSocketConstructorOptions: {}
    // }
  };

  // Create the client to connect to the default consumer group of the Event Hub
  const consumerClient = new EventHubConsumerClient("$Default", connectionString, clientOptions);

  // Subscribe to messages from all partitions as below
  // To subscribe to messages from a single partition, use the overload of the same method.
  consumerClient.subscribe({
    processEvents: printMessages,
    processError: printError,
  });
}

main().catch((error) => {
  console.error("Error running sample:", error);
});
