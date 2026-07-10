# Collections

## Overview

**Collections** organize and group entries in Marvin. They can be manual (curated) or smart (rule-based).

```typescript
const collection = await marvin.collection('projects');
const entries = await collection.entries();
```

## Collection Properties

### Basic Properties

| Property | Type | Description |
|----------|------|-------------|
| `id` | `number` | Unique collection ID |
| `name` | `string` | Collection name |
| `slug` | `string` | URL-friendly slug |
| `description` | `string \| null` | Collection description |

### Display Properties

| Property | Type | Description |
|----------|------|-------------|
| `icon` | `string \| null` | Icon identifier |
| `color` | `string \| null` | Color hex code |
| `sortOrder` | `number` | Display order |

### Smart Collection Properties

| Property | Type | Description |
|----------|------|-------------|
| `isSmart` | `boolean` | Is this a smart collection? |
| `smartRules` | `object \| null` | Smart collection rules |

### Metadata

| Property | Type | Description |
|----------|------|-------------|
| `createdAt` | `Date` | Creation date |
| `updatedAt` | `Date` | Last update date |

## Collection Methods

### `entries()`

Get all entries in the collection:

```typescript
const collection = await marvin.collection('featured');
const entries = await collection.entries();

for (const entry of entries) {
  console.log(entry.title);
}
```

### `toJSON()`

Get raw collection data:

```typescript
const collection = await marvin.collection('projects');
const data = collection.toJSON();
console.log(data);
```

### Future Methods

Coming soon:

- `collection.assets()` - Get collection assets
- `collection.metadata()` - Get collection metadata

## Fetching Collections

### Get Single Collection

```typescript
const collection = await marvin.collection('featured');
console.log(collection.name, collection.description);
```

### List All Collections

```typescript
const collections = await marvin.collections.list();

for (const collection of collections) {
  console.log(collection.name);
}
```

### Get Collection Entries

```typescript
const collection = await marvin.collection('projects');
const entries = await collection.entries();
```

Or use the convenience method:

```typescript
const entries = await marvin.collections.entries('projects');
```

## Manual vs Smart Collections

### Manual Collections

Manual collections are curated by hand:

```typescript
const collection = await marvin.collection('featured');
console.log(collection.isSmart); // false

const entries = await collection.entries();
```

### Smart Collections

Smart collections use rules to automatically include entries:

```typescript
const collection = await marvin.collection('recent-posts');
console.log(collection.isSmart); // true
console.log(collection.smartRules);

// Smart collections automatically include matching entries
const entries = await collection.entries();
```

## Working with Collections

### Display Collection Metadata

```typescript
const collection = await marvin.collection('projects');

console.log(`Name: ${collection.name}`);
console.log(`Description: ${collection.description}`);
console.log(`Icon: ${collection.icon}`);
console.log(`Color: ${collection.color}`);
```

### Filter Entries by Collection

```typescript
// Get all entries in a collection
const projectEntries = await marvin.entries.list({
  collection: 'projects',
});

// Or via collection object
const collection = await marvin.collection('projects');
const entries = await collection.entries();
```

### Check Entry Collection Membership

```typescript
const entry = await marvin.entry('my-project');

// Get entry's collections
const collections = entry.collections;

// Check if entry is in a specific collection
const isFeatured = entry.collections.some(c => c.slug === 'featured');
```

## Example Usage

### Astro Collection Index

```typescript
---
import { createMarvinClient } from '@inneropen/marvin-sdk';

const marvin = createMarvinClient();
const collection = await marvin.collection('projects');
const entries = await collection.entries();
---

<div class="collection">
  <h1>{collection.name}</h1>
  {collection.description && <p>{collection.description}</p>}
  
  <div class="entries">
    {entries.map((entry) => (
      <article>
        <h2><a href={`/${entry.slug}`}>{entry.title}</a></h2>
        {entry.summary && <p>{entry.summary}</p>}
      </article>
    ))}
  </div>
</div>
```

### Next.js Collection Page

```typescript
// app/collections/[slug]/page.tsx
import { createMarvinClient } from '@inneropen/marvin-sdk';

const marvin = createMarvinClient();

export async function generateStaticParams() {
  const collections = await marvin.collections.list();
  return collections.map((collection) => ({
    slug: collection.slug,
  }));
}

export default async function CollectionPage({
  params,
}: {
  params: { slug: string };
}) {
  const collection = await marvin.collection(params.slug);
  const entries = await collection.entries();
  
  return (
    <div>
      <h1>{collection.name}</h1>
      {collection.description && <p>{collection.description}</p>}
      
      <div className="grid">
        {entries.map((entry) => (
          <article key={entry.id}>
            <h2>{entry.title}</h2>
            {entry.summary && <p>{entry.summary}</p>}
          </article>
        ))}
      </div>
    </div>
  );
}
```

### Express API

```typescript
import express from 'express';
import { createMarvinClient } from '@inneropen/marvin-sdk';

const app = express();
const marvin = createMarvinClient();

app.get('/api/collections', async (req, res) => {
  const collections = await marvin.collections.list();
  res.json(collections);
});

app.get('/api/collections/:slug', async (req, res) => {
  const collection = await marvin.collection(req.params.slug);
  res.json(collection.toJSON());
});

app.get('/api/collections/:slug/entries', async (req, res) => {
  const collection = await marvin.collection(req.params.slug);
  const entries = await collection.entries();
  res.json(entries);
});
```

## Next Steps

- [Entries Concept](entries.md)
- [Assets Concept](assets.md)
- [Resources Concept](resources.md)
- [API Reference](../api/collections.md)
