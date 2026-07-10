# Workspace

## Overview

The **Workspace** is the root object in the Marvin SDK. Everything starts here.

```typescript
const workspace = await marvin.getWorkspace();
```

## Workspace Properties

### `slug`

The workspace slug (string).

```typescript
console.log(workspace.slug); // 'my-workspace'
```

### `site`

Site configuration (cached after `initialize()`).

```typescript
console.log(workspace.site?.title);
console.log(workspace.site?.description);
console.log(workspace.site?.url);
```

## Workspace Modules

The workspace provides access to all content modules:

### Entries Module

```typescript
workspace.entries.list()
workspace.entries.get('slug')
workspace.entries.pages()
workspace.entries.posts()
```

[Learn more about Entries](entries.md)

### Collections Module

```typescript
workspace.collections.list()
workspace.collections.get('slug')
workspace.collections.entries('slug')
```

[Learn more about Collections](collections.md)

### Assets Module

```typescript
workspace.assets.list()
workspace.assets.images()
workspace.assets.videos()
```

[Learn more about Assets](assets.md)

### Resources Module

```typescript
workspace.resources.list()
workspace.resources.get('slug')
workspace.resources.entries('slug')
```

[Learn more about Resources](resources.md)

## Workspace Methods

### `getInfo()`

Get basic workspace information (name and slug):

```typescript
const info = await workspace.getInfo();
console.log(info.name, info.slug);
```

**Returns:**
```typescript
{
  slug: string;
  name: string;
}
```

### `loadSite()`

Load or reload site configuration from the API:

```typescript
await workspace.loadSite();
console.log(workspace.site?.title);
```

Use this to:
- Force refresh cached site data
- Reload after site configuration changes

## Initialization

### Auto-Initialize

```typescript
const marvin = createMarvinClient({
  autoInitialize: true,
});

const workspace = await marvin.getWorkspace();
// Site is already loaded
console.log(workspace.site?.title);
```

### Manual Initialize

```typescript
const marvin = createMarvinClient();
await marvin.initialize();

const workspace = await marvin.getWorkspace();
// Site is loaded after initialize()
console.log(workspace.site?.title);
```

### Lazy Loading

```typescript
const marvin = createMarvinClient();
const workspace = await marvin.getWorkspace();

// Site is not loaded yet
console.log(workspace.site); // undefined

// Load site on demand
await workspace.loadSite();
console.log(workspace.site?.title);
```

## Caching

Site configuration is cached to improve performance:

```typescript
const marvin = createMarvinClient({
  cacheDuration: 10 * 60 * 1000, // 10 minutes
});

const workspace = await marvin.getWorkspace();
await workspace.loadSite();

// Cached for 10 minutes
console.log(workspace.site?.title);
```

## Working with Multiple Workspaces

You can create multiple clients for different workspaces:

```typescript
const production = createMarvinClient({
  workspaceSlug: 'production',
});

const staging = createMarvinClient({
  workspaceSlug: 'staging',
});

const prodWorkspace = await production.getWorkspace();
const stagingWorkspace = await staging.getWorkspace();
```

## Example Usage

### Static Site Generator

```typescript
// Astro example
import { createMarvinClient } from '@inneropen/marvin-sdk';

const marvin = createMarvinClient({
  autoInitialize: true,
});

export async function getStaticPaths() {
  const workspace = await marvin.getWorkspace();
  const pages = await workspace.entries.pages();
  
  return pages.map((page) => ({
    params: { slug: page.slug },
    props: { page },
  }));
}
```

### Server Application

```typescript
// Express example
import express from 'express';
import { createMarvinClient } from '@inneropen/marvin-sdk';

const app = express();
const marvin = createMarvinClient();

app.get('/api/site', async (req, res) => {
  const workspace = await marvin.getWorkspace();
  res.json(workspace.site);
});

app.get('/api/entries', async (req, res) => {
  const workspace = await marvin.getWorkspace();
  const entries = await workspace.entries.list();
  res.json(entries);
});
```

### CLI Tool

```typescript
#!/usr/bin/env node
import { createMarvinClient } from '@inneropen/marvin-sdk';

const marvin = createMarvinClient();

async function main() {
  const workspace = await marvin.getWorkspace();
  await workspace.loadSite();
  
  console.log('Site:', workspace.site?.title);
  
  const entries = await workspace.entries.list();
  console.log(`Found ${entries.length} entries`);
}

main().catch(console.error);
```

## Next Steps

- [Entries Concept](entries.md)
- [Collections Concept](collections.md)
- [API Reference](../api/workspace.md)
