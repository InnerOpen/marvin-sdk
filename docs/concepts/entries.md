# Entries

## Overview

**Entries** are the primary content type in Marvin. They represent pages, blog posts, projects, or any custom content you create.

```typescript
const entry = await marvin.entry('about-us');
```

## Entry Properties

### Basic Properties

| Property | Type | Description |
|----------|------|-------------|
| `id` | `number` | Unique entry ID |
| `title` | `string` | Entry title |
| `slug` | `string` | URL-friendly slug |
| `summary` | `string \| null` | Short summary |
| `description` | `string \| null` | Meta description |

### Content Properties

| Property | Type | Description |
|----------|------|-------------|
| `contentMarkdown` | `string \| null` | Raw Markdown content |
| `metadata` | `object` | Custom metadata |

### Status Properties

| Property | Type | Description |
|----------|------|-------------|
| `status` | `string` | Entry status (draft, published, archived) |
| `publishedAt` | `Date \| null` | Publication date |
| `createdAt` | `Date` | Creation date |
| `updatedAt` | `Date` | Last update date |

### Type Properties

| Property | Type | Description |
|----------|------|-------------|
| `entryTypeId` | `number` | Entry type ID |
| `entryType` | `object \| null` | Entry type object |

### Relationships

| Property | Type | Description |
|----------|------|-------------|
| `assets` | `Asset[]` | Related assets |
| `collections` | `Collection[]` | Parent collections |
| `resources` | `Resource[]` | Referenced resources |

## Entry Methods

### `toJSON()`

Get raw entry data:

```typescript
const entry = await marvin.entry('about');
const data = entry.toJSON();
console.log(data);
```

### Future Methods

Coming soon:

- `entry.relatedEntries()` - Get related entries
- `entry.update()` - Update entry content
- `entry.delete()` - Delete entry

## Fetching Entries

### Get Single Entry

```typescript
const entry = await marvin.entry('about-us');
console.log(entry.title, entry.contentMarkdown);
```

### List All Entries

```typescript
const entries = await marvin.entries.list();
```

### Filter by Entry Type

```typescript
const pages = await marvin.entries.list({
  entryType: 'page',
});

const posts = await marvin.entries.list({
  entryType: 'post',
});
```

### Filter by Collection

```typescript
const featuredEntries = await marvin.entries.list({
  collection: 'featured',
});
```

### Filter by Status

```typescript
const published = await marvin.entries.list({
  status: 'published',
});

const drafts = await marvin.entries.list({
  status: 'draft',
});
```

### Pagination

```typescript
const page1 = await marvin.entries.list({
  limit: 10,
  offset: 0,
});

const page2 = await marvin.entries.list({
  limit: 10,
  offset: 10,
});
```

## Convenience Methods

The SDK provides shortcuts for common entry types:

### Pages

```typescript
const pages = await marvin.pages();
// Equivalent to:
// await marvin.entries.list({ entryType: 'page' })
```

### Blog Posts

```typescript
const posts = await marvin.posts({ limit: 10 });
// Equivalent to:
// await marvin.entries.list({ entryType: 'post', limit: 10 })
```

### Projects

```typescript
const projects = await marvin.projects();
// Equivalent to:
// await marvin.entries.list({ entryType: 'project' })
```

## Working with Entry Content

### Render Markdown

```typescript
import { marked } from 'marked';

const entry = await marvin.entry('about');
const html = marked.parse(entry.contentMarkdown ?? '');
```

### Extract Metadata

```typescript
const entry = await marvin.entry('about');
const { author, tags, featured } = entry.metadata;
```

### Access Assets

```typescript
const entry = await marvin.entry('project-showcase');

// Get all assets
const assets = entry.assets;

// Filter images
const images = entry.assets.filter(a => a.mimeType.startsWith('image/'));

// Get featured image
const featured = entry.assets.find(a => a.metadata?.featured === true);
```

### Access Collections

```typescript
const entry = await marvin.entry('blog-post');

// Get all collections
const collections = entry.collections;

// Check if in specific collection
const isFeatured = entry.collections.some(c => c.slug === 'featured');
```

### Access Resources

```typescript
const entry = await marvin.entry('sewing-project');

// Get all resources
const resources = entry.resources;

// Filter by resource type
const fabrics = entry.resources.filter(r => r.resourceType === 'fabric');
const tools = entry.resources.filter(r => r.resourceType === 'tool');
```

## Example Usage

### Astro Static Site

```typescript
---
import { marked } from 'marked';
import { createMarvinClient } from '@inneropen/marvin-sdk';

const marvin = createMarvinClient();

export async function getStaticPaths() {
  const pages = await marvin.pages();
  
  return pages.map((page) => ({
    params: { slug: page.slug },
    props: { page },
  }));
}

const { page } = Astro.props;
const contentHtml = marked.parse(page.contentMarkdown ?? '');
---

<article>
  <h1>{page.title}</h1>
  {page.summary && <p class="summary">{page.summary}</p>}
  <div set:html={contentHtml} />
  
  {page.assets.length > 0 && (
    <div class="gallery">
      {page.assets.map(asset => (
        <img src={asset.url} alt={asset.altText} />
      ))}
    </div>
  )}
</article>
```

### Next.js Blog

```typescript
// app/blog/[slug]/page.tsx
import { createMarvinClient } from '@inneropen/marvin-sdk';
import { marked } from 'marked';

const marvin = createMarvinClient();

export async function generateStaticParams() {
  const posts = await marvin.posts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function BlogPost({ params }: { params: { slug: string } }) {
  const post = await marvin.entry(params.slug);
  const contentHtml = marked.parse(post.contentMarkdown ?? '');
  
  return (
    <article>
      <h1>{post.title}</h1>
      <time>{post.publishedAt?.toLocaleDateString()}</time>
      <div dangerouslySetInnerHTML={{ __html: contentHtml }} />
    </article>
  );
}
```

### Express API

```typescript
import express from 'express';
import { createMarvinClient } from '@inneropen/marvin-sdk';

const app = express();
const marvin = createMarvinClient();

app.get('/api/entries', async (req, res) => {
  const entries = await marvin.entries.list({
    status: 'published',
    limit: parseInt(req.query.limit as string) || 10,
  });
  res.json(entries);
});

app.get('/api/entries/:slug', async (req, res) => {
  const entry = await marvin.entry(req.params.slug);
  res.json(entry.toJSON());
});
```

## Next Steps

- [Collections Concept](collections.md)
- [Assets Concept](assets.md)
- [Resources Concept](resources.md)
- [API Reference](../api/entries.md)
