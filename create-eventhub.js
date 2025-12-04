require("dotenv").config();
const { EventHubConsumerClient } = require("@azure/event-hubs");
const { ServiceBusAdministrationClient } = require("@azure/service-bus");

const CONNECTION_STRING = process.env.EVENT_HUB_CONNECTION_STRING;
const NAMESPACE = CONNECTION_STRING?.match(/Endpoint=sb:\/\/([^.]+)/)?.[1];
const HUB_NAME = process.argv[2];

async function checkAndCreateEventHub() {
  if (!CONNECTION_STRING) {
    console.error("❌ EVENT_HUB_CONNECTION_STRING not set in .env\n");
    process.exit(1);
  }

  if (!HUB_NAME) {
    console.log("Usage: node create-eventhub.js <event-hub-name>");
    console.log("Example: node create-eventhub.js my-event-hub\n");
    process.exit(1);
  }

  console.log(`\n📋 Event Hub Creation Tool`);
  console.log(`   Namespace: ${NAMESPACE}`);
  console.log(`   Hub Name: ${HUB_NAME}\n`);

  try {
    const adminClient = new ServiceBusAdministrationClient(CONNECTION_STRING);

    // Check if hub exists
    console.log(`Checking if event hub "${HUB_NAME}" exists...`);
    const exists = await adminClient.queueExists(HUB_NAME).catch(() => false);

    if (exists) {
      console.log(`✓ Event Hub "${HUB_NAME}" already exists!\n`);
      
      // Verify with consumer client
      const consumerClient = new EventHubConsumerClient(
        "$Default",
        CONNECTION_STRING,
        HUB_NAME
      );
      
      const partitionIds = await consumerClient.getPartitionIds();
      console.log(`   Partitions: ${partitionIds.join(", ")}`);
      await consumerClient.close();
      
      // Update .env
      updateEnvFile(HUB_NAME);
      return;
    }

    // Create the hub
    console.log(`Creating event hub "${HUB_NAME}"...`);
    
    // Note: ServiceBusAdministrationClient doesn't directly support EventHub creation
    // We need to use the management API or Azure CLI
    console.log(`\n⚠️  To create an Event Hub, use Azure CLI:\n`);
    console.log(`az eventhubs eventhub create \\`);
    console.log(`  --resource-group <YOUR_RESOURCE_GROUP> \\`);
    console.log(`  --namespace-name ${NAMESPACE} \\`);
    console.log(`  --name ${HUB_NAME} \\`);
    console.log(`  --partition-count 2`);
    console.log(`\nOr use Azure Portal:\n`);
    console.log(`1. Go to Service Bus Namespace: ${NAMESPACE}`);
    console.log(`2. Click "Event Hubs" in left menu`);
    console.log(`3. Click "+ Event Hub"`);
    console.log(`4. Enter name: ${HUB_NAME}`);
    console.log(`5. Set partition count (recommend: 2)`);
    console.log(`6. Click Create\n`);

    console.log(`After creating the hub, run this to verify:\n`);
    console.log(`   node diagnose.js\n`);

  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

function updateEnvFile(hubName) {
  const fs = require("fs");
  const path = require("path");
  const envPath = path.join(__dirname, ".env");
  
  try {
    let content = fs.readFileSync(envPath, "utf8");
    // Replace the hub name line
    content = content.replace(
      /EVENT_HUB_NAME=.*/,
      `EVENT_HUB_NAME=${hubName}`
    );
    fs.writeFileSync(envPath, content);
    console.log(`\n✓ Updated .env file with EVENT_HUB_NAME=${hubName}\n`);
  } catch (error) {
    console.error("Could not update .env file:", error.message);
  }
}

checkAndCreateEventHub().catch(console.error);
