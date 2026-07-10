# Error Handling Guide

This guide covers error handling patterns when using the Marvin SDK.

## Error Types

The SDK throws standard JavaScript errors with descriptive messages. All errors follow a consistent structure.

### Common Error Categories

| Category | Description | HTTP Status |
|----------|-------------|-------------|
| **Authentication** | Invalid or missing tokens | 401 |
| **Authorization** | Insufficient permissions | 403 |
| **Not Found** | Resource doesn't exist | 404 |
| **Validation** | Invalid parameters | 400 |
| **Rate Limiting** | Too many requests | 429 |
| **Server** | Internal server errors | 500 |
| **Network** | Connection issues | - |

## HTTP Error Codes

### 400 Bad Request

Invalid request parameters.

```typescript
try {
  await marvin.entries.list({ limit: -1 }); // Invalid limit
} catch (error) {
  console.error(error.message);
  // "Invalid limit parameter: must be positive"
}
```

**Common Causes:**

- Invalid query parameters
- Malformed request body
- Invalid field values

**How to Fix:**

```typescript
// Validate parameters before calling
const options = {
  limit: Math.max(1, userLimit), // Ensure positive
  offset: Math.max(0, userOffset),
};

const entries = await marvin.entries.list(options);
```

### 401 Unauthorized

Invalid or missing authentication token.

```typescript
try {
  const marvin = createMarvinClient({
    apiUrl: 'https://marvin.example.com',
    siteClientToken: 'invalid-token',
    workspaceSlug: 'my-workspace',
  });
  await marvin.entries.list();
} catch (error) {
  console.error(error.message);
  // "Authentication failed: invalid token"
}
```

**Common Causes:**

- Missing `MARVIN_SITE_CLIENT_TOKEN`
- Expired user token
- Typo in token value
- Token for wrong workspace

**How to Fix:**

```typescript
// Check environment variables
if (!process.env.MARVIN_SITE_CLIENT_TOKEN) {
  throw new Error('MARVIN_SITE_CLIENT_TOKEN is required');
}

// Verify token format
const token = process.env.MARVIN_SITE_CLIENT_TOKEN;
if (!token.startsWith('marvin_sk_')) {
  console.warn('Token may be invalid (should start with marvin_sk_)');
}
```

### 403 Forbidden

Insufficient permissions.

```typescript
try {
  // Site client tokens are read-only
  await marvin.entries.create({ /* ... */ }); // Requires user token
} catch (error) {
  console.error(error.message);
  // "Forbidden: insufficient permissions"
}
```

**Common Causes:**

- Using site client token for write operations
- Token doesn't have required permissions
- Workspace membership issues

**How to Fix:**

For write operations, use the Platform API with a user token:

```typescript
import { createPlatformClient } from '@inneropen/marvin-sdk/platform';

const platform = createPlatformClient({
  apiUrl: 'https://marvin.example.com',
  userToken: process.env.MARVIN_USER_TOKEN!,
});

await platform.entries.create({ /* ... */ });
```

### 404 Not Found

Requested resource doesn't exist.

```typescript
try {
  const entry = await marvin.entry('nonexistent-slug');
} catch (error) {
  console.error(error.message);
  // "Entry not found: nonexistent-slug"
}
```

**Common Causes:**

- Typo in slug
- Entry deleted or unpublished
- Wrong workspace
- Entry not yet created

**How to Fix:**

```typescript
// Check if entry exists first
const entries = await marvin.entries.list();
const exists = entries.some(e => e.slug === 'my-slug');

if (exists) {
  const entry = await marvin.entry('my-slug');
} else {
  console.warn('Entry not found');
}

// Or handle gracefully
async function getEntryOrNull(slug: string) {
  try {
    return await marvin.entry(slug);
  } catch (error) {
    if (error.message.includes('not found')) {
      return null;
    }
    throw error;
  }
}
```

### 429 Too Many Requests

Rate limit exceeded.

```typescript
try {
  // Too many requests in short time
  for (let i = 0; i < 1000; i++) {
    await marvin.entry(`entry-${i}`);
  }
} catch (error) {
  console.error(error.message);
  // "Rate limit exceeded: retry after 60 seconds"
}
```

**Common Causes:**

- Too many API calls in short period
- No request caching
- Inefficient code patterns

**How to Fix:**

```typescript
// Use list() instead of individual get() calls
const slugs = ['entry-1', 'entry-2', 'entry-3'];

// ❌ Bad: Multiple requests
const entries = await Promise.all(
  slugs.map(slug => marvin.entry(slug))
);

// ✅ Good: Single request with filtering
const allEntries = await marvin.entries.list();
const entries = allEntries.filter(e => slugs.includes(e.slug));

// Enable caching
const marvin = createMarvinClient({
  cacheDuration: 10 * 60 * 1000, // 10 minutes
});
```

### 500 Internal Server Error

Server-side error.

```typescript
try {
  const entries = await marvin.entries.list();
} catch (error) {
  console.error(error.message);
  // "Internal server error"
}
```

**Common Causes:**

- Temporary server issues
- Database problems
- Backend bugs

**How to Fix:**

Implement retry logic with exponential backoff:

```typescript
async function fetchWithRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      
      // Only retry on server errors
      if (!error.message.includes('Internal server error')) {
        throw error;
      }
      
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
    }
  }
  throw new Error('Max retries exceeded');
}

// Usage
const entries = await fetchWithRetry(() => marvin.entries.list());
```

## Network Errors

### Connection Timeout

```typescript
try {
  const entries = await marvin.entries.list();
} catch (error) {
  if (error.code === 'ETIMEDOUT') {
    console.error('Connection timeout');
  }
}
```

**How to Fix:**

```typescript
// Increase timeout for slow connections
const marvin = createMarvinClient({
  timeout: 30000, // 30 seconds
});
```

### DNS Resolution Failed

```typescript
try {
  const marvin = createMarvinClient({
    apiUrl: 'https://invalid-domain-that-doesnt-exist.com',
  });
  await marvin.entries.list();
} catch (error) {
  if (error.code === 'ENOTFOUND') {
    console.error('DNS resolution failed');
  }
}
```

**How to Fix:**

Verify your `MARVIN_API_URL`:

```typescript
const apiUrl = process.env.MARVIN_API_URL;

// Basic validation
if (!apiUrl || !apiUrl.startsWith('https://')) {
  throw new Error('Invalid MARVIN_API_URL');
}
```

### Network Unreachable

```typescript
try {
  const entries = await marvin.entries.list();
} catch (error) {
  if (error.code === 'ENETUNREACH') {
    console.error('Network unreachable');
  }
}
```

**How to Fix:**

Check network connectivity and firewall rules.

## Error Handling Patterns

### Try/Catch

Basic error handling:

```typescript
try {
  const entry = await marvin.entry('my-slug');
  console.log(entry.title);
} catch (error) {
  console.error('Failed to fetch entry:', error.message);
}
```

### Async/Await with Error Handling

```typescript
async function fetchEntry(slug: string) {
  try {
    const entry = await marvin.entry(slug);
    return { success: true, data: entry };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

const result = await fetchEntry('my-slug');
if (result.success) {
  console.log(result.data.title);
} else {
  console.error(result.error);
}
```

### Promise.catch()

```typescript
marvin.entry('my-slug')
  .then(entry => console.log(entry.title))
  .catch(error => console.error('Error:', error.message));
```

### Fallback Values

```typescript
async function getEntryOrDefault(slug: string) {
  try {
    return await marvin.entry(slug);
  } catch (error) {
    console.warn(`Entry not found, using default: ${error.message}`);
    return {
      title: 'Default Entry',
      slug: 'default',
      dataJson: { body: 'Default content' },
    };
  }
}
```

### Error Classification

```typescript
class MarvinError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'MarvinError';
  }
}

function isAuthError(error: Error): boolean {
  return error.message.includes('Authentication') || 
         error.message.includes('Unauthorized');
}

function isNotFoundError(error: Error): boolean {
  return error.message.includes('not found');
}

function isRateLimitError(error: Error): boolean {
  return error.message.includes('Rate limit');
}

// Usage
try {
  const entry = await marvin.entry('my-slug');
} catch (error) {
  if (isAuthError(error)) {
    // Handle auth errors
  } else if (isNotFoundError(error)) {
    // Handle not found
  } else if (isRateLimitError(error)) {
    // Handle rate limiting
  } else {
    // Handle other errors
  }
}
```

## Retry Strategies

### Simple Retry

```typescript
async function retry<T>(
  fn: () => Promise<T>,
  retries = 3
): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === retries - 1) throw error;
    }
  }
  throw new Error('Unreachable');
}

const entries = await retry(() => marvin.entries.list());
```

### Exponential Backoff

```typescript
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      
      const delay = baseDelay * Math.pow(2, i);
      console.log(`Retry ${i + 1}/${maxRetries} after ${delay}ms`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error('Unreachable');
}
```

### Conditional Retry

Only retry on specific errors:

```typescript
async function retryOnServerError<T>(
  fn: () => Promise<T>,
  maxRetries = 3
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      const shouldRetry = 
        error.message.includes('Internal server error') ||
        error.message.includes('timeout') ||
        error.code === 'ETIMEDOUT';
      
      if (!shouldRetry || i === maxRetries - 1) {
        throw error;
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
  throw new Error('Unreachable');
}
```

## Production Error Handling

### Logging

```typescript
import { createMarvinClient } from '@inneropen/marvin-sdk';

const marvin = createMarvinClient();

async function fetchEntries() {
  try {
    return await marvin.entries.list();
  } catch (error) {
    // Log to monitoring service
    console.error('Marvin SDK Error:', {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    });
    
    // Re-throw or return fallback
    throw error;
  }
}
```

### Error Monitoring

```typescript
import * as Sentry from '@sentry/node';

try {
  const entries = await marvin.entries.list();
} catch (error) {
  Sentry.captureException(error, {
    tags: {
      service: 'marvin-sdk',
      operation: 'entries.list',
    },
  });
  throw error;
}
```

### Graceful Degradation

```typescript
async function getEntriesWithFallback() {
  try {
    return await marvin.entries.list();
  } catch (error) {
    console.error('Failed to fetch live entries:', error.message);
    
    // Fall back to cached data
    return loadEntriesFromCache();
  }
}
```

## Debugging Tips

### Enable Debug Logging

```typescript
const marvin = createMarvinClient({
  debug: true, // Log all requests/responses
});
```

### Inspect Error Details

```typescript
try {
  const entry = await marvin.entry('my-slug');
} catch (error) {
  console.error('Error details:', {
    message: error.message,
    name: error.name,
    stack: error.stack,
    cause: error.cause,
  });
}
```

### Test Error Handling

```typescript
// Simulate errors for testing
const marvin = createMarvinClient({
  apiUrl: 'https://invalid-url.com', // Force error
});

try {
  await marvin.entries.list();
} catch (error) {
  console.log('Error handling works!');
}
```

## Next Steps

- [Troubleshooting Guide](troubleshooting.md) - Debug common issues
- [Security Best Practices](security.md) - Secure error handling
- [TypeScript Types](types.md) - Type-safe error handling
