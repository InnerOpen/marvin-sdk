# Admin API

Admin operations for managing users, system configuration, and maintenance tasks.

!!! warning "Super Admin Required"
    Admin API operations require `SUPER_ADMIN` role. Regular workspace admins cannot access these endpoints.

## Admin Modules

The Platform API includes three admin modules:

| Module | Purpose |
|--------|---------|
| `adminUsers` | Global user management |
| `adminSystem` | System configuration |
| `adminMaintenance` | Storage and system statistics |

## User Management

### List All Users

```typescript
const users = await platform.adminUsers.list();

users.forEach(user => {
  console.log(`${user.email} (${user.role}) - ${user.isActive ? 'Active' : 'Inactive'}`);
});
```

### Get User by ID

```typescript
const user = await platform.adminUsers.get('user-123');
console.log(`${user.name}: ${user.email}`);
```

### Create User

```typescript
const user = await platform.adminUsers.create({
  email: 'newuser@example.com',
  name: 'New User',
  password: 'secure-password',
  role: 'user',
  isActive: true,
});
```

### Update User

```typescript
await platform.adminUsers.update('user-123', {
  role: 'admin',
  isActive: false,
});
```

### Delete User

```typescript
await platform.adminUsers.delete('user-123');
```

## System Configuration

### Get System Settings

```typescript
const settings = await platform.adminSystem.getSettings();
console.log('Settings:', settings);
```

### Update System Settings

```typescript
await platform.adminSystem.updateSettings({
  allowSignups: false,
  requireEmailVerification: true,
  maxWorkspacesPerUser: 10,
});
```

### Get System Stats

```typescript
const stats = await platform.adminSystem.getStats();

console.log(`Total users: ${stats.userCount}`);
console.log(`Total workspaces: ${stats.workspaceCount}`);
console.log(`Total entries: ${stats.entryCount}`);
```

## Maintenance Operations

`adminMaintenance` is read-only: storage use and system statistics.

```typescript
const summary = await platform.adminMaintenance.getSummary(); // data directory size
const storage = await platform.adminMaintenance.getStorage(); // temp, backups, seeds, plugins
const stats = await platform.adminMaintenance.getStats();     // counts and sizes
```

Cleanup runs as **system scheduled tasks**, which keep a run history: `cleanup_temp_files`,
`prune_revoked_tokens`, `prune_event_logs`, `prune_ai_executions`, `prune_scheduled_task_executions`, and
`optimize_database` (VACUUM + ANALYZE; disabled, for on-demand runs). Run one now:

```typescript
const tasks = await platform.adminScheduledTasks.list();
const vacuum = tasks.find((t) => t.slug === 'optimize_database');
if (vacuum) await platform.adminScheduledTasks.execute(vacuum.id);
```

## Examples

### User Audit

```typescript
async function auditUsers() {
  const users = await platform.adminUsers.list();
  
  console.log('User Audit Report');
  console.log('=================');
  
  const byRole = users.reduce((acc, user) => {
    acc[user.role] = (acc[user.role] || 0) + 1;
    return acc;
  }, {});
  
  Object.entries(byRole).forEach(([role, count]) => {
    console.log(`${role}: ${count}`);
  });
  
  const inactive = users.filter(u => !u.isActive);
  console.log(`\nInactive users: ${inactive.length}`);
}
```

### Cleanup Inactive Users

```typescript
async function cleanupInactiveUsers(daysInactive = 90) {
  const users = await platform.adminUsers.list();
  const cutoff = new Date(Date.now() - daysInactive * 24 * 60 * 60 * 1000);
  
  for (const user of users) {
    const lastActive = new Date(user.lastActiveAt);
    
    if (lastActive < cutoff && !user.isActive) {
      console.log(`Deleting inactive user: ${user.email}`);
      await platform.adminUsers.delete(user.id);
    }
  }
}
```

### System Health Check

```typescript
async function systemHealthCheck() {
  const stats = await platform.adminSystem.getStats();
  
  console.log('System Health Check');
  console.log('==================');
  console.log(`Users: ${stats.userCount}`);
  console.log(`Workspaces: ${stats.workspaceCount}`);
  console.log(`Entries: ${stats.entryCount}`);
  console.log(`Assets: ${stats.assetCount}`);
  
  // Check for issues
  if (stats.errorRate > 0.01) {
    console.warn('Warning: High error rate!');
  }
  
  if (stats.diskUsage > 0.9) {
    console.error('Alert: Disk usage > 90%!');
  }
}
```

## Next Steps

- [Platform Overview](overview.md) - Platform API basics
- [Workspaces](workspaces.md) - Workspace management
- [Authentication](auth.md) - Session management
