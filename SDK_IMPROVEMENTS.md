# Marvin SDK Improvements

Issues discovered during integration of `@inneropen/marvin-sdk` v2.0.1 into the Mash & Burn Co. site.

## 1. Misleading Configuration Error Messages

### Current Behavior
```javascript
// SDK validation code
if (!config.siteClientToken) {
  throw new Error("MARVIN_SITE_CLIENT_TOKEN is required");
}
```

**Problem:** Error message references environment variable name, but actual issue is the **config parameter name**.

**What happened:**
- Environment variable `MARVIN_SITE_CLIENT_TOKEN` was set correctly
- We passed config with `token` instead of `siteClientToken`
- Error said "MARVIN_SITE_CLIENT_TOKEN is required"
- This made us think the env var wasn't loading
- Spent hours debugging `.env` file when the real issue was parameter naming

### Recommended Fix
```javascript
if (!config.siteClientToken) {
  const receivedKeys = Object.keys(config).join(', ');
  throw new Error(
    `Missing required config parameter 'siteClientToken'. ` +
    `Received config keys: ${receivedKeys}. ` +
    `Set this to your MARVIN_SITE_CLIENT_TOKEN environment variable value.`
  );
}
```

**Benefits:**
- Shows what was actually passed
- Clearly states the config parameter name
- Mentions env var as guidance, not error cause
- Developer can immediately see they used wrong key

---

## 2. Exception Handling for Normal Conditions

### Current Behavior
SDK throws exceptions for:
- Collection not found (404)
- Entry not found (404)
- Network errors
- Authentication failures
- Server errors (500)

All treated the same - generic thrown errors.

**Problem:** Forces defensive try/catch everywhere:

```javascript
// Every API call needs this boilerplate
export async function getBenchNotes() {
  if (hasMarvinBackend()) {
    try {
      let entries = await getMarvinCollection('bench-notes');
      if (!entries || entries.length === 0) {
        entries = await getMarvinCollection('journal');  // Another try needed
      }
      // ...
    } catch (error) {
      console.error('Marvin fetch failed, falling back:', error);
    }
  }
  return fallbackData;
}
```

### Recommended Design

**Option A: Return null/empty for 404s**
```javascript
// Don't throw for "not found" - that's a normal condition
const collection = await client.collection('goods'); // null if doesn't exist
if (!collection) return [];

const entries = await collection.entries(); // [] if none exist
```

**Option B: Typed Errors + Status Codes**
```javascript
import { MarvinNotFoundError, MarvinAuthError } from '@inneropen/marvin-sdk';

try {
  const collection = await client.collection('goods');
} catch (error) {
  if (error instanceof MarvinNotFoundError) {
    // Normal - doesn't exist
    return [];
  }
  if (error instanceof MarvinAuthError) {
    // Real problem - auth failed
    throw error;
  }
  // Handle other errors...
}
```

**Option C: Result Objects**
```javascript
const result = await client.collection('goods');

if (result.ok) {
  const collection = result.data;
} else if (result.error.code === 'NOT_FOUND') {
  // Normal condition
} else if (result.error.code === 'AUTH_FAILED') {
  // Real error
}
```

### Recommended Error Classes

```typescript
class MarvinError extends Error {
  code: string;
  statusCode?: number;
  endpoint?: string;
}

class MarvinNotFoundError extends MarvinError {
  code = 'NOT_FOUND';
  statusCode = 404;
}

class MarvinAuthError extends MarvinError {
  code = 'AUTH_FAILED';
  statusCode = 401 | 403;
}

class MarvinNetworkError extends MarvinError {
  code = 'NETWORK_ERROR';
}

class MarvinServerError extends MarvinError {
  code = 'SERVER_ERROR';
  statusCode = 500;
}

class MarvinValidationError extends MarvinError {
  code = 'VALIDATION_ERROR';
  statusCode = 422;
}
```

**Benefits:**
- Can catch specific error types
- Distinguish between normal conditions (404) and real errors (auth, network)
- Less defensive try/catch boilerplate
- Cleaner code

---

## 3. API Design - Return Types

### Current Issues

**No type safety on returns:**
```javascript
const entries = await collection.entries(); // any[]
// What fields do entries have? Unknown.
```

**Inconsistent return types:**
- Some methods return objects
- Some return arrays
- Some throw on not found
- No consistent pattern

### Recommended

**Generic typing:**
```typescript
interface Collection<T = any> {
  slug: string;
  name: string;
  entries(): Promise<Entry<T>[]>;
  get(slug: string): Promise<Entry<T> | null>;
}

interface Entry<T = any> {
  slug: string;
  title: string;
  content?: string;
  contentMarkdown?: string;
  data: T; // Custom fields
}
```

**Consistent nullability:**
- `get()` methods return `T | null` (not found = null, not throw)
- `list()` methods return `T[]` (empty array, not throw)
- Only throw for real errors (auth, network, server)

---

## 4. Collection Query Fallback Pattern

### Current Reality

Our integration tries multiple collection names:
```javascript
// Try bench-notes, then journal, then blog
let entries = await getMarvinCollection('bench-notes');
if (!entries || entries.length === 0) {
  entries = await getMarvinCollection('journal');
}
if (!entries || entries.length === 0) {
  entries = await getMarvinCollection('blog');
}
```

Each call can throw, requiring nested try/catch.

### Recommended SDK Feature

```javascript
// Built-in fallback chain
const entries = await client.collectionFallback(
  ['bench-notes', 'journal', 'blog']
);

// Or with options
const entries = await client.collectionFallback(
  ['bench-notes', 'journal', 'blog'],
  { returnEmpty: true } // Don't throw if none exist
);
```

**Benefits:**
- Common pattern baked into SDK
- Handles 404s internally
- Single try/catch needed
- Cleaner consuming code

---

## 5. Debug/Logging Support

### Current Gaps

No way to see what SDK is doing:
- Which endpoints are being called?
- What requests are made?
- What responses come back?
- Token validation happening?

Had to add our own logging everywhere.

### Recommended

**Debug mode:**
```javascript
const client = createMarvinClient({
  apiUrl: '...',
  siteClientToken: '...',
  workspaceSlug: '...',
  debug: true, // Enable logging
  logger: console // Or custom logger
});

// Logs:
// [Marvin] GET /api/publish/mash-burn-co/collections/bench-notes
// [Marvin] 404 Not Found (12ms)
// [Marvin] GET /api/publish/mash-burn-co/collections/journal
// [Marvin] 200 OK (45ms) - 12 entries
```

**Or namespaced logger:**
```javascript
import debug from 'debug';
const log = debug('marvin:sdk');

// Enable with: DEBUG=marvin:* npm run dev
```

---

## 6. Configuration Validation

### Current Issues

Fails on first use, not on creation:
```javascript
const client = createMarvinClient({ token: 'wrong-key' }); // No error yet
// ...
await client.getWorkspace(); // ERROR: MARVIN_SITE_CLIENT_TOKEN is required
```

### Recommended

**Validate immediately:**
```javascript
const client = createMarvinClient({ token: 'wrong-key' });
// ERROR: Missing required config parameter 'siteClientToken'
```

**Or factory with validation:**
```javascript
const result = MarvinClient.create(config);
if (!result.ok) {
  console.error('Config validation failed:', result.errors);
  // [
  //   "Missing required parameter 'siteClientToken'",
  //   "Received: apiUrl, token, workspace"
  // ]
}
```

---

## 7. Better Type Exports

### Current Issues

Types are not well exported:
- Hard to type custom data structures
- No clear interfaces for Entry, Collection, etc.
- Lots of `any` in consuming code

### Recommended

```typescript
// Clear type exports
export type {
  MarvinConfig,
  Entry,
  Collection,
  Workspace,
  Asset,
  // ... etc
} from '@inneropen/marvin-sdk';

// Generic support
import type { Entry } from '@inneropen/marvin-sdk';

interface ProjectData {
  category: string;
  price: number;
  status: 'available' | 'sold-out';
}

const entry: Entry<ProjectData> = await client.entry('my-project');
// entry.data is typed as ProjectData
```

---

## 8. Documentation Gaps

### Issues Found During Integration

**Parameter naming confusion:**
- Docs don't clearly show `siteClientToken` vs `token`
- Not clear that it's `workspaceSlug` not `workspace`
- Example code doesn't match actual API

**Missing:**
- Error handling best practices
- How to handle 404s
- Common patterns (fallback chains, etc.)
- TypeScript usage examples
- Field name conventions (contentMarkdown vs content vs body)

### Recommended

**Clear API reference:**
```typescript
/**
 * Create a Marvin client
 * 
 * @param config - Client configuration
 * @param config.apiUrl - Marvin API base URL
 * @param config.siteClientToken - Site client token (get from MARVIN_SITE_CLIENT_TOKEN env var)
 * @param config.workspaceSlug - Workspace slug (get from MARVIN_WORKSPACE_SLUG env var)
 * 
 * @throws {MarvinConfigError} If required parameters are missing
 * 
 * @example
 * ```typescript
 * const client = createMarvinClient({
 *   apiUrl: import.meta.env.MARVIN_API_URL,
 *   siteClientToken: import.meta.env.MARVIN_SITE_CLIENT_TOKEN,
 *   workspaceSlug: import.meta.env.MARVIN_WORKSPACE_SLUG,
 * });
 * ```
 */
```

---

## 9. Environment Variable Helpers

### Current Gap

Manual mapping required:
```javascript
const client = createMarvinClient({
  apiUrl: import.meta.env.MARVIN_API_URL,
  siteClientToken: import.meta.env.MARVIN_SITE_CLIENT_TOKEN,
  workspaceSlug: import.meta.env.MARVIN_WORKSPACE_SLUG,
});
```

### Recommended

**Auto-load from env:**
```javascript
// Automatically reads MARVIN_* env vars
const client = createMarvinClient.fromEnv();

// Or with overrides
const client = createMarvinClient.fromEnv({
  workspaceSlug: 'override-workspace'
});

// Or with custom prefix
const client = createMarvinClient.fromEnv({
  envPrefix: 'MY_CMS_' // Reads MY_CMS_API_URL, etc.
});
```

---

## 10. Caching Transparency

### Current Issues

SDK has caching but:
- Not clear what's cached
- No way to invalidate cache
- No cache hit/miss visibility
- Can't disable for development

### Recommended

```javascript
const client = createMarvinClient({
  // ...
  cache: {
    enabled: true,
    ttl: 300, // 5 minutes
    debug: true, // Log cache hits/misses
  }
});

// Manual cache control
await client.cache.clear();
await client.cache.clear('collections');
await client.cache.invalidate('bench-notes');

// Disable for dev
const client = createMarvinClient({
  // ...
  cache: process.env.NODE_ENV === 'production'
});
```

---

## Summary

### Critical (Breaking User Experience)
1. ✅ **Misleading config error messages** - Wasted hours debugging
2. ✅ **404s throw exceptions** - Forces defensive code everywhere
3. ✅ **No typed errors** - Can't distinguish error types

### Important (DX Issues)
4. **No collection fallback helper** - Common pattern not supported
5. **No debug logging** - Hard to troubleshoot
6. **Config validates late** - Errors happen at runtime, not startup

### Nice to Have
7. Better TypeScript types/generics
8. Better documentation with examples
9. Environment variable helpers
10. Cache transparency/control

---

## Impact on Our Integration

**Code bloat from defensive programming:**
- Every API call wrapped in try/catch
- Manual fallback chains for collection names
- Custom logging added everywhere
- Can't distinguish "not found" from "server error"

**Lines of boilerplate that could be eliminated:**
- ~30 lines of try/catch per API function
- ~15 lines of manual fallback logic
- ~10 lines of custom logging

**With these improvements, our code could go from:**

```javascript
// Current: 40+ lines with defensive code
export async function getBenchNotes() {
  if (hasMarvinBackend()) {
    try {
      let entries = await getMarvinCollection('bench-notes');
      if (!entries || entries.length === 0) {
        entries = await getMarvinCollection('journal');
      }
      if (!entries || entries.length === 0) {
        entries = await getMarvinCollection('blog');
      }
      if (entries && entries.length > 0) {
        return entries.map(transformMarvinToBenchNote);
      }
    } catch (error) {
      console.error('Marvin fetch failed, falling back:', error);
    }
  }
  if (hasApiBackend()) {
    try {
      return await fetchApi('/bench-notes');
    } catch (error) {
      console.error('API fetch failed, using static data:', error);
    }
  }
  return benchNotePosts;
}
```

**To:**

```javascript
// Better: 10 lines, clean
export async function getBenchNotes() {
  if (hasMarvinBackend()) {
    const entries = await client.collectionFallback(['bench-notes', 'journal', 'blog']);
    if (entries.length) return entries.map(transformMarvinToBenchNote);
  }
  if (hasApiBackend()) {
    const result = await fetchApi('/bench-notes');
    if (result) return result;
  }
  return benchNotePosts;
}
```

**50% less code, 100% clearer intent.** ✨
