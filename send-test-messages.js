require("dotenv").config();
const { EventHubProducerClient } = require("@azure/event-hubs");

const EVENT_HUB_CONNECTION_STRING =
  process.env.EVENT_HUB_CONNECTION_STRING ||
  "Endpoint=sb://your-namespace.servicebus.windows.net/;SharedAccessKeyName=RootManageSharedAccessKey;SharedAccessKey=your-key";
const EVENT_HUB_NAME = process.env.EVENT_HUB_NAME || "your-event-hub-name";
const NUM_MESSAGES = parseInt(process.env.NUM_MESSAGES || "20", 10);

async function sendTestMessages() {
  const producer = new EventHubProducerClient(
    EVENT_HUB_CONNECTION_STRING,
    EVENT_HUB_NAME
  );

  try {
    console.log(`\n📤 Sending ${NUM_MESSAGES} test messages to Event Hub`);
    console.log(`   Event Hub: ${EVENT_HUB_NAME}\n`);

    const messages = [];
    for (let i = 1; i <= NUM_MESSAGES; i++) {
      messages.push({
        body: `Test message ${i} - ${new Date().toISOString()}`,
        properties: {
          messageId: i,
          timestamp: new Date().toISOString(),
        },
      });
    }

    await producer.sendBatch(messages);

    console.log(`✓ Successfully sent ${NUM_MESSAGES} messages!\n`);
  } catch (error) {
    console.error("Failed to send messages:", error.message);
  } finally {
    await producer.close();
  }
}

sendTestMessages().catch(console.error);
