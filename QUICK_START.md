# Quick Start Guide

## Current Status ✅

Your Event Hub is already configured and working!

- **Namespace**: kpehubnsgcpqauws2et01
- **Event Hub Name**: nsgcpeventhub
- **Partitions**: 4 (0, 1, 2, 3)
- **Status**: ✅ Connected and accessible

## Simple Commands

### 1. Check Configuration (Verify Everything Works)
```bash
npm run check
```
This will verify that your Event Hub is accessible and show available partitions.

### 2. Run the Consumer (Start Listening for Messages)
```bash
npm start
```
The consumer will listen on all partitions and process messages in batches.

**Output shows:**
- Messages received per partition
- Batch processing when the batch size is reached
- Message details (offset, sequence number, body)

### 3. Send Test Messages (in another terminal)
```bash
npm run send
```
Sends 20 test messages to the Event Hub that the consumer will receive and process.

### 4. Diagnose Configuration (Detailed Check)
```bash
npm run diagnose
```
Shows detailed partition properties and connection information.

## Batch Size Configuration

Edit `.env` to change how many messages are processed together:

```env
BATCH_SIZE=2    # Process 2 messages at a time
BATCH_SIZE=5    # Process 5 messages at a time
BATCH_SIZE=10   # Process 10 messages at a time
```

## Processing Delay Configuration

Edit `.env` to change the delay for each batch (simulates long-running tasks):

```env
PROCESSING_DELAY=500    # 500ms delay (default) - simulates DB insert, API call
PROCESSING_DELAY=1000   # 1 second delay - slower processing
PROCESSING_DELAY=100    # 100ms delay - faster processing
```

**Key**: Batches wait for the previous batch to complete before processing starts!

## Example Workflow

**Terminal 1 - Start the Consumer:**
```bash
npm start
```

**Terminal 2 - Send Test Messages:**
```bash
npm run send
```

**Terminal 1 Output (Consumer):**
```
✓ Received 2 event(s) from partition 0
  → Event #1 | Offset: 7488 | Body: Test message 1 - ...
  → Event #2 | Offset: 7680 | Body: Test message 2 - ...

=======================================================
⏳ PROCESSING BATCH - Partition 0
=======================================================
Batch Size: 2 messages
Total Messages Processed (Partition): 2
Batch Number: 1
Processing Delay: 500ms (simulating long-running task)

  [1] Offset: 7488 | Seq: 20 | Body: Test message 1
  [2] Offset: 7680 | Seq: 21 | Body: Test message 2

⏳ Processing in progress...
✅ Batch processing completed!
=======================================================

✓ Received 2 event(s) from partition 0
  → Event #3 | Offset: 7872 | Body: Test message 3 - ...
  → Event #4 | Offset: 8064 | Body: Test message 4 - ...

⏳ PROCESSING BATCH - Partition 0
...
```

**Notice**: Each batch waits 500ms before the next batch starts!


## File Structure

```
eventhub_example/
├── index.js                    # Main consumer
├── send-test-messages.js       # Test message sender
├── diagnose.js                 # Configuration verifier
├── check-or-create-hub.js      # Hub existence checker
├── .env                        # Configuration
├── package.json                # Dependencies
├── README.md                   # Full documentation
├── QUICK_START.md              # This file
└── SETUP_INSTRUCTIONS.md       # Setup guide
```

## Available npm Scripts

```bash
npm start           # Run the consumer
npm run dev         # Run consumer with watch mode
npm run send        # Send 20 test messages
npm run diagnose    # Check configuration details
npm run check       # Verify Event Hub exists & is accessible
```

## Key Features Demonstrated

✅ **Batch Processing**: Read a specific number of messages at a time
✅ **Per-Partition Tracking**: Each partition has its own message buffer
✅ **Configuration Verification**: Tools to check and create Event Hubs
✅ **Test Message Sender**: Generate test data to demonstrate functionality
✅ **Detailed Logging**: See exactly what's happening in real-time

## Troubleshooting

### Consumer won't start?
```bash
npm run diagnose
```

### Event Hub doesn't exist?
```bash
npm run check
```
This will provide Azure CLI/Portal instructions to create it.

### Want to change batch size?
Edit `.env` and change `BATCH_SIZE=2` (or whatever number you want)

---

**That's it!** You now have a working Event Hub batch consumer. 🎉
