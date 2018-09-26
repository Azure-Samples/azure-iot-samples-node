# Notes

## Pre-requisite ##
- **Node.js version: 6.x or higher.** 
- We would **still encourage you** to install the latest available LTS version at any given time from https://nodejs.org. **It is a good practice to always install the latest available LTS version of node.js.**
- Installing node.js on **Windows or macOS** is very simple with available installers on the [node.js website](https://nodejs.org). If you are using a **linux based OS**, then you can find easy to follow, one step installation instructions over [here](https://nodejs.org/en/download/package-manager/).

This example uses the [Node.js SDK for Azure Event hubs](https://github.com/Azure/azure-event-hubs-node) to read from your IoT hub's Event Hub-compatible endpoint.

Typically, you connect another service to this endpoint to process and deliver the telemetry to its ultimate destination. For example, you can connect the following services to this Events endpoint on IoT Hub:

- Azure Stream Analytics
- Logic Apps
- Azure Databricks
- Spark on HDInsight