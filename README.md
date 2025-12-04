# Azure Event Hub Batch Consumer

This Node.js project demonstrates how to read messages from Azure Event Hub with controlled batch sizes.

## Features

- Connect to Azure Event Hub
- Read messages in controlled batches per partition (configurable batch size)
- Display batch statistics and message details
- Partition-aware message processing
- Diagnostic tool to verify configuration
- Test message sender for demonstrations

## Prerequisites

- Node.js (v14 or higher)
- Azure Event Hub connection string
- Azure Event Hub name

## Setup

1. Install dependencies:
```bash
npm install
```

2. Update the `.env` file with your Event Hub configuration:
```
EVENT_HUB_CONNECTION_STRING=your_connection_string_here
EVENT_HUB_NAME=your_event_hub_name
BATCH_SIZE=5
```

## Configuration

**Important:** The `EVENT_HUB_NAME` should be the **actual event hub name** within your namespace, NOT the namespace name itself.

For example:
- ❌ **Wrong**: `EVENT_HUB_NAME=kpehubebssdevuws2ebs2` (this is the namespace)
- ✅ **Correct**: `EVENT_HUB_NAME=my-event-hub` (this is the hub name)

Edit the `.env` file to configure:
- `EVENT_HUB_CONNECTION_STRING`: Your Event Hub connection string (from Azure Portal)
- `EVENT_HUB_NAME`: Your Event Hub name (find in Azure Portal -> Namespace -> Event Hubs)
- `BATCH_SIZE`: Number of messages to read at a time (default: 5)
- `PROCESSING_DELAY`: Delay in milliseconds to simulate long-running tasks (default: 500ms)

## Running the Consumer

```bash
# First, check if Event Hub exists (and create if needed)
npm run check

# Or manually verify configuration
npm run diagnose

# Run the consumer
npm start

# Or run with watch mode (auto-restart on file changes)
npm run dev

# To send test messages (in another terminal)
npm run send
```

## How It Works

1. Connects to Azure Event Hub using the connection string
2. Listens for messages on all partitions
3. Buffers messages per partition
4. Collects messages until batch size is reached
5. **Processes batch sequentially** with configurable delay (default 500ms)
6. **Waits for batch to complete** before accepting next batch
7. Logs batch information and message details for each partition

This ensures that if you have long-running operations (database inserts, API calls, etc.), batches are processed one at a time without overlapping.

## Example Output

```
📍 Event Hub Consumer Started
   Event Hub: my-event-hub
   Batch Size: 5 messages per partition
   Available Partitions: 0, 1

✓ Received 3 event(s) from partition 0
  → Event #1 | Offset: 100 | Body: Test message 1
  → Event #2 | Offset: 101 | Body: Test message 2
  → Event #3 | Offset: 102 | Body: Test message 3

============================================================
📦 BATCH PROCESSED - Partition 0
============================================================
Batch Size: 5 messages
Total Messages Processed (Partition): 5
Batch Number: 1

  [1] Offset: 100 | Seq: 1 | Body: Test message 1
  [2] Offset: 101 | Seq: 2 | Body: Test message 2
  [3] Offset: 102 | Seq: 3 | Body: Test message 3
  [4] Offset: 103 | Seq: 4 | Body: Test message 4
  [5] Offset: 104 | Seq: 5 | Body: Test message 5
============================================================
```

## Files

- `index.js` - Main consumer with batch processing by partition
- `send-test-messages.js` - Send test messages to Event Hub
- `diagnose.js` - Verify Event Hub configuration
- `check-or-create-hub.js` - Check if hub exists, with creation instructions
- `.env` - Configuration file (not committed to git)
- `package.json` - Dependencies and scripts

## Troubleshooting

### Error: "messaging entity ... could not be found"

This means the Event Hub name is incorrect or doesn't exist. 

### Error: Event Hub Does Not Exist

Use the interactive verification/creation tool:

```bash
npm run check
```

This will:
1. ✓ Check if the Event Hub exists
2. ✓ Verify connection and permissions
3. ✓ Show available partitions
4. ✓ Auto-update `.env` if valid
5. ✓ Provide step-by-step creation instructions if it doesn't exist

**Manual creation options are provided for:**
- Azure CLI
- Azure Portal
- PowerShell

### Partition Information

The consumer now tracks messages by partition. Each partition maintains its own message buffer and batch processing. When a partition reaches the configured batch size, those messages are processed together. This allows you to:

- Monitor message flow per partition
- Process each partition independently
- Scale batch processing across multiple partitions
