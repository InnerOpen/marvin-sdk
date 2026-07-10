# Entries Module API Reference

## Overview

The Entries Module provides methods for fetching and working with entries (pages, posts, projects, etc.).

## Accessing the Module

```typescript
// Via workspace
const workspace = await marvin.getWorkspace();
const entriesModule = workspace.entries;

// Via client
const entriesModule = marvin.entries;
```

## Methods

### `list(options?)`

Get all entries with optional filtering.

```typescript
async list(options?: ListEntriesOptions): Promise<Entry[]>
```

**Parameters:**

```typescript
interface ListEntriesOptions {
  entryType?: string;    // Filter by entry type slug
  collection?: string;   // Filter by collection slug
  status?: string;       // Filter by status (default: 'published')
  limit?: number;        // Max results
  offset?: number;       // Pagination offset
}
```

**Returns:** `Promise<Entry[]>`

**Examples:**

```typescript
// All published entries
const entries = await marvin.entries.list();

// Filter by entry type
const pages = await marvin.entries.list({ entryType: 'page' });
const posts = await marvin.entries.list({ entryType: 'post' });

// Filter by collection
const featured = await marvin.entries.list({ collection: 'featured' });

// Filter by status
const drafts = await marvin.entries.list({ status: 'draft' });

// Pagination
const page1 = await marvin.entries.list({ limit: 10, offset: 0 });
const page2 = await marvin.entries.list({ limit: 10, offset: 10 });

// Combined filters
const featuredPosts = await marvin.entries.list({
  entryType: 'post',
  collection: 'featured',
  limit: 5,
});
```

### `get(slug)`

Get a single entry by slug.

```typescript
async get(slug: string): Promise<Entry>
```

**Parameters:**
- `slug: string` - Entry slug

**Returns:** `Promise<Entry>`

**Example:**
```typescript
const entry = await marvin.entries.get('about-us');
console.log(entry.title, entry.contentMarkdown);
```

### `pages(options?)`

Get all pages (shortcut for `list({ entryType: 'page' })`).

```typescript
async pages(options?: Omit<ListEntriesOptions, 'entryType'>): Promise<Entry[]>
```

**Example:**
```typescript
const pages = await marvin.entries.pages();
const recentPages = await marvin.entries.pages({ limit: 10 });
```

### `posts(options?)`

Get all blog posts (shortcut for `list({ entryType: 'post' })`).

```typescript
async posts(options?: Omit<ListEntriesOptions, 'entryType'>): Promise<Entry[]>
```

**Example:**
```typescript
const posts = await marvin.entries.posts();
const recentPosts = await marvin.entries.posts({ limit: 10 });
```

### `projects(options?)`

Get all projects (shortcut for `list({ entryType: 'project' })`).

```typescript
async projects(options?: Omit<ListEntriesOptions, 'entryType'>): Promise<Entry[]>
```

**Example:**
```typescript
const projects = await marvin.entries.projects();
const featuredProjects = await marvin.entries.projects({ 
  collection: 'featured' 
});
```

## Entry Object

### Properties

| Property | Type | Description |
|----------|------|-------------|
| `id` | `number` | Unique entry ID |
| `title` | `string` | Entry title |
| `slug` | `string` | URL-friendly slug |
| `summary` | `string \| null` | Short summary |
| `description` | `string \| null` | Meta description |
| `contentMarkdown` | `string \| null` | Raw Markdown content |
| `metadata` | `object` | Custom metadata |
| `status` | `string` | Entry status (draft, published, archived) |
| `publishedAt` | `Date \| null` | Publication date |
| `createdAt` | `Date` | Creation date |
| `updatedAt` | `Date` | Last update date |
| `entryTypeId` | `number` | Entry type ID |
| `entryType` | `object \| null` | Entry type object |
| `assets` | `Asset[]` | Related assets |
| `collections` | `Collection[]` | Parent collections |
| `resources` | `Resource[]` | Referenced resources |

### Methods

#### `toJSON()`

Get raw entry data.

```typescript
toJSON(): EntryData
```

**Example:**
```typescript
const entry = await marvin.entries.get('about');
const data = entry.toJSON();
console.log(data);
```

## Usage Examples

### List All Entries

```typescript
const entries = await marvin.entries.list();

for (const entry of entries) {
  console.log(`${entry.title} (${entry.status})`);
}
```

### Get Single Entry

```typescript
const entry = await marvin.entries.get('about-us');

console.log(`Title: ${entry.title}`);
console.log(`Slug: ${entry.slug}`);
console.log(`Published: ${entry.publishedAt}`);
console.log(`Content: ${entry.contentMarkdown}`);
```

### Filter by Entry Type

```typescript
// Get all pages
const pages = await marvin.entries.pages();

// Get all posts
const posts = await marvin.entries.posts();

// Get all projects
const projects = await marvin.entries.projects();

// Get custom entry type
const testimonials = await marvin.entries.list({ 
  entryType: 'testimonial' 
});
```

### Filter by Collection

```typescript
// Get featured entries
const featured = await marvin.entries.list({ 
  collection: 'featured' 
});

// Get featured posts
const featuredPosts = await marvin.entries.list({
  entryType: 'post',
  collection: 'featured',
});
```

### Pagination

```typescript
// First page
const page1 = await marvin.entries.list({
  limit: 10,
  offset: 0,
});

// Second page
const page2 = await marvin.entries.list({
  limit: 10,
  offset: 10,
});

// Load all with pagination
const allEntries = [];
let offset = 0;
const limit = 100;

while (true) {
  const batch = await marvin.entries.list({ limit, offset });
  allEntries.push(...batch);
  
  if (batch.length < limit) break;
  offset += limit;
}
```

### Working with Entry Content

```typescript
import { marked } from 'marked';

const entry = await marvin.entries.get('blog-post');

// Render Markdown
const html = marked.parse(entry.contentMarkdown ?? '');

// Access metadata
const { author, tags, featured } = entry.metadata;

// Access relationships
const images = entry.assets.filter(a => a.mimeType.startsWith('image/'));
const collections = entry.collections.map(c => c.name);
const resources = entry.resources.filter(r => r.resourceType === 'fabric');
```

### Build Site Navigation

```typescript
const pages = await marvin.entries.pages();

const nav = pages.map(page => ({
  href: `/${page.slug}`,
  label: page.title,
}));
```

### Recent Blog Posts

```typescript
const recentPosts = await marvin.entries.posts({ limit: 5 });

for (const post of recentPosts) {
  console.log(`${post.title} - ${post.publishedAt?.toLocaleDateString()}`);
}
```

## Type Definitions

### `Entry`

```typescript
interface Entry {
  id: number;
  title: string;
  slug: string;
  summary: string | null;
  description: string | null;
  contentMarkdown: string | null;
  metadata: Record<string, any>;
  status: string;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  entryTypeId: number;
  entryType: EntryType | null;
  assets: Asset[];
  collections: Collection[];
  resources: Resource[];
  
  toJSON(): EntryData;
}
```

### `ListEntriesOptions`

```typescript
interface ListEntriesOptions {
  entryType?: string;
  collection?: string;
  status?: string;
  limit?: number;
  offset?: number;
}
```

## See Also

- [Entries Concept](../concepts/entries.md)
- [Collections Module](collections.md)
- [Assets Module](assets.md)
- [Resources Module](resources.md)
