# Troubleshooting Guide

Common issues and solutions when using the Marvin SDK.

## Environment Variables

### Missing Environment Variables

**Problem:**

```
Error: Missing required configuration: MARVIN_SITE_CLIENT_TOKEN
```

**Solution:**

1. Create a `.env` file in your project root:

```env
MARVIN_API_URL=https://marvin.example.com
MARVIN_SITE_CLIENT_TOKEN=marvin_sk_1234567890abcdef
MARVIN_WORKSPACE_SLUG=my-workspace
```

2. Ensure `.env` is loaded:

=== "Node.js"

    ```bash
    npm install dotenv
    ```

    ```javascript
    // At the top of your entry file
    require('dotenv').config();
    ```

=== "Next.js"

    Next.js loads `.env.local` automatically. No additional setup needed.

=== "Astro"

    Astro loads `.env` automatically. No additional setup needed.

### Environment Variables Not Loading

**Problem:**

Environment variables are undefined at runtime.

**Checklist:**

- [ ] `.env` file exists in project root
- [ ] `.env` is loaded before creating the client
- [ ] Variable names are correct (no typos)
- [ ] In Next.js, use `.env.local` not `.env`
- [ ] In Astro, prefix public vars with `PUBLIC_`
- [ ] Restart dev server after changing `.env`

**Solution:**

```typescript
// Debug: Check if env vars are loaded
console.log('Env vars:', {
  apiUrl: process.env.MARVIN_API_URL,
  hasToken: !!process.env.MARVIN_SITE_CLIENT_TOKEN,
  workspace: process.env.MARVIN_WORKSPACE_SLUG,
});

if (!process.env.MARVIN_SITE_CLIENT_TOKEN) {
  throw new Error('Environment variables not loaded!');
}
```

## TypeScript Configuration

### Module Resolution Errors

**Problem:**

```
Cannot find module '@inneropen/marvin-sdk' or its corresponding type declarations
```

**Solution:**

1. Install the SDK:

```bash
npm install @inneropen/marvin-sdk
```

2. Check `tsconfig.json`:

```json
{
  "compilerOptions": {
    "module": "ESNext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "esModuleInterop": true
  }
}
```

3. Restart TypeScript server (VS Code: `Cmd+Shift+P` → "Restart TS Server")

### Type Errors with Entry Fields

**Problem:**

```typescript
const body = entry.field('body'); // Type is 'unknown'
```

**Solution:**

Use generic type parameters:

```typescript
const body = entry.field<string>('body');
const tags = entry.field<string[]>('tags');
const price = entry.field<number>('price');
```

### Strict Null Checks

**Problem:**

```
Object is possibly 'undefined'
```

**Solution:**

```typescript
// Check for undefined
const workspace = await marvin.getWorkspace();
if (workspace.site) {
  console.log(workspace.site.title);
}

// Use optional chaining
console.log(workspace.site?.title);

// Provide fallback
const title = workspace.site?.title ?? 'Untitled';
```

## Build Errors

### Module Not Found (ESM/CommonJS)

**Problem:**

```
Error [ERR_REQUIRE_ESM]: require() of ES Module not supported
```

**Solution:**

The SDK is ESM-only. Use `import` instead of `require`:

```javascript
// ❌ Bad
const { createMarvinClient } = require('@inneropen/marvin-sdk');

// ✅ Good
import { createMarvinClient } from '@inneropen/marvin-sdk';
```

If you must use CommonJS, use dynamic imports:

```javascript
// CommonJS with dynamic import
async function getMarvin() {
  const { createMarvinClient } = await import('@inneropen/marvin-sdk');
  return createMarvinClient();
}
```

### Build Fails in Next.js

**Problem:**

```
Module parse failed: Unexpected token
```

**Solution:**

Update `next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@inneropen/marvin-sdk'],
};

module.exports = nextConfig;
```

### Astro Build Errors

**Problem:**

```
[astro] Unable to resolve '@inneropen/marvin-sdk'
```

**Solution:**

Ensure you're using the SDK in server-side code only:

```astro
---
// ✅ Good: Server-side code
import { createMarvinClient } from '@inneropen/marvin-sdk';
const marvin = createMarvinClient();
const entries = await marvin.entries.list();
---

<script>
  // ❌ Bad: Client-side code
  import { createMarvinClient } from '@inneropen/marvin-sdk';
</script>
```

## Runtime Errors

### Authentication Errors

**Problem:**

```
Authentication failed: invalid token
```

**Checklist:**

- [ ] Token starts with `marvin_sk_` (site client) or `marvin_ut_` (user)
- [ ] No extra whitespace in token
- [ ] Token is for the correct workspace
- [ ] Token hasn't been revoked
- [ ] Token hasn't expired (user tokens only)

**Debug:**

```typescript
const token = process.env.MARVIN_SITE_CLIENT_TOKEN;

console.log('Token check:', {
  exists: !!token,
  length: token?.length,
  prefix: token?.substring(0, 10),
  hasWhitespace: token?.trim() !== token,
});
```

### Network Errors

**Problem:**

```
Error: getaddrinfo ENOTFOUND marvin.example.com
```

**Checklist:**

- [ ] API URL is correct
- [ ] Domain is reachable (try `ping marvin.example.com`)
- [ ] No firewall blocking requests
- [ ] HTTPS (not HTTP) for production
- [ ] Proxy settings (if applicable)

**Debug:**

```typescript
// Test connectivity
const testUrl = async (url: string) => {
  try {
    const response = await fetch(url);
    console.log(`${url}: ${response.status}`);
  } catch (error) {
    console.error(`${url}: ${error.message}`);
  }
};

await testUrl(process.env.MARVIN_API_URL + '/health');
```

### "Entry not found" Errors

**Problem:**

```
Entry not found: my-slug
```

**Checklist:**

- [ ] Entry exists in workspace
- [ ] Entry is published
- [ ] Slug is correct (case-sensitive)
- [ ] Using correct workspace
- [ ] Entry type is published

**Debug:**

```typescript
// List all entries to find the right slug
const entries = await marvin.entries.list();
console.log('Available slugs:', entries.map(e => e.slug));

// Find similar slugs
const searchSlug = 'my-slug';
const similar = entries.filter(e => 
  e.slug.includes(searchSlug) || 
  searchSlug.includes(e.slug)
);
console.log('Similar entries:', similar);
```

### Rate Limiting

**Problem:**

```
Rate limit exceeded: retry after 60 seconds
```

**Solutions:**

1. Enable caching:

```typescript
const marvin = createMarvinClient({
  cacheDuration: 10 * 60 * 1000, // 10 minutes
});
```

2. Batch requests:

```typescript
// ❌ Bad: Multiple requests
for (const slug of slugs) {
  await marvin.entry(slug);
}

// ✅ Good: Single request
const allEntries = await marvin.entries.list();
const filtered = allEntries.filter(e => slugs.includes(e.slug));
```

3. Implement retry with backoff (see [Error Handling](errors.md#retry-strategies))

## Development Issues

### Hot Reload Not Working

**Problem:**

Changes to code don't reflect in dev server.

**Solutions:**

1. Restart dev server
2. Clear cache:

```bash
# Next.js
rm -rf .next

# Astro
rm -rf .astro
```

3. Check if SDK is cached:

```bash
# Clear node_modules cache
rm -rf node_modules/.cache
```

### Stale Data in Development

**Problem:**

SDK returns old data after content changes.

**Solution:**

Reduce cache duration in development:

```typescript
const marvin = createMarvinClient({
  cacheDuration: process.env.NODE_ENV === 'development' 
    ? 0  // No cache in dev
    : 5 * 60 * 1000, // 5 min in prod
});
```

### Debugging API Requests

**Problem:**

Need to see what requests the SDK is making.

**Solution:**

Enable debug mode:

```typescript
const marvin = createMarvinClient({
  debug: true,
});
```

Or use a network inspector:

```typescript
// Intercept fetch
const originalFetch = global.fetch;
global.fetch = async (...args) => {
  console.log('Fetch:', args[0]);
  const response = await originalFetch(...args);
  console.log('Response:', response.status);
  return response;
};
```

## Production Issues

### Slow Build Times

**Problem:**

Build takes too long due to API calls.

**Solutions:**

1. Enable caching:

```typescript
const marvin = createMarvinClient({
  cacheDuration: 10 * 60 * 1000,
});
```

2. Parallelize requests:

```typescript
// ❌ Bad: Sequential
const entries = await marvin.entries.list();
const collections = await marvin.collections.list();
const assets = await marvin.assets.list();

// ✅ Good: Parallel
const [entries, collections, assets] = await Promise.all([
  marvin.entries.list(),
  marvin.collections.list(),
  marvin.assets.list(),
]);
```

3. Use incremental builds (Next.js, Astro)

### Memory Issues

**Problem:**

```
JavaScript heap out of memory
```

**Solutions:**

1. Increase Node.js memory:

```bash
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build
```

2. Paginate large datasets:

```typescript
// ❌ Bad: Load everything
const allEntries = await marvin.entries.list();

// ✅ Good: Paginate
async function* getEntriesPaginated(pageSize = 100) {
  let offset = 0;
  while (true) {
    const entries = await marvin.entries.list({ limit: pageSize, offset });
    if (entries.length === 0) break;
    yield entries;
    offset += pageSize;
  }
}

for await (const page of getEntriesPaginated()) {
  // Process page
}
```

### CORS Issues

**Problem:**

```
Access to fetch at 'https://marvin.example.com' has been blocked by CORS policy
```

**This means you're using the SDK in browser code!**

**Solution:**

Move SDK usage to server-side:

=== "Next.js"

    ```typescript
    // app/api/entries/route.ts (Server-side)
    import { createMarvinClient } from '@inneropen/marvin-sdk';

    export async function GET() {
      const marvin = createMarvinClient();
      const entries = await marvin.entries.list();
      return Response.json(entries);
    }
    ```

    ```typescript
    // components/EntryList.tsx (Client-side)
    'use client';
    
    export function EntryList() {
      const [entries, setEntries] = useState([]);
      
      useEffect(() => {
        fetch('/api/entries')
          .then(r => r.json())
          .then(setEntries);
      }, []);
    }
    ```

=== "Astro"

    ```astro
    ---
    // Server-side only
    import { createMarvinClient } from '@inneropen/marvin-sdk';
    const marvin = createMarvinClient();
    const entries = await marvin.entries.list();
    ---

    <ul>
      {entries.map(entry => (
        <li>{entry.title}</li>
      ))}
    </ul>
    ```

## Common Mistakes

### 1. Using SDK in Browser Code

**Problem:**

```typescript
// ❌ This runs in the browser!
import { createMarvinClient } from '@inneropen/marvin-sdk';

function MyComponent() {
  const marvin = createMarvinClient();
  // ...
}
```

**Solution:**

Create a server endpoint (see [CORS Issues](#cors-issues) above).

### 2. Not Initializing SDK

**Problem:**

```typescript
const marvin = createMarvinClient();
console.log(marvin.site); // null
```

**Solution:**

```typescript
const marvin = createMarvinClient({ autoInitialize: true });
await marvin.initialize(); // Only if autoInitialize is false

console.log(marvin.site); // Now has data
```

### 3. Incorrect Field Access

**Problem:**

```typescript
const entry = await marvin.entry('my-entry');
console.log(entry.contentMarkdown); // undefined (v2.0.0+)
```

**Solution:**

```typescript
const entry = await marvin.entry('my-entry');
const content = entry.field<string>('body');
```

### 4. Missing Type Annotations

**Problem:**

```typescript
const entries = await marvin.entries.list();
const titles = entries.map(e => e.titel); // Typo, no error!
```

**Solution:**

```typescript
import type { Entry } from '@inneropen/marvin-sdk';

const entries: Entry[] = await marvin.entries.list();
const titles = entries.map(e => e.titel); // TypeScript error!
```

## Getting Help

### Checklist Before Asking

- [ ] Read error message carefully
- [ ] Check environment variables
- [ ] Verify token and permissions
- [ ] Test network connectivity
- [ ] Review this troubleshooting guide
- [ ] Check [Error Handling Guide](errors.md)
- [ ] Search [GitHub Issues](https://github.com/inneropen/marvin-sdk/issues)

### How to Report Issues

When reporting issues, include:

1. **Error message** (full stack trace)
2. **Code snippet** (minimal reproduction)
3. **Environment** (Node version, framework, OS)
4. **SDK version** (`npm list @inneropen/marvin-sdk`)
5. **Expected vs actual behavior**

**Example:**

```markdown
## Issue: Authentication fails with valid token

**Error:**
```
Authentication failed: invalid token
```

**Code:**
```typescript
const marvin = createMarvinClient({
  apiUrl: 'https://marvin.example.com',
  siteClientToken: process.env.MARVIN_SITE_CLIENT_TOKEN,
  workspaceSlug: 'my-workspace',
});
await marvin.entries.list(); // Fails here
```

**Environment:**
- Node.js: v20.10.0
- SDK: @inneropen/marvin-sdk@2.0.0
- Framework: Next.js 14.1.0
- OS: macOS 14.2.1

**Expected:** Should list entries
**Actual:** Authentication error
```

## Next Steps

- [Error Handling](errors.md) - Handle errors gracefully
- [Security Best Practices](security.md) - Secure your integration
- [Examples](../examples.md) - Working code examples
