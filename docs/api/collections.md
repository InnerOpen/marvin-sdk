# Collections Module API Reference

## Overview

The Collections Module provides methods for fetching and working with collections.

## Accessing the Module

```typescript
// Via workspace
const workspace = await marvin.getWorkspace();
const collectionsModule = workspace.collections;

// Via client
const collectionsModule = marvin.collections;
```

## Methods

### `list()`

Get all collections.

```typescript
async list(): Promise<Collection[]>
```

**Returns:** `Promise<Collection[]>`

**Example:**
```typescript
const collections = await marvin.collections.list();

for (const collection of collections) {
  console.log(`${collection.name} (${collection.slug})`);
}
```

### `get(slug)`

Get a single collection by slug.

```typescript
async get(slug: string): Promise<Collection>
```

**Parameters:**
- `slug: string` - Collection slug

**Returns:** `Promise<Collection>`

**Example:**
```typescript
const collection = await marvin.collections.get('featured');
console.log(collection.name, collection.description);
```

### `entries(slug)`

Get all entries in a collection.

```typescript
async entries(slug: string): Promise<Entry[]>
```

**Parameters:**
- `slug: string` - Collection slug

**Returns:** `Promise<Entry[]>`

**Example:**
```typescript
const entries = await marvin.collections.entries('projects');

for (const entry of entries) {
  console.log(entry.title);
}
```

## Collection Object

### Properties

| Property | Type | Description |
|----------|------|-------------|
| `id` | `number` | Unique collection ID |
| `name` | `string` | Collection name |
| `slug` | `string` | URL-friendly slug |
| `description` | `string \| null` | Collection description |
| `icon` | `string \| null` | Icon identifier |
| `color` | `string \| null` | Color hex code |
| `sortOrder` | `number` | Display order |
| `isSmart` | `boolean` | Is this a smart collection? |
| `smartRules` | `object \| null` | Smart collection rules |
| `createdAt` | `Date` | Creation date |
| `updatedAt` | `Date` | Last update date |

### Methods

#### `entries()`

Get all entries in the collection.

```typescript
async entries(): Promise<Entry[]>
```

**Example:**
```typescript
const collection = await marvin.collections.get('featured');
const entries = await collection.entries();

for (const entry of entries) {
  console.log(entry.title);
}
```

#### `toJSON()`

Get raw collection data.

```typescript
toJSON(): CollectionData
```

**Example:**
```typescript
const collection = await marvin.collections.get('projects');
const data = collection.toJSON();
console.log(data);
```

## Usage Examples

### List All Collections

```typescript
const collections = await marvin.collections.list();

for (const collection of collections) {
  console.log(`${collection.name} - ${collection.description}`);
  console.log(`  Smart: ${collection.isSmart}`);
  console.log(`  Icon: ${collection.icon}`);
  console.log(`  Color: ${collection.color}`);
}
```

### Get Single Collection

```typescript
const collection = await marvin.collections.get('featured');

console.log(`Name: ${collection.name}`);
console.log(`Description: ${collection.description}`);
console.log(`Smart Collection: ${collection.isSmart}`);

if (collection.isSmart) {
  console.log('Rules:', collection.smartRules);
}
```

### Get Collection Entries

```typescript
// Method 1: Via collection object
const collection = await marvin.collections.get('projects');
const entries = await collection.entries();

// Method 2: Via collections module
const entries2 = await marvin.collections.entries('projects');
```

### Check if Collection is Smart

```typescript
const collection = await marvin.collections.get('recent-posts');

if (collection.isSmart) {
  console.log('This is a smart collection');
  console.log('Rules:', collection.smartRules);
} else {
  console.log('This is a manual collection');
}
```

### Build Collection Navigation

```typescript
const collections = await marvin.collections.list();

const nav = collections.map(collection => ({
  href: `/collections/${collection.slug}`,
  label: collection.name,
  icon: collection.icon,
  color: collection.color,
}));
```

### Display Collection with Entries

```typescript
const collection = await marvin.collections.get('featured');
const entries = await collection.entries();

console.log(`# ${collection.name}`);
if (collection.description) {
  console.log(collection.description);
}

console.log(`\n${entries.length} entries:`);
for (const entry of entries) {
  console.log(`- ${entry.title}`);
}
```

### Filter Collections

```typescript
const collections = await marvin.collections.list();

// Manual collections only
const manual = collections.filter(c => !c.isSmart);

// Smart collections only
const smart = collections.filter(c => c.isSmart);

// Collections with icons
const withIcons = collections.filter(c => c.icon);
```

### Sort Collections

```typescript
const collections = await marvin.collections.list();

// Sort by sort order
const sorted = collections.sort((a, b) => a.sortOrder - b.sortOrder);

// Sort by name
const byName = collections.sort((a, b) => 
  a.name.localeCompare(b.name)
);
```

## Manual vs Smart Collections

### Manual Collections

Manual collections are curated by hand:

```typescript
const collection = await marvin.collections.get('featured');

console.log(collection.isSmart); // false
console.log(collection.smartRules); // null

// Entries are manually added
const entries = await collection.entries();
```

### Smart Collections

Smart collections use rules to automatically include entries:

```typescript
const collection = await marvin.collections.get('recent-posts');

console.log(collection.isSmart); // true
console.log(collection.smartRules); // { entryType: 'post', ... }

// Entries are automatically filtered
const entries = await collection.entries();
```

## Type Definitions

### `Collection`

```typescript
interface Collection {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  sortOrder: number;
  isSmart: boolean;
  smartRules: SmartRules | null;
  createdAt: Date;
  updatedAt: Date;
  
  entries(): Promise<Entry[]>;
  toJSON(): CollectionData;
}
```

### `SmartRules`

```typescript
interface SmartRules {
  entryType?: string;
  status?: string;
  tags?: string[];
  // Additional rule fields
}
```

## See Also

- [Collections Concept](../concepts/collections.md)
- [Entries Module](entries.md)
- [Workspace API](workspace.md)
