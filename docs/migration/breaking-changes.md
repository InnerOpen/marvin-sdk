# Breaking Changes

Detailed list of breaking changes across Marvin SDK versions.

## v2.0.0

### Schema-Driven Entry Types

**Impact:** High - Affects all entry access patterns

#### `contentMarkdown` Deprecated

The `contentMarkdown` field is deprecated in favor of `dataJson`:

**Before:**
```typescript
const entry = await marvin.entry('my-entry');
const content = entry.contentMarkdown;
```

**After:**
```typescript
const entry = await marvin.entry('my-entry');
const content = entry.field<string>('body');
```

**Backward Compatibility:**

- `contentMarkdown` still exists but is deprecated
- Will be removed in v3.0.0
- Automatic backend migration: `contentMarkdown` → `dataJson.body`

#### Entry Type Schema Required

Entry types now require a `schemaJson` definition:

**Before:**
```typescript
interface EntryType {
  id: string;
  name: string;
  slug: string;
}
```

**After:**
```typescript
interface EntryType {
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

#### Entry Creation/Update API

Entry creation now uses `dataJson` instead of `contentMarkdown`:

**Before:**
```typescript
await marvin.entries.create({
  title: "My Entry",
  contentMarkdown: "# Content"
});
```

**After:**
```typescript
await marvin.entries.create({
  title: "My Entry",
  dataJson: {
    body: "# Content"
  }
});
```

### New Methods

#### `field()` Method

New helper method for accessing entry fields:

```typescript
const body = entry.field<string>('body');
const tags = entry.field<string[]>('tags');
```

### Migration Path

1. Update to v2.0.0
2. Replace `contentMarkdown` with `field('body')`
3. Update entry creation/update calls
4. Test thoroughly
5. Remove deprecation warnings
6. Prepare for v3.0.0 (contentMarkdown removal)

---

## v1.5.0

### Workspace-First Architecture

**Impact:** Medium - Affects initialization

#### Client Initialization

**Before (v1.4.x):**
```typescript
const marvin = createMarvinClient({
  siteId: 'site-123'
});
```

**After (v1.5.0):**
```typescript
const marvin = createMarvinClient({
  workspaceSlug: 'my-workspace'
});
```

**Migration:**

Replace `siteId` with `workspaceSlug` in configuration.

---

## v1.4.0

### ESM-Only Package

**Impact:** High - Affects all CommonJS users

#### Module System

v1.4.0 switched to ESM-only:

**Before (v1.3.x):**
```javascript
const { createMarvinClient } = require('@inneropen/marvin-sdk');
```

**After (v1.4.0):**
```javascript
import { createMarvinClient } from '@inneropen/marvin-sdk';
```

**Migration:**

1. Update to ES modules
2. Or use dynamic imports in CommonJS:

```javascript
async function getMarvin() {
  const { createMarvinClient } = await import('@inneropen/marvin-sdk');
  return createMarvinClient();
}
```

---

## v1.3.0

### Publishing API Rename

**Impact:** Low - Affects method names

#### Method Names

**Before (v1.2.x):**
```typescript
await marvin.getSite();
await marvin.getEntries();
await marvin.getEntry('slug');
```

**After (v1.3.0):**
```typescript
// Still supported (deprecated)
await marvin.getSite();

// New names
await marvin.getWorkspace();
await marvin.entries.list();
await marvin.entry('slug');
```

**Migration:**

Old methods still work but are deprecated. Update to new names when convenient.

---

## v1.2.0

### TypeScript Types

**Impact:** Medium - Affects TypeScript users

#### Type Exports

**Before (v1.1.x):**
```typescript
import { MarvinClient } from '@inneropen/marvin-sdk';
```

**After (v1.2.0):**
```typescript
import type { MarvinClient } from '@inneropen/marvin-sdk';
```

**Migration:**

Use `import type` for type-only imports to improve tree-shaking.

---

## v1.1.0

### Configuration Changes

**Impact:** Low - Affects configuration

#### Environment Variables

**Before (v1.0.x):**
```env
MARVIN_SITE_ID=site-123
MARVIN_API_TOKEN=token
```

**After (v1.1.0):**
```env
MARVIN_WORKSPACE_SLUG=my-workspace
MARVIN_SITE_CLIENT_TOKEN=marvin_sk_...
```

**Migration:**

Update environment variable names in `.env` files.

---

## v1.0.0

### Initial Release

First stable release. No breaking changes from beta.

---

## Deprecation Timeline

| Feature | Deprecated | Removed |
|---------|-----------|---------|
| `contentMarkdown` | v2.0.0 | v3.0.0 |
| `getSite()` | v1.3.0 | v2.0.0 |
| `getEntries()` | v1.3.0 | v2.0.0 |
| `getEntry()` | v1.3.0 | v2.0.0 |
| `siteId` config | v1.5.0 | v2.0.0 |

---

## Version Compatibility

### SDK vs Server

| SDK Version | Marvin Server Version | Compatible |
|-------------|---------------------|------------|
| v2.x | v2.x | ✅ Yes |
| v2.x | v1.x | ✅ Yes (degraded) |
| v1.x | v2.x | ✅ Yes (deprecated) |
| v1.x | v1.x | ✅ Yes |

**Notes:**

- v2.x SDK on v1.x server: `dataJson` falls back to `contentMarkdown`
- v1.x SDK on v2.x server: `contentMarkdown` still available (deprecated)

### Node.js Compatibility

| SDK Version | Node.js Version |
|-------------|----------------|
| v2.x | ≥ 18.0.0 |
| v1.x | ≥ 16.0.0 |

---

## Handling Breaking Changes

### Strategy 1: Incremental Migration

Migrate one module at a time:

```typescript
// Step 1: Update imports
import { createMarvinClient } from '@inneropen/marvin-sdk';

// Step 2: Update configuration
const marvin = createMarvinClient({
  workspaceSlug: 'my-workspace', // Was: siteId
});

// Step 3: Update method calls
const entries = await marvin.entries.list(); // Was: getEntries()

// Step 4: Update field access
entries.forEach(entry => {
  const content = entry.field<string>('body'); // Was: contentMarkdown
});
```

### Strategy 2: Automated Migration

Use a codemod to automate migration:

```bash
npx @inneropen/marvin-codemod v1-to-v2 ./src
```

### Strategy 3: Gradual Rollout

Deploy changes incrementally:

1. Update SDK version
2. Deploy with both old and new code paths
3. Monitor for errors
4. Remove old code paths
5. Clean up deprecation warnings

---

## Reporting Issues

If you encounter migration issues:

1. Check this guide first
2. Review [Migration Guide](v2-migration.md)
3. Search [GitHub Issues](https://github.com/inneropen/marvin-sdk/issues)
4. Open a new issue with:
   - SDK version (old and new)
   - Error message
   - Code snippet
   - Expected vs actual behavior

---

## Next Steps

- [v2.0 Migration Guide](v2-migration.md) - Complete migration guide
- [API Reference](../api/client.md) - Current API documentation
- [Examples](../examples.md) - Updated code examples
