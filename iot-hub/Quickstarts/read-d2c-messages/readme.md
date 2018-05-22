# Notes

This example uses the [Node.js SDK for Azure Event hubs](https://github.com/Azure/azure-event-hubs-node) to read from your IoT hub's Event Hub-compatible endpoint.

Typically, you connect another service to this endpoint to process and deliver the telemetry to its ultimate destination. For example, you can connect the following services to this Events endpoint on IoT Hub:

- Azure Stream Analytics
- Logic Apps
- Azure Databricks
- Spark on HDInsight