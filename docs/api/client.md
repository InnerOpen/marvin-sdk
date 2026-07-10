# Client API Reference

## `createMarvinClient(config?)`

Create a new Marvin client instance.

### Parameters

```typescript
interface MarvinClientConfig {
  apiUrl?: string;
  siteClientToken?: string;
  workspaceSlug?: string;
  autoInitialize?: boolean;
  cacheDuration?: number;
}
```

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `apiUrl` | `string` | Yes | `process.env.MARVIN_API_URL` | Marvin API URL |
| `siteClientToken` | `string` | Yes | `process.env.MARVIN_SITE_CLIENT_TOKEN` | Site client token |
| `workspaceSlug` | `string` | Yes | `process.env.MARVIN_WORKSPACE_SLUG` | Workspace slug |
| `autoInitialize` | `boolean` | No | `false` | Auto-initialize on creation |
| `cacheDuration` | `number` | No | `300000` (5 min) | Cache duration in ms |

### Returns

Returns a `MarvinClient` instance.

### Example

```typescript
import { createMarvinClient } from '@inneropen/marvin-sdk';

const marvin = createMarvinClient({
  apiUrl: 'https://marvin.example.com',
  siteClientToken: 'msc_1234567890abcdef',
  workspaceSlug: 'my-workspace',
  autoInitialize: true,
  cacheDuration: 10 * 60 * 1000, // 10 minutes
});
```

## Client Instance Methods

### `initialize()`

Initialize the SDK and preload workspace data.

```typescript
await marvin.initialize();
```

### `getWorkspace()`

Get the workspace object.

```typescript
const workspace = await marvin.getWorkspace();
```

**Returns:** `Promise<Workspace>`

### `getWorkspaceInfo()`

Get basic workspace information (name and slug only).

```typescript
const info = await marvin.getWorkspaceInfo();
console.log(info.slug, info.name);
```

**Returns:** `Promise<{ slug: string; name: string }>`

## Convenience Methods

### `entry(slug)`

Get a single entry by slug.

```typescript
const entry = await marvin.entry('about-us');
```

**Parameters:**
- `slug: string` - Entry slug

**Returns:** `Promise<Entry>`

### `collection(slug)`

Get a single collection by slug.

```typescript
const collection = await marvin.collection('projects');
```

**Parameters:**
- `slug: string` - Collection slug

**Returns:** `Promise<Collection>`

### `resource(slug)`

Get a single resource by slug.

```typescript
const resource = await marvin.resource('kuroki-s022');
```

**Parameters:**
- `slug: string` - Resource slug

**Returns:** `Promise<Resource>`

### `pages(options?)`

Get all pages.

```typescript
const pages = await marvin.pages();
```

**Parameters:**
- `options?: ListOptions` - Optional filter options

**Returns:** `Promise<Entry[]>`

### `posts(options?)`

Get all blog posts.

```typescript
const posts = await marvin.posts({ limit: 10 });
```

**Parameters:**
- `options?: ListOptions` - Optional filter options

**Returns:** `Promise<Entry[]>`

### `projects(options?)`

Get all projects.

```typescript
const projects = await marvin.projects();
```

**Parameters:**
- `options?: ListOptions` - Optional filter options

**Returns:** `Promise<Entry[]>`

## Client Properties

### `site`

Site configuration (cached after `initialize()`).

```typescript
console.log(marvin.site?.title);
console.log(marvin.site?.description);
```

### `entries`

Entries module.

```typescript
const entries = await marvin.entries.list();
```

See [Entries Module](entries.md) for details.

### `collections`

Collections module.

```typescript
const collections = await marvin.collections.list();
```

See [Collections Module](collections.md) for details.

### `assets`

Assets module.

```typescript
const images = await marvin.assets.images();
```

See [Assets Module](assets.md) for details.

### `resources`

Resources module.

```typescript
const resources = await marvin.resources.list();
```

See [Resources Module](resources.md) for details.

## Backwards-Compatible Methods

These methods are deprecated but still supported:

### `getSite()`

Get site configuration.

```typescript
const site = await marvin.getSite();
```

!!! warning "Deprecated"
    Use `getWorkspace()` instead.

### `getEntries(options?)`

Get all entries.

```typescript
const entries = await marvin.getEntries();
```

!!! warning "Deprecated"
    Use `entries.list()` instead.

### `getEntry(slug)`

Get a single entry.

```typescript
const entry = await marvin.getEntry('about');
```

!!! warning "Deprecated"
    Use `entry(slug)` instead.

## Type Definitions

See [TypeScript Types](../reference/types.md) for complete type definitions.

## Next Steps

- [Workspace API](workspace.md)
- [Entries Module](entries.md)
- [Collections Module](collections.md)
- [Assets Module](assets.md)
- [Resources Module](resources.md)
