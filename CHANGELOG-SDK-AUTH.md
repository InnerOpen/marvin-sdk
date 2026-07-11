# SDK Authentication Architecture - Implementation Summary

## What We Built

Separated the Marvin SDK into three distinct, well-documented entry points with clear authentication strategies.

## Entry Points

### 1. `/publish` - Publishing API (NEW)
**File:** `src/publish.ts`

**Purpose:** Read-only access to published content

**Authentication:** Site client tokens (`MARVIN_SITE_CLIENT_TOKEN`)

**Usage:**
```typescript
import { createMarvinClient } from '@inneropen/marvin-sdk/publish';
const marvin = createMarvinClient();
```

**Exports:**
- `MarvinClient` - Read-only publishing client
- `createMarvinClient()` - Factory with env defaults
- Publishing types and utilities
- BearerTokenAuth for site client tokens

### 2. `/platform` - Platform API (ENHANCED)
**File:** `src/platform.ts` → `src/platform/client.ts`

**Purpose:** Full CRUD admin operations

**Authentication:** 
- User tokens (`MARVIN_USER_TOKEN`) - for programmatic access
- Session cookies (`credentials: 'include'`) - for browser admin UI

**Changes:**
- Added `createPlatformConfigFromEnv()` helper
- Made `PlatformClientConfig.apiUrl` optional (defaults from env)
- `createPlatformClient()` now accepts optional config (reads from env)

**Usage:**
```typescript
import { createPlatformClient } from '@inneropen/marvin-sdk/platform';

// From environment
const platform = createPlatformClient();

// Explicit token
const platform = createPlatformClient({ 
  userToken: 'user_token_...' 
});

// Browser with session
const platform = createPlatformClient({ 
  credentials: 'include' 
});
```

**Exports:**
- `PlatformClient` - Full CRUD admin client
- `createPlatformClient()` - Factory with env defaults
- `createPlatformConfigFromEnv()` - Config helper
- All platform modules and types

### 3. Default Export - Auth + Publishing
**File:** `src/index.ts` (unchanged)

**Purpose:** Public authentication + backwards compatible publishing API

**Authentication:** None required for auth operations

**Usage:**
```typescript
import { createAuthClient } from '@inneropen/marvin-sdk';

const auth = createAuthClient({ apiUrl: '...' });
await auth.register({ email, password, ... });
const token = await auth.login({ email, password });
```

**Exports:**
- `AuthClient` - Public registration/login
- `MarvinClient` - Publishing client (backwards compatible)
- All types and utilities

## Environment Variables

### Publishing API
```env
MARVIN_API_URL=https://marvin.example.com
MARVIN_SITE_CLIENT_TOKEN=site_client_abc123
MARVIN_WORKSPACE_SLUG=my-workspace
```

### Platform API (Programmatic)
```env
MARVIN_API_URL=https://marvin.example.com
MARVIN_USER_TOKEN=user_token_xyz789
```

### Platform API (Browser)
No environment variables needed - uses session cookies after login

## Documentation

### Created Files
1. **AUTHENTICATION.md** - Comprehensive authentication guide
   - Entry point comparison
   - Token types and usage
   - Security best practices
   - Complete auth flow examples
   - Troubleshooting guide

2. **examples/authentication-examples.ts** - Working code examples
   - Publishing API example
   - Platform API (programmatic)
   - Platform API (browser)
   - Auth API example
   - Complete auth flow
   - Mixed frontend/backend usage

3. **Updated README.md**
   - Clear entry point documentation
   - Quick start for each use case
   - Links to authentication guide

## Build Configuration

**package.json changes:**
```json
{
  "exports": {
    ".": "...",           // Auth + Publishing (default)
    "./publish": "...",   // NEW: Dedicated publishing entry
    "./platform": "...",  // Enhanced with env support
    "./core": "...",      // Utilities
    "./types": "..."      // Type definitions
  },
  "scripts": {
    "build": "tsup src/index.ts src/publish.ts src/platform.ts src/types/index.ts ...",
    "dev": "tsup src/index.ts src/publish.ts src/platform.ts src/types/index.ts ..."
  }
}
```

## Migration Guide

### For Publishing API Users
**Before:**
```typescript
import { createMarvinClient } from '@inneropen/marvin-sdk';
```

**After:**
```typescript
import { createMarvinClient } from '@inneropen/marvin-sdk/publish';
```

**Why:** Explicit separation between read-only publishing and admin operations

### For Platform API Users
**Before:**
```typescript
import { createPlatformClient } from '@inneropen/marvin-sdk/platform';

const platform = createPlatformClient({
  apiUrl: process.env.MARVIN_API_URL,
  userToken: process.env.MARVIN_USER_TOKEN
});
```

**After:**
```typescript
import { createPlatformClient } from '@inneropen/marvin-sdk/platform';

// Now with environment defaults!
const platform = createPlatformClient();
```

**Why:** Simpler usage, consistent with Publishing API patterns

## Security Architecture

### Token Hierarchy
1. **Site Client Tokens** (`MARVIN_SITE_CLIENT_TOKEN`)
   - Read-only access
   - Safe for frontend exposure
   - Scoped to workspace
   - Used by Publishing API

2. **User Tokens** (`MARVIN_USER_TOKEN`)
   - Full CRUD access
   - Backend/server-side only
   - Personal access tokens
   - Used by Platform API (programmatic)

3. **Session Cookies**
   - Full CRUD access
   - Browser-only
   - Temporary (session-based)
   - Used by Platform API (browser)

### Security Best Practices Documented
- Never commit tokens
- Site client tokens safe for frontend
- User tokens server-side only
- Session cookies browser-only
- Token rotation recommendations

## Testing

Verified all entry points load correctly:
```bash
node test-exports.mjs
✓ Publishing API exports: createMarvinClient, MarvinClient, ...
✓ Platform API exports: createPlatformClient, PlatformClient, ...
✓ Main exports: createAuthClient, AuthClient, ...
```

## Commit

**Hash:** `36e00b2`

**Message:** `feat: Add dedicated /publish entry point and MARVIN_USER_TOKEN support`

**Type:** Breaking change (but backwards compatible via default export)

## Next Steps

1. Update documentation site with new authentication architecture
2. Create migration guide for existing SDK users
3. Add tests for environment variable handling
4. Consider adding token validation utilities
5. Document Platform API in mkdocs (currently only has Publishing API docs)

## Benefits

1. **Clear Separation of Concerns**
   - Publishing (read) vs Platform (write) vs Auth (public)
   
2. **Better Security**
   - Clear token usage patterns
   - Prevents accidental exposure of admin tokens
   
3. **Improved DX**
   - Environment variable support out of the box
   - No config boilerplate for common cases
   
4. **Better Documentation**
   - Comprehensive auth guide
   - Working examples for all use cases
   
5. **Backwards Compatible**
   - Default export still works
   - Existing code continues to function
