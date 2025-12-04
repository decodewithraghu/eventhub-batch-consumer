require("dotenv").config();
const { EventHubConsumerClient } = require("@azure/event-hubs");

const EVENT_HUB_CONNECTION_STRING =
  process.env.EVENT_HUB_CONNECTION_STRING ||
  "Endpoint=sb://your-namespace.servicebus.windows.net/;SharedAccessKeyName=RootManageSharedAccessKey;SharedAccessKey=your-key";
const EVENT_HUB_NAME = process.env.EVENT_HUB_NAME || "your-event-hub-name";
const BATCH_SIZE = parseInt(process.env.BATCH_SIZE || "5", 10);
const PROCESSING_DELAY = parseInt(process.env.PROCESSING_DELAY || "500", 10); // milliseconds

// Message buffers by partition
const messageBuffers = {};
const messageCounts = {};
const processingFlags = {}; // Track if a partition is currently processing

// Helper function to simulate long-running process with delay
async function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function processBatch(partitionId) {
  const buffer = messageBuffers[partitionId];
  if (!buffer || buffer.length === 0) return;

  // Mark partition as processing
  processingFlags[partitionId] = true;

  console.log(`\n${"=".repeat(70)}`);
  console.log(`⏳ PROCESSING BATCH - Partition ${partitionId}`);
  console.log(`${"=".repeat(70)}`);
  console.log(`Batch Size: ${buffer.length} messages`);
  console.log(`Total Messages Processed (Partition): ${messageCounts[partitionId]}`);
  console.log(`Batch Number: ${Math.ceil(messageCounts[partitionId] / BATCH_SIZE)}`);
  console.log(`Processing Delay: ${PROCESSING_DELAY}ms (simulating long-running task)\n`);

  // Display messages in batch
  buffer.forEach((msg, index) => {
    console.log(
      `  [${index + 1}] Offset: ${msg.offset} | Seq: ${msg.sequenceNumber} | Body: ${msg.body}`
    );
  });

  console.log(`\n⏳ Processing in progress...`);
  
  // Simulate long-running process (e.g., database insert, API call, etc.)
  await delay(PROCESSING_DELAY);

  // Processing complete
  console.log(`✅ Batch processing completed!`);
  console.log(`${"=".repeat(70)}\n`);

  // Clear the buffer after processing
  messageBuffers[partitionId] = [];
  
  // Mark partition as done processing
  processingFlags[partitionId] = false;
}

async function consumeMessages() {
  const client = new EventHubConsumerClient(
    "$Default",
    EVENT_HUB_CONNECTION_STRING,
    EVENT_HUB_NAME
  );

  try {
    console.log(`\n📍 Event Hub Consumer Started`);
    console.log(`   Event Hub: ${EVENT_HUB_NAME}`);
    console.log(`   Batch Size: ${BATCH_SIZE} messages per partition`);
    console.log(`   Processing Delay: ${PROCESSING_DELAY}ms (long-running task simulation)`);
    console.log(`   Listening for incoming messages...\n`);

    // Get partition IDs
    const partitionIds = await client.getPartitionIds();
    console.log(`   Available Partitions: ${partitionIds.join(", ")}\n`);

    // Subscribe to all partitions
    const subscription = await client.subscribe({
      // Handler for events (array of messages)
      processEvents: async (events, context) => {
        const partitionId = context.partitionId;

        // Initialize partition buffer if needed
        if (!messageBuffers[partitionId]) {
          messageBuffers[partitionId] = [];
          messageCounts[partitionId] = 0;
          processingFlags[partitionId] = false;
        }

        console.log(
          `✓ Received ${events.length} event(s) from partition ${partitionId}`
        );

        for (const message of events) {
          messageCounts[partitionId]++;
          messageBuffers[partitionId].push(message);

          console.log(
            `  → Event #${messageCounts[partitionId]} | Offset: ${message.offset} | Body: ${message.body}`
          );

          // Check if we've reached the batch size
          if (messageBuffers[partitionId].length >= BATCH_SIZE) {
            // Wait for current batch to finish processing before accepting new messages
            while (processingFlags[partitionId]) {
              await delay(10); // Check every 10ms if previous batch is done
            }
            await processBatch(partitionId);
          }
        }
      },

      // Handler for errors
      processError: async (error, context) => {
        console.error(
          `❌ Error in partition ${context.partitionId}:`,
          error.message
        );
      },
    });

    // Keep the consumer running
    console.log("Consumer is running. Press Ctrl+C to exit.\n");
    await new Promise(() => {
      // This will run indefinitely
    });
  } catch (error) {
    console.error("Failed to consume messages:", error.message);
  } finally {
    await client.close();
  }
}

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n\n🛑 Shutting down consumer...");
  process.exit(0);
});

// Start the consumer
consumeMessages().catch(console.error);
