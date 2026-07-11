# Security Best Practices

> 🔒 **Enterprise-Grade Security** | ✅ **Zero Vulnerabilities** | Last Audit: July 11, 2026

This guide covers security best practices when using the Marvin SDK in your applications.

## Security Status

**The Marvin SDK has achieved zero known security vulnerabilities** after a comprehensive security audit that fixed 20 issues:

- ✅ 8 HIGH priority vulnerabilities eliminated
- ✅ 7 MEDIUM priority security issues resolved
- ✅ 5 LOW priority code quality improvements implemented

**[View Complete Security Audit →](../../COMPLETE_SECURITY_AUDIT.md)**

## Built-In Security Features

The SDK includes comprehensive security protections:

### Input Validation

- **Path Injection Prevention** - All path parameters validated to prevent `../` traversal attacks
- **Email Validation** - RFC 5322 compliant email format validation
- **Webhook URL Validation** - SSRF prevention for webhook endpoints
- **File Upload Validation** - Size limits (10MB), MIME type checking, filename sanitization
- **Form Data Validation** - XSS prevention with script tag detection

### Data Protection

- **Automatic Token Sanitization** - Sensitive data automatically redacted in logs and errors
  - Tokens, passwords, secrets, API keys masked recursively
  - Works on nested objects and arrays
- **Password Security** - Email passwords never returned in API responses (write-only)
- **CSRF Protection** - Session authentication with CSRF token support

### Network Security

- **Retry Logic** - Automatic exponential backoff for transient failures (3 retries, configurable)
- **Timeout Limits** - Maximum 2-minute timeout to prevent resource exhaustion
- **Error Handling** - Comprehensive error types with actionable messages (no sensitive data leakage)

### Type Safety

- **100% TypeScript** - No `any` types, complete type coverage
- **Compile-Time Safety** - Catch errors before runtime

!!! success "Enterprise-Ready"
    The SDK has been audited and hardened for production use in enterprise environments.

**[View Security Fixes Summary →](../../SECURITY_FIXES_SUMMARY.md)**

## Authentication Tokens

### Site Client Tokens vs User Tokens

Marvin supports two types of tokens:

| Token Type | Use Case | Permissions | Lifetime |
|------------|----------|-------------|----------|
| **Site Client Token** | Server-side apps, SSG builds | Read-only access to published content | Long-lived (rotatable) |
| **User Token** | Platform API, admin operations | Full CRUD, user-specific permissions | Short-lived (expires) |

!!! success "Recommended: Site Client Tokens"
    Use site client tokens (`marvin_sk_*`) for most integrations. They provide read-only access to published content and are safe for build-time usage.

!!! danger "Never Use User Tokens in Client Code"
    User tokens grant full access to your workspace. Never expose them in browser code or commit them to version control.

### Creating Site Client Tokens

Create site client tokens in the Marvin admin:

1. Navigate to **Settings** → **API Tokens**
2. Click **Create Token**
3. Select **Site Client Token**
4. Set permissions (typically read-only)
5. Copy the token (it won't be shown again)

### Token Format

```
Site Client Token:  marvin_sk_1234567890abcdef...
User Token:         marvin_ut_1234567890abcdef...
```

## Environment Variables

### Secure Storage

**Always** store tokens in environment variables, never in source code:

=== "Node.js"

    ```env
    # .env (add to .gitignore!)
    MARVIN_API_URL=https://marvin.example.com
    MARVIN_SITE_CLIENT_TOKEN=marvin_sk_1234567890abcdef
    MARVIN_WORKSPACE_SLUG=my-workspace
    ```

    ```javascript
    // Load from environment
    import { createMarvinClient } from '@inneropen/marvin-sdk';

    const marvin = createMarvinClient();
    // Automatically reads from process.env
    ```

=== "Astro"

    ```env
    # .env (add to .gitignore!)
    PUBLIC_MARVIN_API_URL=https://marvin.example.com
    MARVIN_SITE_CLIENT_TOKEN=marvin_sk_1234567890abcdef
    PUBLIC_MARVIN_WORKSPACE_SLUG=my-workspace
    ```

    ```typescript
    // astro.config.mjs
    import { createMarvinClient } from '@inneropen/marvin-sdk';

    const marvin = createMarvinClient({
      apiUrl: import.meta.env.PUBLIC_MARVIN_API_URL,
      siteClientToken: import.meta.env.MARVIN_SITE_CLIENT_TOKEN,
      workspaceSlug: import.meta.env.PUBLIC_MARVIN_WORKSPACE_SLUG,
    });
    ```

=== "Next.js"

    ```env
    # .env.local (add to .gitignore!)
    NEXT_PUBLIC_MARVIN_API_URL=https://marvin.example.com
    MARVIN_SITE_CLIENT_TOKEN=marvin_sk_1234567890abcdef
    NEXT_PUBLIC_MARVIN_WORKSPACE_SLUG=my-workspace
    ```

    ```typescript
    // lib/marvin.ts
    import { createMarvinClient } from '@inneropen/marvin-sdk';

    export const marvin = createMarvinClient({
      apiUrl: process.env.NEXT_PUBLIC_MARVIN_API_URL!,
      siteClientToken: process.env.MARVIN_SITE_CLIENT_TOKEN!,
      workspaceSlug: process.env.NEXT_PUBLIC_MARVIN_WORKSPACE_SLUG!,
    });
    ```

### Environment Variable Checklist

- ✅ Store tokens in `.env` files
- ✅ Add `.env` to `.gitignore`
- ✅ Document required env vars in README
- ✅ Use different tokens for development, staging, production
- ✅ Rotate tokens periodically
- ❌ Never commit `.env` files
- ❌ Never log tokens to console (SDK automatically sanitizes, but still be cautious)
- ❌ Never expose tokens in error messages (SDK automatically sanitizes)

!!! tip "Automatic Token Sanitization"
    The SDK automatically redacts tokens in debug logs and error messages, but you should still avoid logging sensitive data manually.

## Server-Side Only Usage

### The Rule

!!! danger "Critical Security Rule"
    **The Marvin SDK must only be used in server-side code.** Never use it in browser JavaScript.

### Why?

When you use the SDK in browser code:

1. Your site client token is exposed in the JavaScript bundle
2. Anyone can extract it and access your workspace
3. Attackers can abuse your API quota
4. You risk data leaks if permissions change

### Safe Usage Patterns

#### ✅ Static Site Generation (SSG)

Build-time usage is safe because the SDK runs on your build server:

```typescript
// astro.config.mjs (runs at build time)
import { createMarvinClient } from '@inneropen/marvin-sdk';

const marvin = createMarvinClient();
const entries = await marvin.entries.list();

// Entries are baked into static HTML
// Token never reaches the browser
```

#### ✅ Server-Side Rendering (SSR)

Server-side rendering is safe because the SDK runs on your server:

```typescript
// pages/api/posts.ts (Next.js API route)
import { createMarvinClient } from '@inneropen/marvin-sdk';

export default async function handler(req, res) {
  const marvin = createMarvinClient();
  const posts = await marvin.posts();
  res.json(posts);
}
```

#### ❌ Client-Side Fetching

**Never** use the SDK in browser code:

```typescript
// ❌ BAD: This exposes your token!
import { createMarvinClient } from '@inneropen/marvin-sdk';

function MyComponent() {
  useEffect(() => {
    const marvin = createMarvinClient(); // Token in browser bundle!
    marvin.entries.list().then(setEntries);
  }, []);
}
```

#### ✅ Use Server Endpoints Instead

Create a server endpoint that uses the SDK:

```typescript
// app/api/entries/route.ts (Next.js App Router)
import { createMarvinClient } from '@inneropen/marvin-sdk';

export async function GET() {
  const marvin = createMarvinClient();
  const entries = await marvin.entries.list();
  return Response.json(entries);
}
```

```typescript
// components/EntryList.tsx (Client component)
export function EntryList() {
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    // Fetch from your server endpoint
    fetch('/api/entries')
      .then(r => r.json())
      .then(setEntries);
  }, []);
}
```

## Token Rotation

### When to Rotate

Rotate site client tokens:

- Every 90 days (recommended)
- After a security incident
- When a team member leaves
- After accidental exposure

### How to Rotate

1. Create a new site client token
2. Update environment variables in all environments
3. Deploy with new token
4. Verify new token works
5. Revoke old token

### Zero-Downtime Rotation

For production systems, use overlapping tokens:

1. Create new token but keep old one active
2. Update production environment variables
3. Deploy and verify
4. Wait 24 hours (cache TTL)
5. Revoke old token

## HTTPS Requirements

!!! warning "HTTPS Only"
    Always use HTTPS for API requests. The SDK enforces HTTPS in production.

```typescript
// ✅ Good
const marvin = createMarvinClient({
  apiUrl: 'https://marvin.example.com', // HTTPS
});

// ❌ Bad (will fail in production)
const marvin = createMarvinClient({
  apiUrl: 'http://marvin.example.com', // HTTP
});
```

**Exception:** HTTP is allowed for localhost during development:

```typescript
// ✅ OK for local development
const marvin = createMarvinClient({
  apiUrl: 'http://localhost:3000',
});
```

## Network Security

### Firewall Configuration

If your build server uses a firewall, whitelist:

- Your Marvin API domain (e.g., `marvin.example.com`)
- Port 443 (HTTPS)

### Proxy Support

The SDK respects standard proxy environment variables:

```bash
export HTTPS_PROXY=http://proxy.example.com:8080
export NO_PROXY=localhost,127.0.0.1
```

## Content Security

### Sanitize User-Generated Content

Always sanitize content from Marvin before rendering:

```typescript
import DOMPurify from 'dompurify';
import { marked } from 'marked';

const entry = await marvin.entry('user-submitted');
const body = entry.field<string>('body');

// Sanitize HTML
const html = DOMPurify.sanitize(marked(body));
```

### Asset URLs

Asset URLs from Marvin are safe to use but validate them if you allow user uploads:

```typescript
const asset = await marvin.assets.get('user-upload');

// Validate asset type
if (asset.assetType !== 'image') {
  throw new Error('Invalid asset type');
}

// Validate file size
if (asset.fileSize > 10 * 1024 * 1024) {
  throw new Error('File too large');
}
```

## Rate Limiting

### SDK Rate Limits

The SDK includes built-in rate limiting:

- Site Client Tokens: 300 requests/minute
- User Tokens: 60 requests/minute

### Best Practices

1. **Use caching** to reduce API calls
2. **Batch requests** when possible
3. **Implement exponential backoff** for retries
4. **Monitor quota usage** in production

```typescript
const marvin = createMarvinClient({
  cacheDuration: 10 * 60 * 1000, // 10 minutes
});
```

## Secrets Management

### Production Environments

Use a secrets manager:

=== "AWS Secrets Manager"

    ```typescript
    import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

    const client = new SecretsManagerClient({ region: 'us-east-1' });
    const response = await client.send(
      new GetSecretValueCommand({ SecretId: 'marvin/prod/token' })
    );
    const token = JSON.parse(response.SecretString).token;

    const marvin = createMarvinClient({
      siteClientToken: token,
    });
    ```

=== "HashiCorp Vault"

    ```typescript
    import vault from 'node-vault';

    const vaultClient = vault({ endpoint: 'https://vault.example.com' });
    const secret = await vaultClient.read('secret/marvin/prod');

    const marvin = createMarvinClient({
      siteClientToken: secret.data.token,
    });
    ```

=== "Vercel Environment Variables"

    ```bash
    # Vercel CLI
    vercel env add MARVIN_SITE_CLIENT_TOKEN production
    ```

## Advanced Security Features

### CSRF Protection

Enable CSRF protection for browser-based admin UIs:

```typescript
import { createPlatformClient } from '@inneropen/marvin-sdk/platform';

const platform = createPlatformClient({ credentials: 'include' });

// After login, get CSRF token from server response
const csrfToken = getCsrfTokenFromServer();
platform.session.setCsrfToken(csrfToken);

// All subsequent requests include X-CSRF-Token header
await platform.entries.create({ ... });
```

### Custom Retry Configuration

Configure retry behavior for network resilience:

```typescript
const platform = createPlatformClient({
  retry: {
    maxRetries: 5,           // Default: 3
    initialDelay: 2000,      // Default: 1000ms
    maxDelay: 30000,         // Default: 10000ms
    retryableStatuses: [408, 429, 500, 502, 503, 504]
  }
});
```

### Validation Examples

The SDK automatically validates all inputs:

```typescript
// Path injection prevention
try {
  await platform.entries.get('../../../etc/passwd');
} catch (error) {
  // Throws: MarvinValidationError - Invalid path parameter
}

// Email validation
try {
  await auth.register({ email: 'invalid-email', ... });
} catch (error) {
  // Throws: MarvinValidationError - Invalid email format
}

// File upload validation
try {
  await platform.assets.upload({
    file: tooLargeFile, // > 10MB
    ...
  });
} catch (error) {
  // Throws: MarvinValidationError - File too large
}
```

## Security Checklist

Before deploying to production:

- [ ] Site client token stored in environment variables
- [ ] `.env` files added to `.gitignore`
- [ ] SDK only used in server-side code
- [ ] HTTPS enabled for API URL
- [ ] Token rotation schedule established
- [ ] Rate limiting configured
- [ ] Content sanitization implemented
- [ ] Error messages don't leak tokens (automatic)
- [ ] Logging doesn't expose tokens (automatic)
- [ ] Secrets manager configured (production)
- [ ] CSRF protection enabled (browser admin UIs)
- [ ] Using latest SDK version (v2.0.1+)

## Reporting Security Issues

If you discover a security vulnerability:

1. **Do not** open a public GitHub issue
2. Email security@inneropen.io
3. Include detailed reproduction steps
4. Allow coordinated disclosure timeline

See [SECURITY.md](../../SECURITY.md) for our complete security policy.

## Security Resources

- 🔒 [Complete Security Audit](../../COMPLETE_SECURITY_AUDIT.md) - Full audit report
- 📋 [Security Fixes Summary](../../SECURITY_FIXES_SUMMARY.md) - Migration guide
- 🔐 [Security Policy](../../SECURITY.md) - Vulnerability reporting
- 🧪 [Testing Guide](../../TESTING.md) - Security test examples
- ⚠️ [Error Handling Guide](../../ERROR_HANDLING_GUIDE.md) - Error patterns

## Next Steps

- [Error Handling](errors.md) - Handle errors securely
- [Troubleshooting](troubleshooting.md) - Debug common issues
- [TypeScript Types](types.md) - Type-safe development
- [Authentication Guide](../../AUTHENTICATION.md) - Complete auth documentation
