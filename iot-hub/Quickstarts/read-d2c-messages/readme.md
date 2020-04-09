# Notes

This sample demonstrates how to use the Microsoft Azure Event Hubs Client for JavaScript to 
read messages sent from a device by using the built-in event hubs that exists by default for
every Iot Hub instance. 

If you have access to the Event Hubs-compatible endpoint, either via the Azure portal or
by using the Azure CLI, you can skip the parts in this sample that converts the Iot Hub
connection string to an Event Hubs compatible one.

The conversion is done by connecting to the IoT hub endpoint and receiving a redirection
address to the built-in event hubs. This address is then used in the Event Hubs Client to
read messages.

For an example that uses checkpointing, follow up this sample with the [sample that uses
Azure Storage Blob to create checkpoints](https://github.com/Azure/azure-sdk-for-js/blob/master/sdk/eventhub/eventhubs-checkpointstore-blob/samples/javascript/receiveEventsUsingCheckpointStore.js) in the 
eventhubs-checkpointstore-blob package on GitHub at the following link:



