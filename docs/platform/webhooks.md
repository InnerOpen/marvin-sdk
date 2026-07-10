# Webhooks

Configure webhooks to receive real-time notifications when content changes.

## Overview

Webhooks allow you to receive HTTP callbacks when events occur in your workspace (entries created, published, updated, etc.).

## Webhook Events

| Event | Description | Payload |
|-------|-------------|---------|
| `entry.created` | New entry created | Entry object |
| `entry.updated` | Entry updated | Entry object |
| `entry.published` | Entry published | Entry object |
| `entry.unpublished` | Entry unpublished | Entry object |
| `entry.deleted` | Entry deleted | Entry ID |
| `collection.created` | Collection created | Collection object |
| `collection.updated` | Collection updated | Collection object |
| `collection.deleted` | Collection deleted | Collection ID |
| `asset.uploaded` | Asset uploaded | Asset object |
| `asset.deleted` | Asset deleted | Asset ID |

## Listing Webhooks

```typescript
const webhooks = await platform.webhooks.list();

webhooks.forEach(webhook => {
  console.log(`${webhook.name}: ${webhook.url} (${webhook.enabled ? 'Enabled' : 'Disabled'})`);
});
```

## Creating Webhooks

```typescript
const webhook = await platform.webhooks.create({
  name: 'Notify on Entry Published',
  url: 'https://example.com/webhooks/entry-published',
  eventTypes: ['entry.published'],
  method: 'POST',
  enabled: true,
  headers: {
    'X-API-Key': 'your-api-key',
  },
});

console.log(`Created webhook: ${webhook.id}`);
```

### Webhook Configuration

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | `string` | Yes | Webhook name |
| `url` | `string` | Yes | Target URL |
| `eventTypes` | `string[]` | Yes | Events to listen for |
| `method` | `POST` \| `PUT` | No | HTTP method (default: POST) |
| `enabled` | `boolean` | No | Enable webhook (default: true) |
| `headers` | `object` | No | Custom headers |

## Updating Webhooks

```typescript
await platform.webhooks.update('webhook-123', {
  name: 'Updated Name',
  url: 'https://new-url.com/webhook',
  enabled: false,
});
```

## Deleting Webhooks

```typescript
await platform.webhooks.delete('webhook-123');
```

## Testing Webhooks

Send a test event to verify webhook configuration:

```typescript
const result = await platform.webhooks.test('webhook-123');

console.log(`Success: ${result.success}`);
console.log(`Status: ${result.statusCode}`);
console.log(`Message: ${result.message}`);
```

**Test Payload:**

The test sends a sample event:

```json
{
  "event": "test",
  "timestamp": "2026-07-10T12:00:00Z",
  "data": {
    "message": "This is a test webhook"
  }
}
```

## Webhook Payloads

### Entry Events

```json
{
  "event": "entry.published",
  "timestamp": "2026-07-10T12:00:00Z",
  "workspace": {
    "id": "ws-123",
    "slug": "my-blog",
    "name": "My Blog"
  },
  "data": {
    "id": "entry-456",
    "title": "My New Post",
    "slug": "my-new-post",
    "entryTypeId": "post",
    "status": "published",
    "publishedAt": "2026-07-10T12:00:00Z",
    "dataJson": {
      "body": "# My New Post\n\nContent here..."
    }
  }
}
```

### Asset Events

```json
{
  "event": "asset.uploaded",
  "timestamp": "2026-07-10T12:00:00Z",
  "workspace": {
    "id": "ws-123",
    "slug": "my-blog",
    "name": "My Blog"
  },
  "data": {
    "id": "asset-789",
    "slug": "hero-image",
    "filename": "hero.jpg",
    "assetType": "image",
    "publicUrl": "https://cdn.example.com/hero.jpg"
  }
}
```

## Webhook Security

### Verify Webhook Signatures

Marvin signs webhooks with HMAC-SHA256:

```typescript
import crypto from 'crypto';

function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(payload);
  const computed = hmac.digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(computed)
  );
}

// Express handler
app.post('/webhooks/marvin', (req, res) => {
  const signature = req.headers['x-marvin-signature'];
  const payload = JSON.stringify(req.body);
  
  if (!verifyWebhookSignature(payload, signature, process.env.WEBHOOK_SECRET)) {
    return res.status(401).send('Invalid signature');
  }
  
  // Process webhook
  console.log('Received event:', req.body.event);
  res.status(200).send('OK');
});
```

### Use HTTPS

Always use HTTPS endpoints:

```typescript
// ✅ Good
url: 'https://example.com/webhooks'

// ❌ Bad
url: 'http://example.com/webhooks'
```

### Custom Headers for Authentication

```typescript
await platform.webhooks.create({
  name: 'Authenticated Webhook',
  url: 'https://api.example.com/webhooks',
  eventTypes: ['entry.published'],
  headers: {
    'Authorization': 'Bearer your-api-token',
    'X-API-Key': 'your-api-key',
  },
});
```

## Retry Logic

Marvin automatically retries failed webhooks:

- **Retry count:** 3 attempts
- **Retry delays:** 1s, 5s, 15s
- **Timeout:** 30 seconds per attempt

### Rerun Failed Webhooks

Manually rerun failed webhook deliveries:

```typescript
const result = await platform.webhooks.rerun();
console.log(`Requeued ${result.requeued} failed webhooks`);
```

## Examples

### Slack Notification on Publish

```typescript
const webhook = await platform.webhooks.create({
  name: 'Slack: Entry Published',
  url: 'https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK',
  eventTypes: ['entry.published'],
  method: 'POST',
  enabled: true,
});
```

**Slack Handler:**

```javascript
// No code needed - Slack webhook URL handles formatting
// Marvin sends:
{
  "text": "New entry published: My New Post",
  "attachments": [{
    "title": "My New Post",
    "title_link": "https://myblog.com/my-new-post",
    "text": "Published at 2026-07-10 12:00 PM"
  }]
}
```

### Trigger Build on Content Change

```typescript
const webhook = await platform.webhooks.create({
  name: 'Trigger Vercel Deploy',
  url: 'https://api.vercel.com/v1/integrations/deploy/...',
  eventTypes: ['entry.published', 'entry.updated', 'asset.uploaded'],
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${process.env.VERCEL_TOKEN}`,
  },
});
```

### Custom Webhook Handler

```typescript
// Express.js webhook endpoint
import express from 'express';

const app = express();
app.use(express.json());

app.post('/webhooks/marvin', async (req, res) => {
  const { event, data, workspace } = req.body;
  
  console.log(`Received ${event} from ${workspace.name}`);
  
  switch (event) {
    case 'entry.published':
      await handleEntryPublished(data);
      break;
      
    case 'asset.uploaded':
      await handleAssetUploaded(data);
      break;
      
    default:
      console.log('Unhandled event:', event);
  }
  
  res.status(200).send('OK');
});

async function handleEntryPublished(entry) {
  // Trigger static site rebuild
  await fetch('https://api.netlify.com/build_hooks/...', {
    method: 'POST',
  });
  
  // Send notification
  await sendEmail({
    to: 'team@example.com',
    subject: `New post published: ${entry.title}`,
    body: `${entry.title} is now live!`,
  });
}

app.listen(3000);
```

### Filter Events by Entry Type

```typescript
// Create separate webhooks for different entry types
const postWebhook = await platform.webhooks.create({
  name: 'Blog Post Published',
  url: 'https://example.com/webhooks/post-published',
  eventTypes: ['entry.published'],
});

// Filter in your webhook handler
app.post('/webhooks/post-published', (req, res) => {
  const { data } = req.body;
  
  if (data.entryTypeId === 'blog-post') {
    // Handle blog post
    console.log('New blog post:', data.title);
  }
  
  res.status(200).send('OK');
});
```

## Debugging Webhooks

### Check Webhook Logs

```typescript
const webhooks = await platform.webhooks.list();

for (const webhook of webhooks) {
  const test = await platform.webhooks.test(webhook.id);
  console.log(`${webhook.name}: ${test.success ? '✅' : '❌'}`);
}
```

### Common Issues

**1. Webhook not firing:**

- Check webhook is enabled
- Verify event types match actual events
- Check workspace context

**2. Webhook timing out:**

- Ensure endpoint responds < 30 seconds
- Return 200 immediately, process async

**3. Authentication failures:**

- Verify custom headers
- Check signature verification
- Confirm HTTPS endpoint

## Best Practices

### 1. Respond Quickly

Return 200 immediately, process async:

```typescript
app.post('/webhooks/marvin', async (req, res) => {
  // Return 200 immediately
  res.status(200).send('OK');
  
  // Process async
  setImmediate(async () => {
    await processWebhook(req.body);
  });
});
```

### 2. Handle Duplicates

Webhooks may be delivered multiple times:

```typescript
const processedEvents = new Set();

app.post('/webhooks/marvin', (req, res) => {
  const eventId = `${req.body.event}-${req.body.timestamp}-${req.body.data.id}`;
  
  if (processedEvents.has(eventId)) {
    console.log('Duplicate event, skipping');
    return res.status(200).send('OK');
  }
  
  processedEvents.add(eventId);
  // Process event...
  
  res.status(200).send('OK');
});
```

### 3. Monitor Webhook Health

```typescript
async function monitorWebhooks() {
  const webhooks = await platform.webhooks.list();
  
  for (const webhook of webhooks) {
    if (webhook.enabled) {
      const test = await platform.webhooks.test(webhook.id);
      
      if (!test.success) {
        console.error(`Webhook failing: ${webhook.name}`);
        // Alert team
      }
    }
  }
}

// Run hourly
setInterval(monitorWebhooks, 60 * 60 * 1000);
```

## Next Steps

- [Platform Overview](overview.md) - Platform API basics
- [Email Templates](email-templates.md) - Email configuration
- [Workspaces](workspaces.md) - Workspace management
