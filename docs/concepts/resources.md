# Resources

## Overview

**Resources** are reusable structured objects referenced by entries. They represent things like fabrics, tools, suppliers, Git repositories, APIs, and more.

```typescript
const resource = await marvin.resource('kuroki-s022');
const entries = await resource.entries();
```

!!! info "Resources vs Assets"
    Resources are structured data objects, not binary files. For media files, use [Assets](assets.md).

## Resource Properties

### Basic Properties

| Property | Type | Description |
|----------|------|-------------|
| `id` | `number` | Unique resource ID |
| `name` | `string` | Resource name |
| `slug` | `string` | URL-friendly slug |
| `resourceType` | `string` | Type of resource |

### Details

| Property | Type | Description |
|----------|------|-------------|
| `description` | `string \| null` | Resource description |
| `externalId` | `string \| null` | External system ID |
| `url` | `string \| null` | External URL |

### Metadata

| Property | Type | Description |
|----------|------|-------------|
| `metadata` | `object` | Custom metadata |
| `createdAt` | `Date` | Creation date |
| `updatedAt` | `Date` | Last update date |

## Resource Types

Resources can represent many different things:

### Common Resource Types

- **Fabrics** - Textiles and materials (e.g., Kuroki denim, canvas)
- **Tools** - Equipment and instruments (e.g., sewing machine, cutting tool)
- **Suppliers** - Vendors and manufacturers (e.g., fabric mills, button makers)
- **Git Repositories** - Code repositories
- **APIs** - External services and APIs
- **Books** - Reference books and documents
- **Products** - Physical products
- **Services** - Service providers

### Custom Resource Types

You can create custom resource types for your specific use case.

## Resource Methods

### `entries()`

Get all entries that reference this resource:

```typescript
const fabric = await marvin.resource('kuroki-s022');
const entries = await fabric.entries();

console.log(`${entries.length} entries use this fabric`);
```

### `toJSON()`

Get raw resource data:

```typescript
const resource = await marvin.resource('kuroki-s022');
const data = resource.toJSON();
console.log(data);
```

### Future Methods

Coming soon:

- `resource.assets()` - Get resource assets
- `resource.update()` - Update resource
- `resource.delete()` - Delete resource

## Fetching Resources

### Get Single Resource

```typescript
const resource = await marvin.resource('kuroki-s022');
console.log(resource.name, resource.description);
```

### List All Resources

```typescript
const resources = await marvin.resources.list();

for (const resource of resources) {
  console.log(`${resource.name} (${resource.resourceType})`);
}
```

### Filter by Type

```typescript
const fabrics = await marvin.resources.list({
  resourceType: 'fabric',
});

const tools = await marvin.resources.list({
  resourceType: 'tool',
});

const suppliers = await marvin.resources.list({
  resourceType: 'supplier',
});
```

### Get Resource Entries

```typescript
const resource = await marvin.resource('kuroki-s022');
const entries = await resource.entries();
```

Or use the convenience method:

```typescript
const entries = await marvin.resources.entries('kuroki-s022');
```

### Pagination

```typescript
const page1 = await marvin.resources.list({
  limit: 20,
  offset: 0,
});

const page2 = await marvin.resources.list({
  limit: 20,
  offset: 20,
});
```

## Working with Resources

### Display Resource Details

```typescript
const fabric = await marvin.resource('kuroki-s022');

console.log(`Name: ${fabric.name}`);
console.log(`Type: ${fabric.resourceType}`);
console.log(`Description: ${fabric.description}`);
console.log(`URL: ${fabric.url}`);
console.log(`External ID: ${fabric.externalId}`);
```

### Access Resource Metadata

```typescript
const fabric = await marvin.resource('kuroki-s022');

const { weight, composition, origin } = fabric.metadata;
console.log(`${weight} oz., ${composition}, Made in ${origin}`);
```

### Find Entries Using a Resource

```typescript
const fabric = await marvin.resource('kuroki-s022');
const entries = await fabric.entries();

console.log(`This fabric is used in ${entries.length} projects:`);
for (const entry of entries) {
  console.log(`- ${entry.title}`);
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

console.log(`Fabrics: ${fabrics.map(f => f.name).join(', ')}`);
console.log(`Tools: ${tools.map(t => t.name).join(', ')}`);
```

## Example Usage

### Astro Resource Directory

```typescript
---
import { createMarvinClient } from '@inneropen/marvin-sdk';

const marvin = createMarvinClient();
const fabrics = await marvin.resources.list({ resourceType: 'fabric' });
---

<div class="resource-directory">
  <h1>Fabrics</h1>
  
  <div class="resources">
    {fabrics.map((fabric) => (
      <article>
        <h2>{fabric.name}</h2>
        {fabric.description && <p>{fabric.description}</p>}
        {fabric.url && <a href={fabric.url}>Learn More</a>}
        
        <div class="metadata">
          {fabric.metadata.weight && <span>Weight: {fabric.metadata.weight} oz.</span>}
          {fabric.metadata.composition && <span>Composition: {fabric.metadata.composition}</span>}
        </div>
      </article>
    ))}
  </div>
</div>
```

### Next.js Resource Page

```typescript
// app/resources/[slug]/page.tsx
import { createMarvinClient } from '@inneropen/marvin-sdk';

const marvin = createMarvinClient();

export async function generateStaticParams() {
  const resources = await marvin.resources.list();
  return resources.map((resource) => ({
    slug: resource.slug,
  }));
}

export default async function ResourcePage({
  params,
}: {
  params: { slug: string };
}) {
  const resource = await marvin.resource(params.slug);
  const entries = await resource.entries();
  
  return (
    <div>
      <h1>{resource.name}</h1>
      <p className="type">{resource.resourceType}</p>
      {resource.description && <p>{resource.description}</p>}
      
      {resource.url && (
        <a href={resource.url} target="_blank" rel="noopener">
          Visit Website
        </a>
      )}
      
      <div className="entries">
        <h2>Used in {entries.length} projects</h2>
        {entries.map((entry) => (
          <article key={entry.id}>
            <h3>{entry.title}</h3>
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

app.get('/api/resources', async (req, res) => {
  const { resourceType } = req.query;
  
  const resources = await marvin.resources.list({
    resourceType: resourceType as string,
  });
  
  res.json(resources);
});

app.get('/api/resources/:slug', async (req, res) => {
  const resource = await marvin.resource(req.params.slug);
  res.json(resource.toJSON());
});

app.get('/api/resources/:slug/entries', async (req, res) => {
  const resource = await marvin.resource(req.params.slug);
  const entries = await resource.entries();
  res.json(entries);
});
```

## Real-World Examples

### Fabric Resource

```typescript
const fabric = await marvin.resource('kuroki-s022');

console.log(fabric.name);           // "Kuroki Selvedge Denim S022"
console.log(fabric.resourceType);   // "fabric"
console.log(fabric.metadata.weight); // 14
console.log(fabric.metadata.composition); // "100% Cotton"
console.log(fabric.metadata.origin); // "Japan"
```

### Tool Resource

```typescript
const tool = await marvin.resource('juki-ddl-8700');

console.log(tool.name);             // "Juki DDL-8700 Industrial Sewing Machine"
console.log(tool.resourceType);     // "tool"
console.log(tool.url);              // "https://juki.com/ddl-8700"
```

### Supplier Resource

```typescript
const supplier = await marvin.resource('pacific-blue-denims');

console.log(supplier.name);         // "Pacific Blue Denims"
console.log(supplier.resourceType); // "supplier"
console.log(supplier.url);          // "https://pacificblue.com"
console.log(supplier.metadata.location); // "Los Angeles, CA"
```

## Next Steps

- [Entries Concept](entries.md)
- [Collections Concept](collections.md)
- [Assets Concept](assets.md)
- [API Reference](../api/resources.md)
