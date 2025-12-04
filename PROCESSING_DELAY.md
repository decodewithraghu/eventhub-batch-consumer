# Processing Delay & Sequential Batch Processing

## Overview

The consumer now includes a **configurable processing delay** to demonstrate long-running operations and ensures that **batches are processed sequentially** (the next batch waits for the previous one to complete).

## How It Works

### Sequential Processing

1. **First batch of messages arrives** (e.g., 2 messages)
2. **Processing starts** → 500ms delay to simulate long-running task
3. **Batch completes** → marked as done
4. **Second batch begins** (only after first completes)
5. **Process repeats** for each subsequent batch

### Key Implementation Details

```javascript
// Processing flag ensures sequential batches
processingFlags[partitionId] = true;  // Start processing
// ... simulate work with delay(PROCESSING_DELAY)
processingFlags[partitionId] = false; // Done processing

// Next batch waits for current to complete
while (processingFlags[partitionId]) {
  await delay(10); // Check every 10ms
}
```

## Configuration

### Environment Variable

Set in `.env`:

```env
# Delay in milliseconds (default: 500ms)
PROCESSING_DELAY=500
```

### Common Values

```env
PROCESSING_DELAY=100   # Fast (100ms delay)
PROCESSING_DELAY=500   # Default (500ms delay)
PROCESSING_DELAY=1000  # Slow (1 second delay)
PROCESSING_DELAY=5000  # Very slow (5 second delay)
```

## Real-World Scenarios

### 1. Database Batch Insert (1 second delay)
```env
BATCH_SIZE=100
PROCESSING_DELAY=1000
```
Simulates inserting 100 records into a database.

### 2. API Rate-Limited Calls (500ms delay)
```env
BATCH_SIZE=10
PROCESSING_DELAY=500
```
Simulates API calls that have rate limits.

### 3. Real-Time Processing (minimal delay)
```env
BATCH_SIZE=1
PROCESSING_DELAY=10
```
Process messages as quickly as possible.

### 4. Heavy Computation (5 second delay)
```env
BATCH_SIZE=5
PROCESSING_DELAY=5000
```
Simulates complex data transformation.

## Console Output

The consumer now shows the processing status:

```
⏳ PROCESSING BATCH - Partition 0
===============================================
Batch Size: 2 messages
Total Messages Processed (Partition): 10
Batch Number: 5
Processing Delay: 500ms (simulating long-running task)

  [1] Offset: 7488 | Seq: 20 | Body: Test message 1
  [2] Offset: 7680 | Seq: 21 | Body: Test message 2

⏳ Processing in progress...
✅ Batch processing completed!
===============================================
```

## Key Features

### ✅ Sequential Guarantee
- Batch N+1 **never starts** until Batch N completes
- Per-partition independent processing
- No race conditions

### ✅ Configurable Delay
- Simulate any processing duration
- From milliseconds to minutes
- Easy to test different scenarios

### ✅ Per-Partition Isolation
- Each partition has its own processing queue
- Partitions process independently
- Multiple partitions don't block each other

### ✅ Clear Logging
- Shows processing status
- Displays delay information
- Indicates batch completion

## Testing

### Basic Test
```bash
# Terminal 1
npm start

# Terminal 2 (after consumer is ready)
npm run send
```

Watch the console output to see:
1. Messages arrive
2. Batch is collected
3. Processing starts (⏳)
4. 500ms delay happens
5. Processing completes (✅)
6. Next batch begins

### Change Processing Time
```bash
# Edit .env
PROCESSING_DELAY=2000

# Run again
npm start
# npm run send (in another terminal)
```

You'll see 2-second delays between batch completions.

## Code Integration

To integrate this into your real application, replace the delay with actual work:

```javascript
// Current (just delay):
await delay(PROCESSING_DELAY);

// Real example - Database insert:
async function processBatch(partitionId) {
  const buffer = messageBuffers[partitionId];
  processingFlags[partitionId] = true;
  
  try {
    // Your actual processing logic
    await database.insert(buffer);
    console.log(`✅ Inserted ${buffer.length} records`);
  } catch (error) {
    console.error(`❌ Database error:`, error);
  } finally {
    processingFlags[partitionId] = false;
    messageBuffers[partitionId] = [];
  }
}
```

## Performance Impact

- **Memory**: Minimal (stores batch in memory)
- **CPU**: Low (mostly waiting/I/O)
- **Latency**: Controlled by PROCESSING_DELAY
- **Throughput**: Predictable based on batch size × processing time

## Troubleshooting

### Messages Not Being Processed?
- Check PROCESSING_DELAY value
- Check BATCH_SIZE in .env
- Ensure Event Hub has messages

### Batches Processing Too Slowly?
- Reduce PROCESSING_DELAY
- Increase BATCH_SIZE
- Check system resources

### Errors During Processing?
- Check error logs in console
- Verify message format
- Check partition connectivity

---

This feature demonstrates enterprise-grade message handling with proper sequencing and delay management!
