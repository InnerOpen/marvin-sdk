# Workspaces Management

Manage workspaces and workspace settings via the Platform API.

## Overview

Workspaces are the top-level organizational unit in Marvin. Each workspace contains entries, collections, assets, and resources.

## Listing Workspaces

### List All Accessible Workspaces

```typescript
const workspaces = await platform.workspaces.list();

workspaces.forEach(({ workspace, role, isActive }) => {
  console.log(`${workspace.name} (${role})${isActive ? ' [ACTIVE]' : ''}`);
});
```

**Response:**

```typescript
[
  {
    workspace: {
      id: 'ws-123',
      slug: 'my-blog',
      name: 'My Blog',
      description: 'Personal blog content'
    },
    role: 'owner',
    isActive: true
  },
  {
    workspace: {
      id: 'ws-456',
      slug: 'company-site',
      name: 'Company Website',
      description: null
    },
    role: 'editor',
    isActive: false
  }
]
```

## Active Workspace

### Get Current Active Workspace

```typescript
const current = await platform.workspaces.getCurrent();
console.log(`Active: ${current.name} (${current.slug})`);
```

### Switch Active Workspace

```typescript
// Switch by slug
await platform.workspaces.setActive('my-blog');

// Or by ID
await platform.workspaces.setActive('ws-123');

// Verify switch
const current = await platform.workspaces.getCurrent();
console.log(`Now active: ${current.name}`);
```

## Creating Workspaces

!!! warning "Admin Required"
    Creating workspaces requires `SUPER_ADMIN` permissions.

```typescript
const workspace = await platform.workspaces.create({
  name: 'New Project',
  slug: 'new-project',
  description: 'Project website content',
});

console.log(`Created workspace: ${workspace.id}`);
```

**Auto-Generated Slugs:**

If you don't provide a slug, one is generated from the name:

```typescript
const workspace = await platform.workspaces.create({
  name: 'My Awesome Site', // slug: 'my-awesome-site'
});
```

## Updating Workspaces

### Update Workspace Settings

```typescript
const workspace = await platform.workspaces.update('ws-123', {
  name: 'Updated Name',
  description: 'Updated description',
});
```

**Permissions:**

- Workspace `ADMIN` or `OWNER` can update settings
- `SUPER_ADMIN` can update any workspace

## Deleting Workspaces

!!! danger "Destructive Operation"
    Deleting a workspace permanently deletes all entries, collections, assets, and resources.

```typescript
// Safe delete (fails if workspace has content)
await platform.workspaces.delete('ws-123');

// Force delete (deletes all content)
await platform.workspaces.delete('ws-123', true);
```

**Permissions:**

- Requires `SUPER_ADMIN` role
- Force delete requires confirmation

## Workspace Preferences

### Get Preferences

```typescript
const prefs = await platform.workspaces.getPreferences('ws-123');
console.log(prefs);
```

**Example Response:**

```json
{
  "theme": "dark",
  "defaultEntryStatus": "draft",
  "enableMarkdownEditor": true,
  "customSettings": {
    "brandColor": "#3b82f6"
  }
}
```

### Update Preferences

```typescript
const updated = await platform.workspaces.updatePreferences('ws-123', {
  theme: 'light',
  customSettings: {
    brandColor: '#10b981',
  },
});
```

**Merge Behavior:**

Preferences are merged, not replaced:

```typescript
// Initial
{ theme: 'dark', customSettings: { brandColor: '#3b82f6' } }

// Update
await platform.workspaces.updatePreferences('ws-123', {
  customSettings: { logo: '/logo.png' },
});

// Result
{ theme: 'dark', customSettings: { brandColor: '#3b82f6', logo: '/logo.png' } }
```

## Workspace Context

Most Platform API operations require a workspace slug:

```typescript
// ✅ Correct: Specify workspace
await platform.entries.list('my-blog');
await platform.collections.list('my-blog');
await platform.assets.list('my-blog');

// ❌ Wrong: No workspace context
await platform.entries.list(); // Error
```

### Helper: Get Workspace Slug

```typescript
async function getWorkspaceSlug(nameOrSlug: string): Promise<string> {
  const workspaces = await platform.workspaces.list();
  const found = workspaces.find(
    ({ workspace }) =>
      workspace.slug === nameOrSlug || workspace.name === nameOrSlug
  );
  
  if (!found) {
    throw new Error(`Workspace not found: ${nameOrSlug}`);
  }
  
  return found.workspace.slug;
}

// Usage
const slug = await getWorkspaceSlug('My Blog');
const entries = await platform.entries.list(slug);
```

## Multi-Workspace Operations

### Sync Content Across Workspaces

```typescript
async function syncEntries(sourceSlug: string, targetSlug: string) {
  // Get entries from source
  const entries = await platform.entries.list(sourceSlug);
  
  // Copy to target
  for (const entry of entries) {
    await platform.entries.create(targetSlug, {
      title: entry.title,
      slug: entry.slug,
      entryTypeId: entry.entryTypeId,
      dataJson: entry.dataJson,
    });
  }
  
  console.log(`Copied ${entries.length} entries`);
}

await syncEntries('staging', 'production');
```

### Audit All Workspaces

```typescript
const workspaces = await platform.workspaces.list();

for (const { workspace, role } of workspaces) {
  const entries = await platform.entries.list(workspace.slug);
  const collections = await platform.collections.list(workspace.slug);
  
  console.log(`${workspace.name} (${role}):`);
  console.log(`  - ${entries.length} entries`);
  console.log(`  - ${collections.length} collections`);
}
```

## Workspace Roles

### Role Permissions

| Role | Permissions |
|------|-------------|
| **Owner** | Full access, can delete workspace |
| **Admin** | Manage content, members, settings |
| **Editor** | Create, edit, publish content |
| **Contributor** | Create and edit drafts |
| **Viewer** | Read-only access |

### Check Role

```typescript
async function getUserRole(workspaceSlug: string): Promise<string> {
  const workspaces = await platform.workspaces.list();
  const found = workspaces.find(({ workspace }) => workspace.slug === workspaceSlug);
  return found?.role || 'none';
}

const role = await getUserRole('my-blog');
console.log(`Your role: ${role}`);
```

### Role-Based Operations

```typescript
const role = await getUserRole('my-blog');

if (role === 'owner' || role === 'admin') {
  await platform.workspaceMembers.create('my-blog', {
    email: 'newuser@example.com',
    role: 'editor',
  });
} else {
  console.log('Permission denied: Admin role required');
}
```

## Examples

### Create Workspace for New Project

```typescript
async function setupNewProject(name: string) {
  // Create workspace
  const workspace = await platform.workspaces.create({
    name,
    description: `Content for ${name}`,
  });
  
  console.log(`Created workspace: ${workspace.slug}`);
  
  // Set preferences
  await platform.workspaces.updatePreferences(workspace.id, {
    theme: 'light',
    defaultEntryStatus: 'draft',
  });
  
  // Create default entry types
  await platform.entryTypes.create(workspace.slug, {
    name: 'Page',
    slug: 'page',
    schemaJson: {
      fields: [
        { key: 'body', label: 'Body', type: 'markdown', required: true },
      ],
    },
  });
  
  return workspace;
}

const workspace = await setupNewProject('My New Site');
```

### Workspace Switcher UI

```typescript
// Component for switching workspaces
async function WorkspaceSwitcher() {
  const workspaces = await platform.workspaces.list();
  const current = await platform.workspaces.getCurrent();
  
  return {
    current,
    workspaces: workspaces.map(({ workspace, role }) => ({
      ...workspace,
      role,
      isCurrent: workspace.id === current.id,
    })),
  };
}

// Handle workspace switch
async function switchWorkspace(slug: string) {
  await platform.workspaces.setActive(slug);
  window.location.reload(); // Refresh UI
}
```

## Next Steps

- [Platform Overview](overview.md) - Platform API basics
- [Authentication](auth.md) - Session management
- [Email Templates](email-templates.md) - Email template management
- [Webhooks](webhooks.md) - Webhook configuration
