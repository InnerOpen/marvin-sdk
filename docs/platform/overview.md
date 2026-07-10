# Platform API Overview

The Marvin Platform API provides authenticated workspace management capabilities for building admin interfaces, CLI tools, and automation workflows.

## Publishing API vs Platform API

Marvin provides two distinct APIs:

| Feature | Publishing API | Platform API |
|---------|---------------|--------------|
| **Purpose** | Read published content | Full workspace management |
| **Authentication** | Site client tokens (`marvin_sk_*`) | User tokens (`marvin_ut_*`) |
| **Permissions** | Read-only | Full CRUD + admin |
| **Use Cases** | Static sites, public websites | Admin dashboards, CLI tools |
| **Workspace Context** | Single workspace | Multi-workspace |
| **Import Path** | `@inneropen/marvin-sdk` | `@inneropen/marvin-sdk/platform` |

!!! tip "When to Use Platform API"
    Use the Platform API when you need to create, update, or delete content programmatically, or when building admin tools.

## Quick Start

### Installation

```bash
npm install @inneropen/marvin-sdk
```

### Authentication

Platform API requires a user token (session-based authentication):

```typescript
import { createPlatformClient } from '@inneropen/marvin-sdk/platform';

const platform = createPlatformClient({
  apiUrl: 'https://marvin.example.com',
  userToken: process.env.MARVIN_USER_TOKEN,
});
```

### Basic Usage

```typescript
// List workspaces
const workspaces = await platform.workspaces.list();

// Switch workspace context
const workspace = workspaces[0];

// Create an entry
const entry = await platform.entries.create(workspace.slug, {
  title: 'Hello World',
  slug: 'hello-world',
  entryTypeId: 'page-type-id',
  dataJson: {
    body: '# Hello World\n\nThis is my first entry!',
  },
});

// Update an entry
await platform.entries.update(workspace.slug, entry.id, {
  dataJson: {
    body: '# Hello World\n\nUpdated content!',
  },
});

// Delete an entry
await platform.entries.delete(workspace.slug, entry.id);
```

## Available Modules

### Content Management

| Module | Description |
|--------|-------------|
| `entries` | CRUD operations for entries |
| `collections` | Manage collections |
| `resources` | Manage resources |
| `assets` | Upload and manage assets |
| `entryTypes` | Manage entry type schemas |

### Workspace Management

| Module | Description |
|--------|-------------|
| `workspaces` | List and manage workspaces |
| `workspaceMembers` | Manage team members |
| `invites` | Send workspace invitations |
| `apiClients` | Manage API tokens |

### Platform Features

| Module | Description |
|--------|-------------|
| `emailTemplates` | Manage email templates |
| `webhooks` | Configure webhooks |
| `scheduledTasks` | Manage scheduled jobs |
| `forms` | Handle form submissions |
| `notifications` | User notifications |
| `eventLog` | Audit trail |

### User & Session

| Module | Description |
|--------|-------------|
| `user` | Current user profile |
| `session` | Session management |
| `theme` | UI theme preferences |

### Admin (Requires Admin Role)

| Module | Description |
|--------|-------------|
| `adminUsers` | Global user management |
| `adminSystem` | System configuration |
| `adminMaintenance` | Maintenance operations |

## Authentication

### User Tokens

Platform API uses user tokens for authentication:

```typescript
const platform = createPlatformClient({
  apiUrl: 'https://marvin.example.com',
  userToken: 'marvin_ut_1234567890abcdef',
});
```

### Session-Based Authentication

For browser-based applications, use session authentication:

```typescript
const platform = createPlatformClient({
  apiUrl: 'https://marvin.example.com',
  credentials: 'include', // Send cookies
});

// Login
await platform.session.login({
  email: 'user@example.com',
  password: 'password123',
});

// Now authenticated via session cookie
const workspaces = await platform.workspaces.list();

// Logout
await platform.session.logout();
```

See [Authentication](auth.md) for details.

## Workspace Context

Most Platform API operations require a workspace slug:

```typescript
// ✅ Specify workspace
await platform.entries.list('my-workspace');

// ❌ No workspace context
await platform.entries.list(); // Error
```

### Getting Workspace Slugs

```typescript
// List all workspaces you have access to
const workspaces = await platform.workspaces.list();

workspaces.forEach(ws => {
  console.log(`${ws.name}: ${ws.slug}`);
});

// Get a specific workspace
const workspace = await platform.workspaces.get('my-workspace');
```

## Permissions

Platform API operations respect workspace role permissions:

| Role | Permissions |
|------|-------------|
| **Owner** | Full access (all operations) |
| **Admin** | Manage content, members, settings |
| **Editor** | Create, edit, publish content |
| **Contributor** | Create and edit drafts |
| **Viewer** | Read-only access |

If you lack permissions, operations will fail with a `403 Forbidden` error.

## Error Handling

Platform API uses standard HTTP status codes:

```typescript
try {
  const entry = await platform.entries.get('my-workspace', 'entry-id');
} catch (error) {
  if (error.status === 403) {
    console.error('Permission denied');
  } else if (error.status === 404) {
    console.error('Entry not found');
  } else {
    console.error('Unexpected error:', error.message);
  }
}
```

See [Error Handling](../reference/errors.md) for details.

## Rate Limiting

Platform API rate limits:

- **Standard users:** 60 requests/minute
- **Pro users:** 300 requests/minute
- **Enterprise:** Custom limits

Implement exponential backoff for retries:

```typescript
async function retryWithBackoff<T>(fn: () => Promise<T>, retries = 3): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (error.status === 429 && i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
      } else {
        throw error;
      }
    }
  }
  throw new Error('Max retries exceeded');
}

const entries = await retryWithBackoff(() => 
  platform.entries.list('my-workspace')
);
```

## Examples

### Create a Blog Post

```typescript
const post = await platform.entries.create('my-blog', {
  title: 'My First Post',
  slug: 'my-first-post',
  entryTypeId: 'post-type-id',
  dataJson: {
    body: '# My First Post\n\nHello, world!',
    author: 'Jane Doe',
    publishDate: new Date().toISOString(),
  },
  status: 'published',
});
```

### Upload an Image

```typescript
import fs from 'fs';

const file = fs.readFileSync('./hero.jpg');
const asset = await platform.assets.upload('my-workspace', {
  file,
  slug: 'hero-image',
  name: 'Hero Image',
  altText: 'A beautiful hero image',
});

console.log(`Uploaded: ${asset.publicUrl}`);
```

### Bulk Import Entries

```typescript
const entries = [
  { title: 'Entry 1', slug: 'entry-1' },
  { title: 'Entry 2', slug: 'entry-2' },
  { title: 'Entry 3', slug: 'entry-3' },
];

for (const data of entries) {
  await platform.entries.create('my-workspace', {
    ...data,
    entryTypeId: 'page-type-id',
    dataJson: { body: `# ${data.title}` },
  });
}
```

### Webhook Automation

```typescript
// Create a webhook for new entries
const webhook = await platform.webhooks.create('my-workspace', {
  name: 'Notify on New Entry',
  url: 'https://example.com/webhooks/entry-created',
  events: ['entry.created'],
  active: true,
});

console.log(`Webhook created: ${webhook.id}`);
```

## Next Steps

- [Authentication](auth.md) - Session and token-based auth
- [Workspaces](workspaces.md) - Workspace management
- [Email Templates](email-templates.md) - Email template API
- [Webhooks](webhooks.md) - Webhook configuration
- [Admin API](admin.md) - Admin operations
