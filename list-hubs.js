require("dotenv").config();
const { ManagementClient } = require("@azure/service-bus");

const EVENT_HUB_CONNECTION_STRING = process.env.EVENT_HUB_CONNECTION_STRING;

async function listEventHubs() {
  console.log("\n📋 Available Event Hubs\n");

  if (!EVENT_HUB_CONNECTION_STRING) {
    console.error("❌ EVENT_HUB_CONNECTION_STRING not set in .env\n");
    process.exit(1);
  }

  try {
    // Extract namespace from connection string
    const match = EVENT_HUB_CONNECTION_STRING.match(/Endpoint=sb:\/\/([^.]+)/);
    if (match) {
      const namespace = match[1];
      console.log(`Namespace: ${namespace}\n`);
    }

    // Use a simple HTTP request to list hubs
    const connectionStringParts = EVENT_HUB_CONNECTION_STRING.split(";");
    const endpoint = connectionStringParts[0].replace("Endpoint=", "");
    const keyName = connectionStringParts[1].split("=")[1];
    const key = connectionStringParts[2].split("=")[1];

    console.log("Note: To list event hubs, you need to use Azure CLI or Portal.\n");
    console.log("Azure CLI command:");
    console.log("  az eventhubs eventhub list --resource-group <YOUR_RESOURCE_GROUP> --namespace-name kpehubebssdevuws2ebs2\n");
    console.log("Or check Azure Portal -> Service Bus Namespace -> Event Hubs\n");

  } catch (error) {
    console.error("Error:", error.message);
  }
}

listEventHubs();
