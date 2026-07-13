# Marvin SDK Authentication Guide

The Marvin SDK provides three distinct entry points for different use cases, each with its own authentication strategy.

## Entry Points

### 1. Publishing API (`/publish`)

**Use Case:** Read-only access to published content (frontends, websites, apps)

**Authentication:** Site client tokens via `MARVIN_SITE_CLIENT_TOKEN`

**Import:**
```typescript
import { createMarvinClient } from '@inneropen/marvin-sdk/publish';
```

**Example:**
```typescript
// From environment (MARVIN_SITE_CLIENT_TOKEN)
const marvin = createMarvinClient();

// Or explicit token
const marvin = createMarvinClient({
  siteClientToken: 'site_client_...'
});

// Read-only operations
const entry = await marvin.entry('about');
const projects = await marvin.projects();
const workspace = await marvin.getWorkspace();
```

**Environment Variables:**
- `MARVIN_API_URL` - API base URL (default: `http://localhost:8080`)
- `MARVIN_SITE_CLIENT_TOKEN` - Site client token for read-only access

---

### 2. Platform API (`/platform`)

**Use Case:** Full CRUD admin operations (backend services, admin tools, CLI)

**Authentication:** User tokens via `MARVIN_USER_TOKEN` OR session cookies

**Import:**
```typescript
import { createPlatformClient } from '@inneropen/marvin-sdk/platform';
```

**Example - Programmatic (Server/CLI):**
```typescript
// From environment (MARVIN_USER_TOKEN)
const platform = createPlatformClient();

// Or explicit user token
const platform = createPlatformClient({
  userToken: 'user_token_...'
});

// Full CRUD operations
await platform.entries.create({ title: 'New Post', ... });
await platform.collections.update(id, { name: 'Updated' });
await platform.assets.delete(id);
```

**Example - Browser (Admin UI):**
```typescript
// Uses session cookies after login
const platform = createPlatformClient({
  credentials: 'include'
});

// User must authenticate first via /auth API
// Then all requests use session cookies
```

**Environment Variables:**
- `MARVIN_API_URL` - API base URL (default: `http://localhost:8080`)
- `MARVIN_USER_TOKEN` - User authentication token (optional, for programmatic access)

---

### 3. Auth API (Public, Unauthenticated)

**Use Case:** User registration, login, password reset (no auth required)

**Authentication:** None required (public endpoints)

**Import:**
```typescript
import { createAuthClient } from '@inneropen/marvin-sdk';
```

**Example:**
```typescript
const auth = createAuthClient({
  apiUrl: 'https://marvin.example.com'
});

// Public auth operations
await auth.register({
  email: 'user@example.com',
  password: 'secure-password',
  first_name: 'John',
  last_name: 'Doe'
});

const token = await auth.login({
  email: 'user@example.com',
  password: 'secure-password'
});

await auth.forgotPassword({ email: 'user@example.com' });
```

---

## Authentication Strategies Summary

| Entry Point | Token Type | Environment Variable | Use Case |
|-------------|------------|---------------------|----------|
| `/publish` | Site Client Token | `MARVIN_SITE_CLIENT_TOKEN` | Read-only published content |
| `/platform` (programmatic) | User Token | `MARVIN_USER_TOKEN` | Backend admin operations |
| `/platform` (browser) | Session Cookies | N/A | Admin UI after login |
| Auth API | None | N/A | Public registration/login |

## Getting Tokens

### Site Client Token
1. Log into Marvin admin
2. Navigate to Settings → API Clients
3. Create new client or view existing token
4. Use this for read-only access in frontends

### User Token
1. Log into Marvin admin
2. Navigate to User Settings → API Tokens
3. Generate new personal access token
4. Use this for programmatic admin access (CLI, backend services)

### Session Authentication (Browser)
1. Use Auth API to login: `auth.login({ email, password })`
2. Browser stores session cookie automatically
3. Create Platform client with `credentials: 'include'`
4. All subsequent requests use session cookie

## Security Best Practices

The SDK includes comprehensive security features to protect your tokens and data:

### Automatic Token Sanitization

**All tokens are automatically redacted in debug logs and error messages:**

```typescript
// Debug mode safely masks sensitive data
const client = createMarvinClient({ debug: true });
await client.login({ email, password });
// Logs show: access_token: "[REDACTED]"
```

The SDK automatically sanitizes:
- `token`, `access_token`, `refresh_token`
- `password`, `secret`, `apiKey`
- `authorization`, `csrf_token`
- `session`, `cookie`

This works recursively on nested objects and arrays.

### CSRF Protection

**Enable CSRF protection for browser-based admin UIs:**

```typescript
const platform = createPlatformClient({ credentials: 'include' });

// After login, get CSRF token from server
const csrfToken = getCsrfTokenFromServer();
platform.session.setCsrfToken(csrfToken);

// All subsequent requests include X-CSRF-Token header
```

### Input Validation

**All user input is validated to prevent injection attacks:**

- Path parameters validated (prevents `../` attacks)
- Email addresses validated (RFC 5322 compliant)
- Webhook URLs validated (SSRF prevention)
- File uploads validated (size, type, filename)
- Form data validated (XSS prevention)

### Network Security

**Automatic retry and timeout protection:**

```typescript
const platform = createPlatformClient({
  retry: {
    maxRetries: 3,           // Automatic retry on failure
    initialDelay: 1000,      // Exponential backoff
    maxDelay: 10000
  },
  timeout: 30000             // Max 120s (enforced)
});
```

### Best Practices Checklist

1. **Never commit tokens** - Use environment variables
2. **Site client tokens** - Safe for frontend (read-only)
3. **User tokens** - Keep secret, server-side only
4. **Session cookies** - Browser-only, not for server-to-server
5. **Token rotation** - Regenerate user tokens periodically
6. **HTTPS only** - Always use HTTPS in production
7. **Debug mode** - Disable in production (tokens auto-sanitized, but still be cautious)
8. **CSRF tokens** - Enable for browser-based UIs
9. **Input validation** - Validate on your side too (defense in depth)
10. **Keep updated** - Use latest SDK version for security fixes

**[Complete Security Documentation →](./SECURITY_FIXES_SUMMARY.md)**

## Example: Complete Auth Flow

```typescript
import { createAuthClient } from '@inneropen/marvin-sdk';
import { createPlatformClient } from '@inneropen/marvin-sdk/platform';

// 1. Register new user
const auth = createAuthClient({ apiUrl: 'https://marvin.example.com' });
await auth.register({
  email: 'admin@example.com',
  password: 'secure-password',
  first_name: 'Admin',
  last_name: 'User'
});

// 2. Login and get token
const { access_token } = await auth.login({
  email: 'admin@example.com',
  password: 'secure-password'
});

// 3. Use token for platform operations
const platform = createPlatformClient({
  userToken: access_token
});

await platform.entries.create({
  title: 'My First Post',
  content: 'Hello world!'
});
```

## Troubleshooting

### "Authentication required" error
- Check that the correct token is set
- Verify token hasn't expired
- Ensure `credentials: 'include'` for browser session auth

### "Forbidden" error
- Site client tokens can only read, not write
- Check user permissions for platform operations
- Verify workspace access for the authenticated user

### Session not persisting
- Ensure `credentials: 'include'` in platform config
- Check that cookies are enabled in browser
- Verify CORS settings allow credentials
