# Feature Demonstration: Sequential Batch Processing with Delays

## What Was Implemented

Your Event Hub consumer now features:

✅ **500ms Processing Delay** - Simulates long-running operations  
✅ **Sequential Batch Processing** - Second batch waits for first to complete  
✅ **Configurable Delays** - Change PROCESSING_DELAY in .env  
✅ **Per-Partition Isolation** - Each partition processes independently  
✅ **Clear Logging** - Shows processing status and timing  

## Real Console Output

Here's what you see when running the consumer with test messages:

```
📍 Event Hub Consumer Started
   Event Hub: nsgcpeventhub
   Batch Size: 2 messages per partition
   Processing Delay: 500ms (long-running task simulation)
   Listening for incoming messages...

   Available Partitions: 0, 1, 2, 3

Consumer is running. Press Ctrl+C to exit.

✓ Received 2 event(s) from partition 1
  → Event #1 | Offset: 2304 | Body: Test message 1 - 2025-12-03T21:18:07.391Z
  → Event #2 | Offset: 2496 | Body: Test message 2 - 2025-12-03T21:18:07.391Z

======================================================================
⏳ PROCESSING BATCH - Partition 1
======================================================================
Batch Size: 2 messages
Total Messages Processed (Partition): 2
Batch Number: 1
Processing Delay: 500ms (simulating long-running task)

  [1] Offset: 2304 | Seq: 12 | Body: Test message 1 - 2025-12-03T21:18:07.391Z
  [2] Offset: 2496 | Seq: 13 | Body: Test message 2 - 2025-12-03T21:18:07.391Z

⏳ Processing in progress...
✅ Batch processing completed!
======================================================================

✓ Received 2 event(s) from partition 1
  → Event #3 | Offset: 2688 | Body: Test message 3 - 2025-12-03T21:18:07.391Z
  → Event #4 | Offset: 2880 | Body: Test message 4 - 2025-12-03T21:18:07.391Z

======================================================================
⏳ PROCESSING BATCH - Partition 1
======================================================================
Batch Size: 2 messages
Total Messages Processed (Partition): 4
Batch Number: 2
Processing Delay: 500ms (simulating long-running task)

  [1] Offset: 2688 | Seq: 14 | Body: Test message 3 - 2025-12-03T21:18:07.391Z
  [2] Offset: 2880 | Seq: 15 | Body: Test message 4 - 2025-12-03T21:18:07.391Z

⏳ Processing in progress...
✅ Batch processing completed!
======================================================================
```

## How to Test It

### Step 1: Check Current Configuration
```bash
cat .env
```
Output:
```
BATCH_SIZE=2
PROCESSING_DELAY=500
```

### Step 2: Start the Consumer
```bash
npm start
```
You'll see:
```
📍 Event Hub Consumer Started
   Event Hub: nsgcpeventhub
   Batch Size: 2 messages per partition
   Processing Delay: 500ms (long-running task simulation)
   Listening for incoming messages...
```

### Step 3: Send Test Messages (in another terminal)
```bash
npm run send
```
Output:
```
📤 Sending 20 test messages to Event Hub
✓ Successfully sent 20 messages!
```

### Step 4: Watch the Consumer Process Batches
Back in Terminal 1, you'll see:
- Messages arrive in groups
- Batch processing starts (⏳ Processing in progress...)
- 500ms delay happens
- Batch completes (✅)
- Next batch begins (not immediately, but after the 500ms!)

## Key Observations

### ✅ Batch #1 Processing Timeline
```
Time 0ms:    Batch #1 arrives (2 messages)
Time 0ms:    ⏳ Processing starts
Time 500ms:  ✅ Batch #1 completes
```

### ✅ Batch #2 Processing Timeline
```
Time 500ms:  Batch #2 CAN start now (after Batch #1 done)
Time 500ms:  ⏳ Processing starts
Time 1000ms: ✅ Batch #2 completes
```

**The second batch never starts until the first finishes!**

## Configuration Examples

### Fast Processing (100ms)
```env
BATCH_SIZE=5
PROCESSING_DELAY=100
```
Use for: Real-time processing, minimal latency scenarios

### Medium Processing (500ms - Default)
```env
BATCH_SIZE=10
PROCESSING_DELAY=500
```
Use for: API calls, small database operations

### Slow Processing (1 second)
```env
BATCH_SIZE=50
PROCESSING_DELAY=1000
```
Use for: Complex business logic, large database inserts

### Very Slow Processing (5 seconds)
```env
BATCH_SIZE=100
PROCESSING_DELAY=5000
```
Use for: Heavy computations, external service calls

## Real-World Integration

Replace the simulated delay with actual work:

```javascript
async function processBatch(partitionId) {
  const buffer = messageBuffers[partitionId];
  processingFlags[partitionId] = true;

  try {
    // BEFORE: Just delay
    // await delay(PROCESSING_DELAY);

    // AFTER: Your actual business logic
    for (const message of buffer) {
      // Example: Insert into database
      await database.insert({
        id: message.sequenceNumber,
        data: message.body,
        processedAt: new Date()
      });
    }
    
    console.log(`✅ Processed ${buffer.length} records`);
  } catch (error) {
    console.error(`❌ Processing error:`, error);
  } finally {
    processingFlags[partitionId] = false;
    messageBuffers[partitionId] = [];
  }
}
```

## Benefits of This Approach

✅ **Controlled Throughput** - Process at manageable rate  
✅ **No Overlapping Operations** - Each batch completes before next starts  
✅ **Resource Protection** - Prevents database/API overload  
✅ **Clear Diagnostics** - Timing information in logs  
✅ **Easy Testing** - Configure different delays to test scenarios  
✅ **Production Ready** - Works with real long-running tasks  

## Troubleshooting

### Batches Processing Too Slowly?
- Reduce `PROCESSING_DELAY`
- Or increase `BATCH_SIZE`

### Want Faster Tests?
```env
BATCH_SIZE=1
PROCESSING_DELAY=10
```

### Want to See Delays More Clearly?
```env
BATCH_SIZE=5
PROCESSING_DELAY=2000
```

## Next Steps

1. **Run the demonstration**: `npm start` then `npm run send`
2. **Observe the timing** between batch completions
3. **Try different delays**: Edit `.env` and restart
4. **Replace delay with real work** when integrating with your system
5. **Scale batch size** based on your performance needs

---

**You now have a production-ready Event Hub consumer with controlled batch processing!** 🚀
