require("dotenv").config();
const { EventHubConsumerClient } = require("@azure/event-hubs");
const fs = require("fs");
const path = require("path");
const readline = require("readline");

const CONNECTION_STRING = process.env.EVENT_HUB_CONNECTION_STRING;
const NAMESPACE = CONNECTION_STRING?.match(/Endpoint=sb:\/\/([^.]+)/)?.[1];

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function checkAndCreateEventHub() {
  if (!CONNECTION_STRING) {
    console.error("❌ EVENT_HUB_CONNECTION_STRING not set in .env\n");
    process.exit(1);
  }

  console.log(`\n📋 Event Hub Verification & Creation Tool`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`   Namespace: ${NAMESPACE}\n`);

  const currentHubName = process.env.EVENT_HUB_NAME;
  console.log(`Current EVENT_HUB_NAME: ${currentHubName || "NOT SET"}\n`);

  let hubName = currentHubName;

  // If not set, ask user
  if (!hubName) {
    console.log("The EVENT_HUB_NAME is not configured in .env");
    hubName = await question(
      "\nEnter Event Hub name (or press Enter to use default): "
    );
    if (!hubName) {
      hubName = "my-event-hub";
    }
  }

  console.log(`\nChecking if event hub "${hubName}" exists...\n`);

  try {
    const consumerClient = new EventHubConsumerClient(
      "$Default",
      CONNECTION_STRING,
      hubName
    );

    // Try to get partition IDs
    const partitionIds = await consumerClient.getPartitionIds();

    console.log(`✅ SUCCESS! Event Hub "${hubName}" exists and is accessible!\n`);
    console.log(`   Partitions: ${partitionIds.join(", ")} (${partitionIds.length} total)`);

    // Update .env if needed
    if (hubName !== currentHubName) {
      updateEnvFile(hubName);
    }

    await consumerClient.close();
    rl.close();

    console.log("\n✓ You can now run: npm start\n");

  } catch (error) {
    console.error(`❌ Event Hub "${hubName}" not found or not accessible\n`);

    if (error.message.includes("not be found")) {
      console.log("💡 This Event Hub does not exist.\n");
      console.log("To create it, use one of these methods:\n");

      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("OPTION 1: Using Azure CLI\n");
      console.log(
        `az eventhubs eventhub create \\`
      );
      console.log(`  --resource-group <YOUR_RESOURCE_GROUP> \\`);
      console.log(`  --namespace-name ${NAMESPACE} \\`);
      console.log(`  --name ${hubName} \\`);
      console.log(`  --partition-count 2`);

      console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("OPTION 2: Using Azure Portal\n");
      console.log(`1. Go to Azure Portal: https://portal.azure.com`);
      console.log(`2. Search for "Service Bus Namespaces"`);
      console.log(`3. Click on namespace: ${NAMESPACE}`);
      console.log(`4. In the left menu, click "Event Hubs"`);
      console.log(`5. Click "+ Event Hub"`);
      console.log(`6. Enter name: ${hubName}`);
      console.log(`7. Set partition count to 2 (or more)`);
      console.log(`8. Click "Create"\n`);

      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("OPTION 3: Using PowerShell\n");
      console.log(
        `New-AzEventHubNamespace -ResourceGroupName <YOUR_RESOURCE_GROUP> \\`
      );
      console.log(`  -NamespaceName ${NAMESPACE} \\`);
      console.log(`  -Location eastus`);

      console.log(
        `\nNew-AzEventHub -ResourceGroupName <YOUR_RESOURCE_GROUP> \\`
      );
      console.log(`  -NamespaceName ${NAMESPACE} \\`);
      console.log(`  -EventHubName ${hubName} \\`);
      console.log(`  -PartitionCount 2\n`);

      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("After creating the hub, run this to verify:\n");
      console.log("  node check-or-create-hub.js\n");
    }

    rl.close();
    process.exit(1);
  }
}

function updateEnvFile(hubName) {
  const envPath = path.join(__dirname, ".env");

  try {
    let content = fs.readFileSync(envPath, "utf8");
    const newContent = content.replace(/EVENT_HUB_NAME=.*/, `EVENT_HUB_NAME=${hubName}`);
    fs.writeFileSync(envPath, newContent);
    console.log(`\n✓ Updated .env with EVENT_HUB_NAME=${hubName}`);
  } catch (error) {
    console.error("Could not update .env file:", error.message);
  }
}

checkAndCreateEventHub().catch(console.error);
