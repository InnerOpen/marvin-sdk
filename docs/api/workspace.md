# Workspace API Reference

## Overview

The Workspace API provides access to workspace-level operations and modules.

## Getting a Workspace

```typescript
const workspace = await marvin.getWorkspace();
```

## Properties

### `slug`

The workspace slug.

```typescript
workspace.slug: string
```

**Example:**
```typescript
console.log(workspace.slug); // 'my-workspace'
```

### `site`

Site configuration object (cached after initialization).

```typescript
workspace.site: Site | null
```

**Site Properties:**
- `title: string` - Site title
- `description: string | null` - Site description
- `url: string | null` - Site URL
- `metadata: object` - Custom metadata

**Example:**
```typescript
console.log(workspace.site?.title);
console.log(workspace.site?.description);
console.log(workspace.site?.url);
```

### `entries`

Entries module instance.

```typescript
workspace.entries: EntriesModule
```

See [Entries Module](entries.md) for details.

### `collections`

Collections module instance.

```typescript
workspace.collections: CollectionsModule
```

See [Collections Module](collections.md) for details.

### `assets`

Assets module instance.

```typescript
workspace.assets: AssetsModule
```

See [Assets Module](assets.md) for details.

### `resources`

Resources module instance.

```typescript
workspace.resources: ResourcesModule
```

See [Resources Module](resources.md) for details.

## Methods

### `getInfo()`

Get basic workspace information (name and slug).

```typescript
async getInfo(): Promise<WorkspaceInfo>
```

**Returns:**
```typescript
{
  slug: string;
  name: string;
}
```

**Example:**
```typescript
const info = await workspace.getInfo();
console.log(`${info.name} (${info.slug})`);
```

### `loadSite()`

Load or reload site configuration from the API.

```typescript
async loadSite(): Promise<void>
```

Use this to:
- Force refresh cached site data
- Reload after site configuration changes
- Manually load site when not auto-initialized

**Example:**
```typescript
// Force reload site configuration
await workspace.loadSite();
console.log(workspace.site?.title);
```

## Usage Examples

### Basic Usage

```typescript
import { createMarvinClient } from '@inneropen/marvin-sdk';

const marvin = createMarvinClient();
const workspace = await marvin.getWorkspace();

console.log(`Workspace: ${workspace.slug}`);
console.log(`Site: ${workspace.site?.title}`);
```

### Access Modules

```typescript
const workspace = await marvin.getWorkspace();

// Entries
const entries = await workspace.entries.list();

// Collections
const collections = await workspace.collections.list();

// Assets
const images = await workspace.assets.images();

// Resources
const resources = await workspace.resources.list();
```

### Reload Site Configuration

```typescript
const workspace = await marvin.getWorkspace();

// Initial load
await workspace.loadSite();
console.log(workspace.site?.title);

// Later, force reload
await workspace.loadSite();
console.log(workspace.site?.title); // Fresh data
```

### Check Workspace Info

```typescript
const workspace = await marvin.getWorkspace();
const info = await workspace.getInfo();

console.log(`Connected to: ${info.name}`);
console.log(`Workspace slug: ${info.slug}`);
```

## Type Definitions

### `Workspace`

```typescript
interface Workspace {
  slug: string;
  site: Site | null;
  entries: EntriesModule;
  collections: CollectionsModule;
  assets: AssetsModule;
  resources: ResourcesModule;
  
  getInfo(): Promise<WorkspaceInfo>;
  loadSite(): Promise<void>;
}
```

### `WorkspaceInfo`

```typescript
interface WorkspaceInfo {
  slug: string;
  name: string;
}
```

### `Site`

```typescript
interface Site {
  title: string;
  description: string | null;
  url: string | null;
  metadata: Record<string, any>;
}
```

## See Also

- [Client API](client.md)
- [Entries Module](entries.md)
- [Collections Module](collections.md)
- [Assets Module](assets.md)
- [Resources Module](resources.md)
