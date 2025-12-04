require("dotenv").config();
const { EventHubConsumerClient } = require("@azure/event-hubs");

const EVENT_HUB_CONNECTION_STRING = process.env.EVENT_HUB_CONNECTION_STRING;
const EVENT_HUB_NAME = process.env.EVENT_HUB_NAME;

async function diagnose() {
  console.log("\n📋 Event Hub Diagnostics\n");
  console.log("Configuration:");
  console.log(`  Connection String: ${EVENT_HUB_CONNECTION_STRING ? "✓ Set" : "❌ Not set"}`);
  console.log(`  Event Hub Name: ${EVENT_HUB_NAME || "❌ Not set"}\n`);

  if (!EVENT_HUB_CONNECTION_STRING || !EVENT_HUB_NAME) {
    console.error("❌ Missing required environment variables!");
    console.error("Please update .env file with correct values.\n");
    process.exit(1);
  }

  try {
    console.log("Attempting to connect to Event Hub...");
    const client = new EventHubConsumerClient(
      "$Default",
      EVENT_HUB_CONNECTION_STRING,
      EVENT_HUB_NAME
    );

    console.log("✓ Connected successfully!\n");

    // Try to get partition IDs
    console.log("Retrieving partition information...");
    const partitionIds = await client.getPartitionIds();
    console.log(`✓ Found ${partitionIds.length} partition(s): ${partitionIds.join(", ")}\n`);

    // Get partition properties
    console.log("Partition Properties:");
    for (const partitionId of partitionIds) {
      const props = await client.getPartitionProperties(partitionId);
      console.log(`  Partition ${partitionId}:`);
      console.log(`    - Last Enqueued Sequence Number: ${props.lastEnqueuedSequenceNumber}`);
      console.log(`    - Last Enqueued Offset: ${props.lastEnqueuedOffset}`);
      console.log(`    - Is Empty: ${props.isEmpty}`);
    }

    await client.close();
    console.log("\n✓ All checks passed!");
  } catch (error) {
    console.error("\n❌ Connection failed:");
    console.error(`   Error: ${error.message}\n`);
    
    if (error.message.includes("not be found")) {
      console.log("💡 Hints:");
      console.log("  1. Verify that EVENT_HUB_NAME in .env is correct");
      console.log("  2. EVENT_HUB_NAME should be just the hub name, not the full connection string");
      console.log("  3. Check that the Event Hub exists in Azure");
      console.log("  4. Verify connection string has proper credentials\n");
    }
  }
}

diagnose().catch(console.error);
