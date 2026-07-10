# Quick Start

This guide will get you started with the Marvin SDK in 5 minutes.

## 1. Install the SDK

```bash
npm install @inneropen/marvin-sdk
```

## 2. Configure Environment

Create a `.env` file:

```env
MARVIN_API_URL=https://marvin.example.com
MARVIN_SITE_CLIENT_TOKEN=your-token-here
MARVIN_WORKSPACE_SLUG=your-workspace
```

## 3. Create a Client

```typescript
import { createMarvinClient } from '@inneropen/marvin-sdk';

const marvin = createMarvinClient();
```

## 4. Fetch Content

### Get Workspace

```typescript
const workspace = await marvin.getWorkspace();
console.log(workspace.site?.title);
```

### Get Entries

```typescript
// List all entries
const entries = await marvin.entries.list();

// Get a specific entry
const entry = await marvin.entry('about-us');
console.log(entry.title, entry.contentMarkdown);
```

### Get Collections

```typescript
// Get a collection
const projects = await marvin.collection('projects');

// Get collection entries
const projectEntries = await projects.entries();
```

## API Styles

The SDK supports three API styles:

### 1. Workspace API (Recommended)

```typescript
const workspace = await marvin.getWorkspace();
const entries = await workspace.entries.list();
const collection = await workspace.collections.get('featured');
```

### 2. Convenience API

```typescript
const entry = await marvin.entry('about');
const projects = await marvin.projects();
const pages = await marvin.pages();
```

### 3. Backwards-Compatible API

```typescript
// Still works! (Deprecated but supported)
const site = await marvin.getSite();
const entries = await marvin.getEntries();
const entry = await marvin.getEntry('about');
```

## Common Use Cases

### Blog Posts

```typescript
const posts = await marvin.posts({ limit: 10 });

for (const post of posts) {
  console.log(`${post.title} - ${post.publishedAt}`);
}
```

### Pages

```typescript
const pages = await marvin.pages();

for (const page of pages) {
  console.log(`/${page.slug} - ${page.title}`);
}
```

### Assets

```typescript
const images = await marvin.assets.images();

for (const image of images) {
  console.log(`${image.filename} - ${image.url}`);
}
```

### Resources

```typescript
const resources = await marvin.resources.list();

const fabric = await marvin.resource('kuroki-s022');
const entries = await fabric.entries();
```

## Next Steps

- [Core Concepts](../concepts/architecture.md) - Understand Marvin's architecture
- [API Reference](../api/client.md) - Complete API documentation
- [Guides](../guides/astro.md) - Integration guides for popular frameworks
- [Examples](../examples.md) - Real-world examples
