# Platform API Reference

## Overview

The Platform API provides access to administrative and workspace management features. This is a separate import from the main publishing SDK.

```typescript
import { createPlatformClient } from '@inneropen/marvin-sdk/platform';
```

!!! warning "Authentication Required"
    The Platform API requires user authentication, not site client tokens. Use this for admin dashboards, CLIs, and tools, not for public-facing websites.

## Creating a Platform Client

```typescript
import { createPlatformClient } from '@inneropen/marvin-sdk/platform';

const platform = createPlatformClient({
  apiUrl: 'https://marvin.example.com',
  // Authentication will be handled via login methods
});
```

## Authentication

### `login(email, password)`

Authenticate with email and password.

```typescript
await platform.auth.login(email, password);
```

### `logout()`

Log out the current user.

```typescript
await platform.auth.logout();
```

### `getCurrentUser()`

Get the current authenticated user.

```typescript
const user = await platform.auth.getCurrentUser();
console.log(user.email, user.name);
```

## Workspaces

### `list()`

List all workspaces the user has access to.

```typescript
const workspaces = await platform.workspaces.list();

for (const workspace of workspaces) {
  console.log(`${workspace.name} (${workspace.slug})`);
}
```

### `get(slug)`

Get a specific workspace.

```typescript
const workspace = await platform.workspaces.get('my-workspace');
```

### `create(data)`

Create a new workspace.

```typescript
const workspace = await platform.workspaces.create({
  name: 'My Workspace',
  slug: 'my-workspace',
});
```

### `update(slug, data)`

Update a workspace.

```typescript
await platform.workspaces.update('my-workspace', {
  name: 'Updated Name',
});
```

## Entry Types

### `list(workspaceSlug)`

List all entry types in a workspace.

```typescript
const entryTypes = await platform.entryTypes.list('my-workspace');
```

### `create(workspaceSlug, data)`

Create a new entry type.

```typescript
const entryType = await platform.entryTypes.create('my-workspace', {
  name: 'Blog Post',
  slug: 'post',
  schema: {
    // JSON schema
  },
});
```

## Email Templates

### `list(workspaceSlug)`

List all email templates.

```typescript
const templates = await platform.emailTemplates.list('my-workspace');
```

### `get(workspaceSlug, slug)`

Get a specific email template.

```typescript
const template = await platform.emailTemplates.get('my-workspace', 'welcome');
```

### `create(workspaceSlug, data)`

Create a new email template.

```typescript
const template = await platform.emailTemplates.create('my-workspace', {
  name: 'Welcome Email',
  slug: 'welcome',
  subject: 'Welcome to {{workspace.name}}',
  bodyHtml: '<p>Welcome!</p>',
});
```

### `update(workspaceSlug, slug, data)`

Update an email template.

```typescript
await platform.emailTemplates.update('my-workspace', 'welcome', {
  subject: 'Updated Subject',
});
```

### `delete(workspaceSlug, slug)`

Delete an email template.

```typescript
await platform.emailTemplates.delete('my-workspace', 'welcome');
```

## Webhooks

### `list(workspaceSlug)`

List all webhooks.

```typescript
const webhooks = await platform.webhooks.list('my-workspace');
```

### `create(workspaceSlug, data)`

Create a new webhook.

```typescript
const webhook = await platform.webhooks.create('my-workspace', {
  url: 'https://example.com/webhook',
  events: ['entry.created', 'entry.updated'],
  active: true,
});
```

### `update(workspaceSlug, id, data)`

Update a webhook.

```typescript
await platform.webhooks.update('my-workspace', webhookId, {
  active: false,
});
```

### `delete(workspaceSlug, id)`

Delete a webhook.

```typescript
await platform.webhooks.delete('my-workspace', webhookId);
```

## Events & Event Log

### `list(workspaceSlug, options?)`

List events from the event log.

```typescript
const events = await platform.events.list('my-workspace', {
  limit: 100,
  eventType: 'entry.created',
});
```

## Workspace Members

### `list(workspaceSlug)`

List all workspace members.

```typescript
const members = await platform.workspaceMembers.list('my-workspace');
```

### `invite(workspaceSlug, email, role)`

Invite a new member.

```typescript
await platform.workspaceMembers.invite('my-workspace', 'user@example.com', 'editor');
```

### `remove(workspaceSlug, userId)`

Remove a member.

```typescript
await platform.workspaceMembers.remove('my-workspace', userId);
```

## Forms

### `list(workspaceSlug)`

List all forms.

```typescript
const forms = await platform.forms.list('my-workspace');
```

### `getSubmissions(workspaceSlug, formId)`

Get form submissions.

```typescript
const submissions = await platform.forms.getSubmissions('my-workspace', formId);
```

## Scheduled Tasks

### `list(workspaceSlug)`

List all scheduled tasks.

```typescript
const tasks = await platform.scheduledTasks.list('my-workspace');
```

### `create(workspaceSlug, data)`

Create a scheduled task.

```typescript
const task = await platform.scheduledTasks.create('my-workspace', {
  name: 'Daily Backup',
  schedule: '0 0 * * *',
  action: 'backup',
});
```

## API Clients

### `list(workspaceSlug)`

List all API clients (site client tokens).

```typescript
const clients = await platform.apiClients.list('my-workspace');
```

### `create(workspaceSlug, data)`

Create a new API client.

```typescript
const client = await platform.apiClients.create('my-workspace', {
  name: 'Production Site',
  permissions: ['read:entries', 'read:assets'],
});

console.log('Token:', client.token);
```

### `revoke(workspaceSlug, id)`

Revoke an API client.

```typescript
await platform.apiClients.revoke('my-workspace', clientId);
```

## Complete Example

```typescript
import { createPlatformClient } from '@inneropen/marvin-sdk/platform';

const platform = createPlatformClient({
  apiUrl: process.env.MARVIN_API_URL,
});

async function main() {
  // Login
  await platform.auth.login(
    process.env.MARVIN_EMAIL!,
    process.env.MARVIN_PASSWORD!
  );
  
  // Get current user
  const user = await platform.auth.getCurrentUser();
  console.log(`Logged in as: ${user.email}`);
  
  // List workspaces
  const workspaces = await platform.workspaces.list();
  console.log(`\nWorkspaces (${workspaces.length}):`);
  for (const ws of workspaces) {
    console.log(`- ${ws.name} (${ws.slug})`);
  }
  
  // Work with a specific workspace
  const workspace = workspaces[0];
  
  // List entry types
  const entryTypes = await platform.entryTypes.list(workspace.slug);
  console.log(`\nEntry Types (${entryTypes.length}):`);
  for (const et of entryTypes) {
    console.log(`- ${et.name} (${et.slug})`);
  }
  
  // List webhooks
  const webhooks = await platform.webhooks.list(workspace.slug);
  console.log(`\nWebhooks (${webhooks.length}):`);
  for (const wh of webhooks) {
    console.log(`- ${wh.url} [${wh.active ? 'active' : 'inactive'}]`);
  }
  
  // Logout
  await platform.auth.logout();
}

main().catch(console.error);
```

## See Also

- [Platform Overview](../platform/overview.md)
- [Authentication](../platform/auth.md)
- [Workspaces](../platform/workspaces.md)
- [Email Templates](../platform/email-templates.md)
- [Webhooks](../platform/webhooks.md)
