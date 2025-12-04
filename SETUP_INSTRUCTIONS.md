
# Setup Instructions

## Problem

You are seeing the error: **"The messaging entity could not be found"**

This happens because the `EVENT_HUB_NAME` in your `.env` file is set to `kpehubebssdevuws2ebs2`, which is actually your **Service Bus Namespace**, not your **Event Hub name**.

## Solution

### Step 1: Find Your Event Hub Name

1. Go to [Azure Portal](https://portal.azure.com)
2. Search for "Service Bus Namespaces"
3. Click on `kpehubebssdevuws2ebs2`
4. In the left sidebar, click "Event Hubs" under "Entities"
5. You'll see a list of event hubs with their names

### Step 2: Update .env File

Replace `YOUR_EVENT_HUB_NAME_HERE` with the actual event hub name:

```env
# Azure Event Hub Connection
EVENT_HUB_CONNECTION_STRING=Endpoint=sb://kpehubebssdevuws2ebs2.servicebus.windows.net/;SharedAccessKeyName=RootManageSharedAccessKey;SharedAccessKey=rNoAfdmlpFrlEpgTQg/hJ4lGqrM9agvkVEbBPcRGZss=
EVENT_HUB_NAME=your-actual-hub-name
BATCH_SIZE=5
```

### Step 3: Verify Configuration

```bash
node diagnose.js
```

This should now show:
- ✓ Connected successfully!
- Found X partition(s)

### Step 4: Run the Consumer

```bash
npm start
```

The consumer will now connect successfully and listen for messages!

## Understanding Partitions

Event Hubs typically have 2 or more partitions. The consumer will:

1. Connect to all partitions
2. Buffer messages per partition separately
3. Process batches of 5 messages (configurable)
4. Display which partition each batch came from

This allows you to demonstrate reading controlled numbers of messages from each partition independently!

## Testing

Send test messages with:
```bash
npm run send
```

This will send 20 test messages to your Event Hub, which will be received and processed in batches by the consumer.
