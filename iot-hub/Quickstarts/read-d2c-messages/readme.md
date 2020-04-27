# Notes

This sample demonstrates how to use the Microsoft Azure Event Hubs Client for JavaScript to 
read messages sent from a device by using the built-in event hubs that exists by default for
every Iot Hub instance. 

## Get Event Hubs-compatible connection string

You can get the Event Hubs-compatible connection string to your IotHub instance via the Azure portal or
by using the Azure CLI.

If using the Azure portal, see [Built in endpoints for IotHub](https://docs.microsoft.com/en-us/azure/iot-hub/iot-hub-devguide-messages-read-builtin#read-from-the-built-in-endpoint) to get the Event Hubs-compatible
connection string and assign it to the constant `connectionString` in the sample. You can skip the Azure CLI
instructions in the sample after this.

If using the Azure CLI, you will need to run the below before running this sample to get 
the details required to form the Event Hubs compatible connection string

- `az iot hub show --query properties.eventHubEndpoints.events.endpoint --name {your IoT Hub name}`
- `az iot hub show --query properties.eventHubEndpoints.events.path --name {your IoT Hub name}`
- `az iot hub policy show --name service --query primaryKey --hub-name {your IoT Hub name}`

If you can do neither of the above and need to programatically get this information,
then use the [sample to convert IotHub connection string to an Event Hubs-compatible one](https://github.com/Azure/azure-sdk-for-js/blob/master/sdk/eventhub/event-hubs/samples/javascript/iothubConnectionString.js). This conversion is done by connecting to 
the IoT hub endpoint and receiving a redirection address to the built-in event hubs. This address is then used 
in the Event Hubs Client to read messages.

## Checkpointing

For an example that uses checkpointing, follow up this sample with the [sample that uses
Azure Storage Blob to create checkpoints](https://github.com/Azure/azure-sdk-for-js/blob/master/sdk/eventhub/eventhubs-checkpointstore-blob/samples/javascript/receiveEventsUsingCheckpointStore.js).

## WebSocket and proxy

If using WebSockets, then you need to bring in your own WebSocket implementation.

If your application runs in the browser, then you can get the WebSocket from `window.WebSocket`.
Otherwise, you can get an implementation from any of the popular packages like [ws](https://www.npmjs.com/package/ws).

If your application runs behind a proxy server, then you first need to create an agent with the relevant information.
```javascript
const HttpsProxyAgent = require("https-proxy-agent");
const proxyAgent = new HttpsProxyAgent(proxyInfo);
```

You can then pass the agent to the websocket options as shown in this sample.




