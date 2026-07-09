# Migration Guide: v1.x → v2.0.0

## Breaking Changes

Marvin SDK v2.0.0 introduces **schema-driven entry types**, a fundamental architectural change that transforms Marvin from a Markdown-centric CMS into a flexible, schema-driven content platform.

### Summary

- **REMOVED**: `contentMarkdown` as the primary content field
- **ADDED**: `dataJson` for schema-driven content
- **ADDED**: `schemaJson` on Entry Types (defines content structure)
- **ADDED**: `field()` helper method for accessing schema fields

---

## What Changed?

### Before (v1.x): Markdown-Centric

All entries stored content in a single `contentMarkdown` field:

```typescript
const entry = await client.entries.get('my-entry');
console.log(entry.contentMarkdown); // "# My Content\n\nBody text..."
```

### After (v2.0.0): Schema-Driven

Entries now use `dataJson` with fields defined by the entry type's schema:

```typescript
const entry = await client.entries.get('my-entry');

// Access fields using the new field() helper
const body = entry.field<string>('body');           // Markdown content
const difficulty = entry.field<string>('difficulty'); // "beginner"
const heroImage = entry.field<string>('heroImage');  // UUID

// Or access dataJson directly
console.log(entry.dataJson);
// {
//   body: "# My Content\n\nBody text...",
//   difficulty: "beginner",
//   heroImage: "abc-123-uuid"
// }
```

---

## Migration Steps

### 1. Update Package Version

```bash
npm install @inneropen/marvin-sdk@^2.0.0
```

### 2. Update Entry Type Definitions

**Before:**
```typescript
interface MyEntryType {
  id: string;
  name: string;
  slug: string;
}
```

**After:**
```typescript
interface MyEntryType {
  id: string;
  name: string;
  slug: string;
  schemaJson?: {
    fields: Array<{
      key: string;
      label: string;
      type: string;
      required?: boolean;
    }>;
  };
}
```

### 3. Update Entry Access Patterns

#### Pattern 1: Direct Field Access

**Before:**
```typescript
const entry = await client.entries.get('my-entry');
const content = entry.contentMarkdown;
```

**After:**
```typescript
const entry = await client.entries.get('my-entry');
const content = entry.field<string>('body'); // 'body' is the default field key
```

#### Pattern 2: Custom Fields

**New in v2.0.0** - Entry types can define custom fields:

```typescript
// Entry type with custom schema
const entryType = {
  name: "FAQ",
  schemaJson: {
    fields: [
      { key: "question", label: "Question", type: "text", required: true },
      { key: "answer", label: "Answer", type: "markdown", required: true },
      { key: "category", label: "Category", type: "select", options: ["general", "technical"] }
    ]
  }
};

// Access custom fields
const entry = await client.entries.get('faq-1');
const question = entry.field<string>('question');
const answer = entry.field<string>('answer');
const category = entry.field<string>('category');
```

#### Pattern 3: Type-Safe Field Access

Use TypeScript generics for type safety:

```typescript
const entry = await client.entries.get('project-1');

// Type-safe field access
const body = entry.field<string>('body');
const difficulty = entry.field<'beginner' | 'intermediate' | 'advanced'>('difficulty');
const price = entry.field<number>('price');
const tags = entry.field<string[]>('tags');
const heroImage = entry.field<string>('heroImage'); // UUID
```

### 4. Update Entry Creation

**Before:**
```typescript
await client.entries.create({
  title: "My Entry",
  slug: "my-entry",
  entryTypeId: "abc-123",
  contentMarkdown: "# My Content\n\nBody text..."
});
```

**After:**
```typescript
await client.entries.create({
  title: "My Entry",
  slug: "my-entry",
  entryTypeId: "abc-123",
  dataJson: {
    body: "# My Content\n\nBody text...",
    difficulty: "beginner",
    heroImage: "asset-uuid-123"
  }
});
```

### 5. Update Entry Updates

**Before:**
```typescript
await client.entries.update(entryId, {
  contentMarkdown: "# Updated Content"
});
```

**After:**
```typescript
await client.entries.update(entryId, {
  dataJson: {
    body: "# Updated Content",
    // Include other fields as needed
  }
});
```

---

## Backward Compatibility

### Deprecation Timeline

- **v2.0.0** (Current): `contentMarkdown` deprecated but still available (read-only)
- **v3.0.0** (Future): `contentMarkdown` will be removed entirely

### Accessing Legacy Content

If you need to access legacy `contentMarkdown` during migration:

```typescript
const entry = await client.entries.get('legacy-entry');

// Still works (deprecated)
const legacyContent = entry.contentMarkdown;

// Recommended approach
const content = entry.field<string>('body');
```

**Note**: The backend automatically migrated all existing `contentMarkdown` → `dataJson.body` during the v2.0.0 upgrade.

---

## New Features in v2.0.0

### 1. Field Types

Entry types can now define rich field schemas with 13 built-in types:

- **Text**: `text`, `textarea`, `markdown`
- **Numbers**: `number`
- **Selections**: `boolean`, `select` (with multiple option)
- **Dates**: `date`, `datetime`
- **References**: `asset`, `asset-list`, `resource`, `resource-list`
- **Free-form**: `json`

### 2. Field Validation

Schemas support validation constraints:

```typescript
{
  key: "price",
  label: "Price",
  type: "number",
  required: true,
  min: 0,
  max: 10000
}
```

### 3. Helper Methods

New convenience methods on Entry class:

```typescript
const entry = await client.entries.get('my-entry');

// Get single field
const body = entry.field<string>('body');

// Get all fields
const allFields = entry.fields;

// Check schema
const schema = entry.entryType?.schemaJson;
```

### 4. Separation of Concerns

Clear distinction between content fields and metadata:

- **dataJson**: Schema-driven content fields (defined by entry type)
- **metadata**: Custom, non-schema metadata (API keys, external IDs, etc.)

```typescript
await client.entries.create({
  title: "My Entry",
  dataJson: {
    // Content fields (validated against schema)
    body: "...",
    difficulty: "beginner"
  },
  metadata: {
    // Custom metadata (not validated)
    externalId: "ext-123",
    apiKey: "..."
  }
});
```

---

## Common Migration Patterns

### Pattern 1: Simple Markdown Entries

**Before:**
```typescript
const entries = await client.entries.list();
const content = entries.map(e => ({
  title: e.title,
  content: e.contentMarkdown
}));
```

**After:**
```typescript
const entries = await client.entries.list();
const content = entries.map(e => ({
  title: e.title,
  content: e.field<string>('body')
}));
```

### Pattern 2: Custom Entry Types

**Before (v1.x):**
```typescript
// Products stored as markdown with metadata
{
  title: "Black Denim Jacket",
  contentMarkdown: "# Description\n\n...",
  metadata: {
    price: 150,
    sku: "BDJ-001",
    inStock: true
  }
}
```

**After (v2.0.0):**
```typescript
// Products use schema-driven fields
{
  title: "Black Denim Jacket",
  dataJson: {
    description: "# Description\n\n...",
    price: 150,
    sku: "BDJ-001",
    inStock: true,
    heroImage: "asset-uuid",
    materials: ["resource-uuid-1", "resource-uuid-2"]
  }
}

// With entry type schema:
{
  fields: [
    { key: "description", type: "markdown", required: true },
    { key: "price", type: "number", min: 0, required: true },
    { key: "sku", type: "text", pattern: "^[A-Z]{3}-\\d{3}$", required: true },
    { key: "inStock", type: "boolean", defaultValue: true },
    { key: "heroImage", type: "asset" },
    { key: "materials", type: "resource-list" }
  ]
}
```

### Pattern 3: Astro/Next.js Integration

**Before:**
```typescript
// astro.config.mjs
const entries = await client.entries.list({ entryType: 'page' });

entries.forEach(entry => {
  // Render markdown
  const html = await markdownToHtml(entry.contentMarkdown);
});
```

**After:**
```typescript
// astro.config.mjs
const entries = await client.entries.list({ entryType: 'page' });

entries.forEach(entry => {
  // Access body field
  const markdown = entry.field<string>('body');
  const html = await markdownToHtml(markdown);

  // Access other fields
  const heroImage = entry.field<string>('heroImage');
  const layout = entry.field<string>('layout');
});
```

---

## Testing Your Migration

### 1. Check for Deprecation Warnings

Run your app and look for deprecation warnings in the console:

```
[DEPRECATION] entry.contentMarkdown is deprecated. Use entry.field('body') instead.
```

### 2. Verify Schema Access

Ensure you can access entry type schemas:

```typescript
const entryType = await client.entryTypes.get('page');
console.log(entryType.schemaJson);
```

### 3. Test Field Access

Verify field access works for all your entry types:

```typescript
const entry = await client.entries.get('test-entry');
const body = entry.field<string>('body');
console.assert(body !== undefined, 'Body field should exist');
```

---

## Getting Help

- **Documentation**: [Marvin SDK Docs](https://github.com/inneropen/marvin-sdk)
- **Issues**: [GitHub Issues](https://github.com/inneropen/marvin-sdk/issues)
- **Backend Changes**: See Marvin server CHANGELOG for API changes

---

## Example: Full Migration

**Before (v1.x):**
```typescript
import { createMarvinClient } from '@inneropen/marvin-sdk';

const client = createMarvinClient({
  apiUrl: 'https://marvin.example.com',
  siteClientToken: 'marvin_sk_...',
  workspaceSlug: 'my-workspace'
});

// List entries
const entries = await client.entries.list({ entryType: 'article' });

// Access content
entries.forEach(entry => {
  console.log(entry.title);
  console.log(entry.contentMarkdown);
});

// Create entry
await client.entries.create({
  title: "New Article",
  slug: "new-article",
  entryTypeId: "article-type-id",
  contentMarkdown: "# My Article\n\nContent here..."
});
```

**After (v2.0.0):**
```typescript
import { createMarvinClient } from '@inneropen/marvin-sdk';

const client = createMarvinClient({
  apiUrl: 'https://marvin.example.com',
  siteClientToken: 'marvin_sk_...',
  workspaceSlug: 'my-workspace'
});

// List entries
const entries = await client.entries.list({ entryType: 'article' });

// Access content using field() helper
entries.forEach(entry => {
  console.log(entry.title);
  console.log(entry.field<string>('body'));
  
  // Access custom fields
  const author = entry.field<string>('author');
  const tags = entry.field<string[]>('tags');
  const publishDate = entry.field<string>('publishDate');
});

// Create entry with schema-driven fields
await client.entries.create({
  title: "New Article",
  slug: "new-article",
  entryTypeId: "article-type-id",
  dataJson: {
    body: "# My Article\n\nContent here...",
    author: "Jane Doe",
    tags: ["tech", "tutorial"],
    publishDate: "2026-07-09"
  }
});
```

---

## Summary

v2.0.0 transforms Marvin from a Markdown CMS into a flexible, schema-driven content platform:

- ✅ Define custom content models without backend changes
- ✅ Rich field types (13 built-in types)
- ✅ Field-level validation
- ✅ Type-safe field access
- ✅ Clear separation: content (dataJson) vs metadata

**Action Required**: Update your code to use `entry.field()` or `entry.dataJson` instead of `entry.contentMarkdown`.
