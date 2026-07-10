# Authentication

Platform API authentication methods and session management.

## Authentication Methods

The Platform API supports two authentication methods:

### 1. User Tokens (Recommended for CLI/Scripts)

User tokens are long-lived API tokens for server-side applications:

```typescript
import { createPlatformClient } from '@inneropen/marvin-sdk/platform';

const platform = createPlatformClient({
  apiUrl: 'https://marvin.example.com',
  userToken: process.env.MARVIN_USER_TOKEN,
});
```

**When to use:**

- CLI tools
- Build scripts
- Automation workflows
- Server-side applications

### 2. Session Authentication (Recommended for Web Apps)

Session authentication uses HTTP-only cookies for browser-based apps:

```typescript
const platform = createPlatformClient({
  apiUrl: 'https://marvin.example.com',
  credentials: 'include', // Send cookies with requests
});
```

**When to use:**

- Single-page applications (SPA)
- Admin dashboards
- Browser-based tools

## Creating User Tokens

### Via Marvin Admin UI

1. Navigate to **Settings** → **API Tokens**
2. Click **Create Token**
3. Select **User Token**
4. Set name and permissions
5. Copy the token (shown once)

### Via Platform API

```typescript
const token = await platform.user.createApiToken({
  name: 'My CLI Tool',
  description: 'Token for automated deployments',
  expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
});

console.log(`Token: ${token.token}`);
// Save this token securely!
```

## Session Management

### Login

```typescript
const platform = createPlatformClient({
  apiUrl: 'https://marvin.example.com',
  credentials: 'include',
});

// Login with email/password
await platform.session.login({
  email: 'user@example.com',
  password: 'secure-password',
});

// Session cookie is now set
const workspaces = await platform.workspaces.list();
```

### Refresh Token

Refresh your access token before it expires:

```typescript
try {
  const token = await platform.session.refresh();
  console.log('Token refreshed:', token.accessToken);
} catch (error) {
  console.error('Refresh failed, need to login again');
}
```

### Logout

```typescript
await platform.session.logout();
// Session cookie is cleared
```

### Check Authentication Status

```typescript
try {
  const user = await platform.user.getProfile();
  console.log(`Logged in as: ${user.email}`);
} catch (error) {
  console.log('Not authenticated');
}
```

## Security Best Practices

### Store Tokens Securely

**Never** commit tokens to version control:

```env
# .env (add to .gitignore!)
MARVIN_USER_TOKEN=marvin_ut_1234567890abcdef
```

```typescript
const platform = createPlatformClient({
  apiUrl: process.env.MARVIN_API_URL!,
  userToken: process.env.MARVIN_USER_TOKEN!,
});
```

### Rotate Tokens Regularly

Rotate tokens every 90 days:

```typescript
// Create new token
const newToken = await platform.user.createApiToken({
  name: 'Production Token (2026-Q3)',
  expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
});

// Update environment variables with new token
// Then revoke old token

// List existing tokens
const tokens = await platform.user.listApiTokens();

// Revoke old token
await platform.user.revokeApiToken(oldTokenId);
```

### Use Least Privilege

Create tokens with minimal required permissions:

```typescript
const readOnlyToken = await platform.user.createApiToken({
  name: 'Read-Only Reporter',
  permissions: ['read:entries', 'read:collections'],
});

const editorToken = await platform.user.createApiToken({
  name: 'Content Editor',
  permissions: ['read:*', 'write:entries', 'write:collections'],
});
```

### Token Expiration

Set expiration dates for tokens:

```typescript
const tempToken = await platform.user.createApiToken({
  name: 'Temporary Migration Token',
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
});
```

## Permissions & Roles

Platform API operations respect workspace roles:

| Role | Permissions |
|------|-------------|
| **Owner** | Full access (all operations) |
| **Admin** | Manage content, members, settings |
| **Editor** | Create, edit, publish content |
| **Contributor** | Create and edit drafts |
| **Viewer** | Read-only access |

### Check Current User Role

```typescript
const workspaces = await platform.workspaces.list();

workspaces.forEach(({ workspace, role }) => {
  console.log(`${workspace.name}: ${role}`);
});
```

### Handle Permission Errors

```typescript
try {
  await platform.workspaceMembers.create('my-workspace', {
    email: 'newuser@example.com',
    role: 'editor',
  });
} catch (error) {
  if (error.status === 403) {
    console.error('Permission denied: Admin role required');
  } else {
    throw error;
  }
}
```

## Multi-Workspace Authentication

### List Accessible Workspaces

```typescript
const workspaces = await platform.workspaces.list();

workspaces.forEach(({ workspace, role, isActive }) => {
  console.log(`${workspace.name} (${role})${isActive ? ' [ACTIVE]' : ''}`);
});
```

### Switch Active Workspace

```typescript
// Set active workspace
await platform.workspaces.setActive('my-other-workspace');

// Verify switch
const current = await platform.workspaces.getCurrent();
console.log(`Active workspace: ${current.name}`);
```

### Multi-Workspace Operations

```typescript
const workspaces = await platform.workspaces.list();

// Perform operations across all workspaces
for (const { workspace } of workspaces) {
  const entries = await platform.entries.list(workspace.slug);
  console.log(`${workspace.name}: ${entries.length} entries`);
}
```

## Error Handling

### Authentication Errors

```typescript
try {
  const workspaces = await platform.workspaces.list();
} catch (error) {
  if (error.status === 401) {
    console.error('Authentication failed: invalid token');
    // Redirect to login or refresh token
  } else if (error.status === 403) {
    console.error('Permission denied');
  } else {
    console.error('Unexpected error:', error.message);
  }
}
```

### Token Expiration

```typescript
async function fetchWithTokenRefresh<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (error.status === 401) {
      // Try refreshing token
      try {
        await platform.session.refresh();
        return await fn(); // Retry with new token
      } catch {
        throw new Error('Authentication expired, please login again');
      }
    }
    throw error;
  }
}

const workspaces = await fetchWithTokenRefresh(() => 
  platform.workspaces.list()
);
```

## Examples

### CLI Tool with User Token

```typescript
#!/usr/bin/env node
import { createPlatformClient } from '@inneropen/marvin-sdk/platform';

const platform = createPlatformClient({
  apiUrl: process.env.MARVIN_API_URL!,
  userToken: process.env.MARVIN_USER_TOKEN!,
});

async function main() {
  // List workspaces
  const workspaces = await platform.workspaces.list();
  console.log(`You have access to ${workspaces.length} workspaces`);

  // Perform operations
  for (const { workspace } of workspaces) {
    const entries = await platform.entries.list(workspace.slug);
    console.log(`${workspace.name}: ${entries.length} entries`);
  }
}

main().catch(console.error);
```

### SPA with Session Auth

```typescript
// lib/marvin.ts
import { createPlatformClient } from '@inneropen/marvin-sdk/platform';

export const platform = createPlatformClient({
  apiUrl: import.meta.env.PUBLIC_MARVIN_API_URL,
  credentials: 'include',
});

// components/Login.tsx
async function handleLogin(email: string, password: string) {
  try {
    await platform.session.login({ email, password });
    window.location.href = '/dashboard';
  } catch (error) {
    console.error('Login failed:', error.message);
  }
}

// components/Dashboard.tsx
async function loadDashboard() {
  try {
    const user = await platform.user.getProfile();
    const workspaces = await platform.workspaces.list();
    return { user, workspaces };
  } catch (error) {
    // Redirect to login if not authenticated
    window.location.href = '/login';
  }
}
```

## Next Steps

- [Workspaces](workspaces.md) - Workspace management
- [Platform Overview](overview.md) - Platform API basics
- [Security Best Practices](../reference/security.md) - Security guidelines
