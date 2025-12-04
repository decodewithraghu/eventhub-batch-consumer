# Project Summary: Azure Event Hub Batch Consumer

## What This Project Does

This Node.js project demonstrates **reading a controlled number of messages from Azure Event Hub at a time** - a critical feature for many enterprise applications that need to process data in specific batch sizes.

## Key Capabilities

### ✅ Batch Message Processing
- Read exactly N messages before processing (configurable)
- Each partition maintains its own batch buffer
- Prevents system overload by controlling throughput

### ✅ Multi-Partition Support
- Automatically connects to all partitions
- Tracks messages per partition independently
- Processes each partition's batches separately

### ✅ Event Hub Management
- Check if Event Hub exists
- Verify connection and permissions
- Show partition information
- Provide creation instructions (CLI/Portal/PowerShell)

### ✅ Testing & Demonstration
- Send test messages on demand
- View real-time processing
- Detailed logging of batch activities

## Files in This Project

| File | Purpose |
|------|---------|
| `index.js` | Main consumer - listens and processes messages in batches |
| `send-test-messages.js` | Utility to send test messages |
| `diagnose.js` | Detailed configuration verification |
| `check-or-create-hub.js` | Event Hub existence checker with creation help |
| `.env` | Configuration (connection string, batch size) |
| `package.json` | Dependencies and npm scripts |
| `README.md` | Full technical documentation |
| `QUICK_START.md` | Quick start guide |

## How to Use

### 1. Verify Everything Works
```bash
npm run check
```
Shows Event Hub name, namespace, and partition count.

### 2. Start the Consumer
```bash
npm start
```
Listens for messages and processes them in batches.

### 3. Send Test Messages
```bash
npm run send
```
Sends 20 test messages to demonstrate batch processing.

### 4. Change Batch Size
Edit `.env` and change:
```env
BATCH_SIZE=5    # Change to any number
```

## Configuration

In `.env`:
```env
EVENT_HUB_CONNECTION_STRING=your_connection_string
EVENT_HUB_NAME=nsgcpeventhub
BATCH_SIZE=5
```

## Real-World Usage Examples

### Example 1: Database Inserts (Batch Size 100)
```env
BATCH_SIZE=100
# Consumer waits until 100 messages arrive, then batch inserts into database
```

### Example 2: API Calls (Batch Size 10)
```env
BATCH_SIZE=10
# Consumer waits until 10 messages arrive, then makes one bulk API call
```

### Example 3: Real-Time Processing (Batch Size 1)
```env
BATCH_SIZE=1
# Consumer processes each message immediately
```

## Advanced Features

### Per-Partition Tracking
The consumer maintains separate buffers for each partition:
- Partition 0: Buffer A
- Partition 1: Buffer B
- Partition 2: Buffer C
- Partition 3: Buffer D

Each buffer fills up independently and processes when batch size is reached.

### Graceful Shutdown
Press `Ctrl+C` to stop the consumer gracefully:
```
^C
🛑 Shutting down consumer...
```

### Error Handling
- Connection errors are logged with partition ID
- Retry logic built-in
- Detailed error messages

## Integration Points

This can be extended to:
- **Database**: Insert messages in batches to SQL, MongoDB, etc.
- **APIs**: Call external APIs with batched data
- **File System**: Write messages in batch chunks
- **Message Queue**: Forward to another queue in batches
- **Analytics**: Aggregate and analyze in batches

## Technology Stack

- **Node.js**: Runtime environment
- **@azure/event-hubs**: Azure Event Hubs SDK
- **dotenv**: Environment variable management

## Performance Characteristics

With BATCH_SIZE=5 and 4 partitions:
- Can handle thousands of messages per second
- Memory-efficient batching approach
- Scalable to larger batch sizes
- Per-partition isolation prevents one slow partition from blocking others

## Monitoring

The consumer outputs:
- Message arrival notifications
- Batch processing summaries
- Partition-specific statistics
- Event offsets and sequence numbers

This allows you to monitor throughput and diagnose issues in real-time.

## Troubleshooting Commands

```bash
npm run check      # Verify Event Hub exists
npm run diagnose   # Detailed configuration check
npm start          # Start consuming with detailed output
npm run send       # Generate test data
```

## Next Steps

1. **Run the demo**: `npm start` + `npm run send` (in another terminal)
2. **Observe batch processing**: Watch messages group and process
3. **Adjust batch size**: Edit `.env` and restart
4. **Integrate with your system**: Extend the `processBatch()` function

---

**This project successfully demonstrates reading a controlled number of messages from Event Hub!** 🎉
