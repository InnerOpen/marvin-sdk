# Resources Module API Reference

## Overview

The Resources Module provides methods for fetching and working with reusable structured objects (fabrics, tools, suppliers, repositories, etc.).

## Accessing the Module

```typescript
// Via workspace
const workspace = await marvin.getWorkspace();
const resourcesModule = workspace.resources;

// Via client
const resourcesModule = marvin.resources;
```

## Methods

### `list(options?)`

Get all resources with optional filtering.

```typescript
async list(options?: ListResourcesOptions): Promise<Resource[]>
```

**Parameters:**

```typescript
interface ListResourcesOptions {
  resourceType?: string;  // Filter by resource type
  limit?: number;         // Max results
  offset?: number;        // Pagination offset
}
```

**Returns:** `Promise<Resource[]>`

**Examples:**

```typescript
// All resources
const resources = await marvin.resources.list();

// Filter by type
const fabrics = await marvin.resources.list({ resourceType: 'fabric' });
const tools = await marvin.resources.list({ resourceType: 'tool' });
const suppliers = await marvin.resources.list({ resourceType: 'supplier' });

// Pagination
const page1 = await marvin.resources.list({ limit: 20, offset: 0 });
const page2 = await marvin.resources.list({ limit: 20, offset: 20 });
```

### `get(slug)`

Get a single resource by slug.

```typescript
async get(slug: string): Promise<Resource>
```

**Parameters:**
- `slug: string` - Resource slug

**Returns:** `Promise<Resource>`

**Example:**
```typescript
const resource = await marvin.resources.get('kuroki-s022');
console.log(resource.name, resource.description);
```

### `entries(slug)`

Get all entries that reference a resource.

```typescript
async entries(slug: string): Promise<Entry[]>
```

**Parameters:**
- `slug: string` - Resource slug

**Returns:** `Promise<Entry[]>`

**Example:**
```typescript
const entries = await marvin.resources.entries('kuroki-s022');

for (const entry of entries) {
  console.log(`${entry.title} uses this resource`);
}
```

## Resource Object

### Properties

| Property | Type | Description |
|----------|------|-------------|
| `id` | `number` | Unique resource ID |
| `name` | `string` | Resource name |
| `slug` | `string` | URL-friendly slug |
| `resourceType` | `string` | Type of resource |
| `description` | `string \| null` | Resource description |
| `externalId` | `string \| null` | External system ID |
| `url` | `string \| null` | External URL |
| `metadata` | `object` | Custom metadata |
| `createdAt` | `Date` | Creation date |
| `updatedAt` | `Date` | Last update date |

### Methods

#### `entries()`

Get all entries that reference this resource.

```typescript
async entries(): Promise<Entry[]>
```

**Example:**
```typescript
const resource = await marvin.resources.get('kuroki-s022');
const entries = await resource.entries();

console.log(`Used in ${entries.length} entries`);
```

#### `toJSON()`

Get raw resource data.

```typescript
toJSON(): ResourceData
```

**Example:**
```typescript
const resource = await marvin.resources.get('kuroki-s022');
const data = resource.toJSON();
console.log(data);
```

## Usage Examples

### List All Resources

```typescript
const resources = await marvin.resources.list();

for (const resource of resources) {
  console.log(`${resource.name} (${resource.resourceType})`);
  console.log(`  ${resource.description}`);
}
```

### Get Single Resource

```typescript
const resource = await marvin.resources.get('kuroki-s022');

console.log(`Name: ${resource.name}`);
console.log(`Type: ${resource.resourceType}`);
console.log(`Description: ${resource.description}`);
console.log(`URL: ${resource.url}`);
console.log(`External ID: ${resource.externalId}`);
```

### Filter by Resource Type

```typescript
// Get all fabrics
const fabrics = await marvin.resources.list({ resourceType: 'fabric' });

// Get all tools
const tools = await marvin.resources.list({ resourceType: 'tool' });

// Get all suppliers
const suppliers = await marvin.resources.list({ resourceType: 'supplier' });

// Get all repositories
const repos = await marvin.resources.list({ resourceType: 'repository' });
```

### Get Resource Entries

```typescript
// Method 1: Via resource object
const resource = await marvin.resources.get('kuroki-s022');
const entries = await resource.entries();

// Method 2: Via resources module
const entries2 = await marvin.resources.entries('kuroki-s022');

console.log(`This resource is used in ${entries.length} projects`);
```

### Resource Directory

```typescript
const fabrics = await marvin.resources.list({ resourceType: 'fabric' });

for (const fabric of fabrics) {
  console.log(`## ${fabric.name}`);
  console.log(fabric.description);
  
  if (fabric.metadata) {
    console.log(`Weight: ${fabric.metadata.weight} oz.`);
    console.log(`Composition: ${fabric.metadata.composition}`);
    console.log(`Origin: ${fabric.metadata.origin}`);
  }
  
  if (fabric.url) {
    console.log(`More info: ${fabric.url}`);
  }
  
  const entries = await fabric.entries();
  console.log(`Used in ${entries.length} projects\n`);
}
```

### Resource with Metadata

```typescript
const fabric = await marvin.resources.get('kuroki-s022');

// Standard properties
console.log(`Name: ${fabric.name}`);
console.log(`Type: ${fabric.resourceType}`);

// Custom metadata
if (fabric.metadata) {
  const { weight, composition, origin, color } = fabric.metadata;
  console.log(`\nSpecs:`);
  console.log(`  Weight: ${weight} oz.`);
  console.log(`  Composition: ${composition}`);
  console.log(`  Origin: ${origin}`);
  console.log(`  Color: ${color}`);
}
```

### Find Projects Using a Resource

```typescript
const fabric = await marvin.resources.get('kuroki-s022');
const projects = await fabric.entries();

console.log(`Projects using ${fabric.name}:`);

for (const project of projects) {
  console.log(`- ${project.title}`);
  console.log(`  ${project.summary}`);
  console.log(`  Published: ${project.publishedAt?.toLocaleDateString()}\n`);
}
```

### Resource Types

```typescript
const resources = await marvin.resources.list();

// Group by resource type
const byType = resources.reduce((acc, resource) => {
  const type = resource.resourceType;
  if (!acc[type]) acc[type] = [];
  acc[type].push(resource);
  return acc;
}, {} as Record<string, Resource[]>);

// Display grouped resources
for (const [type, items] of Object.entries(byType)) {
  console.log(`## ${type} (${items.length})`);
  for (const item of items) {
    console.log(`- ${item.name}`);
  }
  console.log();
}
```

### External Links

```typescript
const suppliers = await marvin.resources.list({ resourceType: 'supplier' });

for (const supplier of suppliers) {
  console.log(`${supplier.name}`);
  
  if (supplier.url) {
    console.log(`  Website: ${supplier.url}`);
  }
  
  if (supplier.externalId) {
    console.log(`  ID: ${supplier.externalId}`);
  }
  
  if (supplier.metadata?.location) {
    console.log(`  Location: ${supplier.metadata.location}`);
  }
}
```

### Filter Entry Resources

```typescript
const entry = await marvin.entry('sewing-project');

// Get all resources
const resources = entry.resources;

// Filter by type
const fabrics = entry.resources.filter(r => r.resourceType === 'fabric');
const tools = entry.resources.filter(r => r.resourceType === 'tool');
const suppliers = entry.resources.filter(r => r.resourceType === 'supplier');

console.log('Materials:');
for (const fabric of fabrics) {
  console.log(`- ${fabric.name}`);
}

console.log('\nTools:');
for (const tool of tools) {
  console.log(`- ${tool.name}`);
}
```

## Common Resource Types

- **fabric** - Textiles and materials
- **tool** - Equipment and instruments
- **supplier** - Vendors and manufacturers
- **repository** - Git repositories
- **api** - External services and APIs
- **book** - Reference books and documents
- **product** - Physical products
- **service** - Service providers
- **person** - People and contacts
- **organization** - Companies and organizations

## Type Definitions

### `Resource`

```typescript
interface Resource {
  id: number;
  name: string;
  slug: string;
  resourceType: string;
  description: string | null;
  externalId: string | null;
  url: string | null;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  
  entries(): Promise<Entry[]>;
  toJSON(): ResourceData;
}
```

### `ListResourcesOptions`

```typescript
interface ListResourcesOptions {
  resourceType?: string;
  limit?: number;
  offset?: number;
}
```

## See Also

- [Resources Concept](../concepts/resources.md)
- [Entries Module](entries.md)
- [Workspace API](workspace.md)
