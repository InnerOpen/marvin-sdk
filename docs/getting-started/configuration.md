# Configuration

## Environment Variables

The SDK uses environment variables for configuration:

| Variable | Required | Description |
|----------|----------|-------------|
| `MARVIN_API_URL` | Yes | Marvin API URL |
| `MARVIN_SITE_CLIENT_TOKEN` | Yes | Site client token for authentication |
| `MARVIN_WORKSPACE_SLUG` | Yes | Workspace slug |

### Example `.env` File

```env
MARVIN_API_URL=https://marvin.example.com
MARVIN_SITE_CLIENT_TOKEN=msc_1234567890abcdef
MARVIN_WORKSPACE_SLUG=my-workspace
```

## Client Configuration

You can also pass configuration directly to the client:

```typescript
import { createMarvinClient } from '@inneropen/marvin-sdk';

const marvin = createMarvinClient({
  apiUrl: 'https://marvin.example.com',
  siteClientToken: 'msc_1234567890abcdef',
  workspaceSlug: 'my-workspace',
});
```

## Configuration Options

### `apiUrl`

- **Type:** `string`
- **Required:** Yes
- **Default:** `process.env.MARVIN_API_URL`
- **Description:** The Marvin API URL

### `siteClientToken`

- **Type:** `string`
- **Required:** Yes
- **Default:** `process.env.MARVIN_SITE_CLIENT_TOKEN`
- **Description:** Site client token for authentication

!!! warning "Security"
    Never expose site client tokens in browser code. Use them only in server-side or build-time code.

### `workspaceSlug`

- **Type:** `string`
- **Required:** Yes
- **Default:** `process.env.MARVIN_WORKSPACE_SLUG`
- **Description:** Workspace slug to connect to

### `autoInitialize`

- **Type:** `boolean`
- **Required:** No
- **Default:** `false`
- **Description:** Auto-initialize on client creation

```typescript
const marvin = createMarvinClient({
  autoInitialize: true,
});

// Site is preloaded
console.log(marvin.site?.title);
```

### `cacheDuration`

- **Type:** `number` (milliseconds)
- **Required:** No
- **Default:** `300000` (5 minutes)
- **Description:** Cache duration for site data

```typescript
const marvin = createMarvinClient({
  cacheDuration: 10 * 60 * 1000, // 10 minutes
});
```

## Initialization

### Auto-Initialize

```typescript
const marvin = createMarvinClient({
  autoInitialize: true,
});

// Site is preloaded
console.log(marvin.site?.title);
```

### Manual Initialize

```typescript
const marvin = createMarvinClient();

await marvin.initialize();

// Now site is cached
console.log(marvin.site?.title);
```

## Caching

The SDK caches workspace data to improve performance:

- **Site configuration** is cached after initialization
- **Default cache duration:** 5 minutes
- **Configurable** via `cacheDuration` option

### Cache Strategy

```typescript
// First call - fetches from API
const workspace = await marvin.getWorkspace();

// Subsequent calls within cache duration - returns cached data
const workspace2 = await marvin.getWorkspace();

// Force reload
const workspace3 = await workspace.loadSite();
```

## Multiple Workspaces

You can create multiple clients for different workspaces:

```typescript
const production = createMarvinClient({
  workspaceSlug: 'production',
  siteClientToken: process.env.PROD_TOKEN,
});

const staging = createMarvinClient({
  workspaceSlug: 'staging',
  siteClientToken: process.env.STAGING_TOKEN,
});
```

## Framework-Specific Configuration

### Astro

```typescript
// astro.config.mjs
export default defineConfig({
  vite: {
    define: {
      'process.env.MARVIN_API_URL': JSON.stringify(process.env.MARVIN_API_URL),
      'process.env.MARVIN_SITE_CLIENT_TOKEN': JSON.stringify(process.env.MARVIN_SITE_CLIENT_TOKEN),
      'process.env.MARVIN_WORKSPACE_SLUG': JSON.stringify(process.env.MARVIN_WORKSPACE_SLUG),
    },
  },
});
```

### Next.js

```javascript
// next.config.js
module.exports = {
  env: {
    MARVIN_API_URL: process.env.MARVIN_API_URL,
    MARVIN_SITE_CLIENT_TOKEN: process.env.MARVIN_SITE_CLIENT_TOKEN,
    MARVIN_WORKSPACE_SLUG: process.env.MARVIN_WORKSPACE_SLUG,
  },
};
```

### Nuxt

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  runtimeConfig: {
    marvin: {
      apiUrl: process.env.MARVIN_API_URL,
      siteClientToken: process.env.MARVIN_SITE_CLIENT_TOKEN,
      workspaceSlug: process.env.MARVIN_WORKSPACE_SLUG,
    },
  },
});
```

## Next Steps

- [Core Concepts](../concepts/architecture.md)
- [API Reference](../api/client.md)
- [Security Best Practices](../reference/security.md)
