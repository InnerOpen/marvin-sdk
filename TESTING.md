# Testing Strategy for Marvin SDK

This document outlines the testing strategy and expectations for the Marvin TypeScript SDK.

## Testing Philosophy

**Security-critical paths must be tested. Everything else is optional.**

The SDK has extensive input validation and security features. Tests should verify these work correctly, especially for user-controlled inputs.

---

## Priority Levels

### P0: Critical - Must Test

Security-critical functionality that prevents attacks or data exposure.

**Coverage Target:** 100%

**Examples:**
- Input validation (path parameters, emails, URLs, webhooks)
- Authentication token handling
- File upload validation
- Form submission sanitization
- CSRF protection

### P1: High - Should Test

Core functionality that users depend on for basic operations.

**Coverage Target:** 80%+

**Examples:**
- CRUD operations (create, read, update, delete)
- HTTP client retry logic
- Error handling and error types
- Configuration validation
- Cache operations

### P2: Medium - Nice to Test

Helper functions and convenience methods.

**Coverage Target:** 60%+

**Examples:**
- Utility functions
- Type conversions
- URL building
- Query string generation

### P3: Low - Optional

Documentation examples and integration scenarios.

**Coverage Target:** No specific target

**Examples:**
- Integration tests with real API
- End-to-end workflows
- Performance tests

---

## Test Categories

### 1. Security Tests (P0)

Test all security features added in this security audit.

#### Path Parameter Validation
```typescript
describe('Path Parameter Validation', () => {
  it('should prevent path traversal attacks', () => {
    const client = createPlatformClient();
    
    // Should throw on path traversal
    expect(() => client.entries.get('../../../etc/passwd'))
      .toThrow(MarvinValidationError);
    
    expect(() => client.entries.get('entry/../admin'))
      .toThrow(MarvinValidationError);
  });

  it('should prevent null byte injection', () => {
    expect(() => client.entries.get('entry\0'))
      .toThrow(MarvinValidationError);
  });

  it('should accept valid IDs', () => {
    // Should NOT throw
    expect(() => client.entries.get('abc123')).not.toThrow();
    expect(() => client.entries.get('entry-slug-123')).not.toThrow();
  });
});
```

#### Webhook URL Validation (SSRF Prevention)
```typescript
describe('Webhook URL Validation', () => {
  it('should block localhost URLs', async () => {
    await expect(
      webhooks.create({ url: 'http://localhost/webhook', name: 'Test' })
    ).rejects.toThrow('cannot target localhost');
  });

  it('should block private IP ranges', async () => {
    await expect(
      webhooks.create({ url: 'http://192.168.1.1/webhook', name: 'Test' })
    ).rejects.toThrow('private IP range');

    await expect(
      webhooks.create({ url: 'http://10.0.0.1/webhook', name: 'Test' })
    ).rejects.toThrow('private IP range');
  });

  it('should block AWS metadata service', async () => {
    await expect(
      webhooks.create({ url: 'http://169.254.169.254/latest/meta-data', name: 'Test' })
    ).rejects.toThrow('private IP range');
  });

  it('should accept valid public URLs', async () => {
    // Mock HTTP client to avoid actual network call
    const result = await webhooks.create({
      url: 'https://hooks.example.com/webhook',
      name: 'Valid Webhook'
    });
    expect(result).toBeDefined();
  });
});
```

#### Email Validation
```typescript
describe('Email Validation', () => {
  it('should reject invalid email formats', () => {
    expect(() => validateEmail('notanemail')).toThrow();
    expect(() => validateEmail('user@')).toThrow();
    expect(() => validateEmail('@example.com')).toThrow();
    expect(() => validateEmail('user..name@example.com')).toThrow();
  });

  it('should accept valid emails', () => {
    expect(validateEmail('user@example.com')).toBe('user@example.com');
    expect(validateEmail('user+tag@example.co.uk')).toBe('user+tag@example.co.uk');
  });

  it('should trim whitespace', () => {
    expect(validateEmail('  user@example.com  ')).toBe('user@example.com');
  });
});
```

#### File Upload Validation
```typescript
describe('File Upload Validation', () => {
  it('should reject files exceeding size limit', async () => {
    const largeFile = new File(
      [new ArrayBuffer(200 * 1024 * 1024)], // 200MB
      'large.jpg'
    );

    await expect(
      assets.upload(largeFile, { slug: 'test', name: 'Test' }, {
        maxFileSize: 100 * 1024 * 1024 // 100MB limit
      })
    ).rejects.toThrow('exceeds maximum allowed size');
  });

  it('should reject disallowed MIME types', async () => {
    const txtFile = new File(['text'], 'file.txt', { type: 'text/plain' });

    await expect(
      assets.upload(txtFile, { slug: 'test', name: 'Test' }, {
        allowedMimeTypes: ['image/*']
      })
    ).rejects.toThrow('not allowed');
  });

  it('should accept valid files', async () => {
    const imageFile = new File(['data'], 'image.jpg', { type: 'image/jpeg' });
    
    const result = await assets.upload(
      imageFile,
      { slug: 'test', name: 'Test' },
      { maxFileSize: 10 * 1024 * 1024, allowedMimeTypes: ['image/*'] }
    );
    
    expect(result).toBeDefined();
  });
});
```

#### Debug Log Sanitization
```typescript
describe('Debug Log Sanitization', () => {
  it('should redact tokens from logs', () => {
    const data = {
      user: 'john',
      access_token: 'secret_token_123',
      profile: { name: 'John' }
    };

    const sanitized = sanitizeForLogging(data);
    
    expect(sanitized.access_token).toBe('[REDACTED]');
    expect(sanitized.user).toBe('john');
    expect(sanitized.profile).toEqual({ name: 'John' });
  });

  it('should redact passwords', () => {
    const data = { email: 'user@example.com', password: 'secret123' };
    const sanitized = sanitizeForLogging(data);
    
    expect(sanitized.password).toBe('[REDACTED]');
    expect(sanitized.email).toBe('user@example.com');
  });

  it('should handle nested objects', () => {
    const data = {
      auth: { token: 'secret', user: 'john' },
      data: { apiKey: 'key123' }
    };
    
    const sanitized = sanitizeForLogging(data);
    
    expect(sanitized.auth.token).toBe('[REDACTED]');
    expect(sanitized.data.apiKey).toBe('[REDACTED]');
    expect(sanitized.auth.user).toBe('john');
  });
});
```

---

### 2. Functional Tests (P1)

Test core SDK functionality.

#### HTTP Client Retry Logic
```typescript
describe('HTTP Client Retry Logic', () => {
  it('should retry on 429 status', async () => {
    let attempts = 0;
    mockFetch(() => {
      attempts++;
      if (attempts < 3) {
        return { status: 429, statusText: 'Too Many Requests' };
      }
      return { status: 200, json: () => Promise.resolve({ data: 'success' }) };
    });

    const result = await client.get('/test');
    
    expect(attempts).toBe(3);
    expect(result.data).toBe('success');
  });

  it('should respect maxRetries limit', async () => {
    let attempts = 0;
    mockFetch(() => {
      attempts++;
      return { status: 503, statusText: 'Service Unavailable' };
    });

    await expect(client.get('/test')).rejects.toThrow(MarvinServerError);
    expect(attempts).toBe(4); // Initial + 3 retries
  });

  it('should use exponential backoff', async () => {
    const delays: number[] = [];
    jest.spyOn(global, 'setTimeout').mockImplementation((fn, delay) => {
      delays.push(delay);
      fn();
      return 0 as any;
    });

    // Test that delays increase exponentially
    // Initial: 1000ms, 2nd: 2000ms, 3rd: 4000ms
  });
});
```

#### CRUD Operations
```typescript
describe('Entries CRUD', () => {
  it('should create an entry', async () => {
    const entry = await entries.create({
      title: 'Test Entry',
      content: 'Test content'
    });
    
    expect(entry.id).toBeDefined();
    expect(entry.title).toBe('Test Entry');
  });

  it('should get an entry by ID', async () => {
    const entry = await entries.get('entry-123');
    expect(entry.id).toBe('entry-123');
  });

  it('should update an entry', async () => {
    const updated = await entries.update('entry-123', {
      title: 'Updated Title'
    });
    
    expect(updated.title).toBe('Updated Title');
  });

  it('should delete an entry', async () => {
    await entries.delete('entry-123');
    // Verify via get() throwing 404
  });

  it('should throw on not found', async () => {
    await expect(entries.get('nonexistent'))
      .rejects.toThrow(MarvinNotFoundError);
  });
});
```

---

### 3. Integration Tests (P2)

Test SDK against real or mocked Marvin API.

```typescript
describe('Publishing API Integration', () => {
  let marvin: MarvinClient;

  beforeAll(() => {
    marvin = createMarvinClient({
      apiUrl: process.env.TEST_API_URL || 'http://localhost:8080',
      siteClientToken: process.env.TEST_SITE_CLIENT_TOKEN,
      workspaceSlug: 'test-workspace'
    });
  });

  it('should fetch workspace info', async () => {
    const workspace = await marvin.getWorkspace();
    expect(workspace.slug).toBe('test-workspace');
  });

  it('should list entries', async () => {
    const entries = await marvin.entries.list();
    expect(Array.isArray(entries)).toBe(true);
  });
});
```

---

## Running Tests

```bash
# Run all tests
npm test

# Run security tests only
npm test -- --grep="Security"

# Run with coverage
npm test -- --coverage

# Watch mode
npm test -- --watch
```

---

## Coverage Targets

| Category | Target | Priority |
|----------|--------|----------|
| Security validation | 100% | P0 |
| CRUD operations | 80% | P1 |
| HTTP client | 80% | P1 |
| Error handling | 75% | P1 |
| Utilities | 60% | P2 |
| Overall | 70%+ | - |

---

## Test Checklist

When adding new features, ensure:

- [ ] Security-critical paths have tests
- [ ] Error cases are tested (not just happy path)
- [ ] Edge cases are covered (empty, null, invalid input)
- [ ] Type safety is verified (TypeScript compilation)
- [ ] Documentation examples actually work

---

## Mocking Strategy

### Mock HTTP Requests
```typescript
import { jest } from '@jest/globals';

global.fetch = jest.fn((url, options) => {
  // Return mock responses based on URL/method
  if (url.includes('/entries')) {
    return Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ id: '1', title: 'Test' })
    });
  }
  // ... other endpoints
});
```

### Mock Environment Variables
```typescript
const OLD_ENV = process.env;

beforeEach(() => {
  jest.resetModules();
  process.env = { ...OLD_ENV };
  process.env.MARVIN_API_URL = 'http://test.api';
});

afterAll(() => {
  process.env = OLD_ENV;
});
```

---

## CI/CD Integration

Tests should run on:
- Every commit (pre-commit hook)
- Every PR (GitHub Actions)
- Before release (automated)

```yaml
# .github/workflows/test.yml
name: Test
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm test
      - run: npm run test:security  # Run security tests separately
```

---

## Security Test Maintenance

Review and update security tests when:
- Adding new input validation
- Changing authentication logic
- Updating sanitization/escaping
- Modifying error handling
- Adding new API endpoints

**Security tests must never be skipped or disabled.**

---

## Summary

**Test what matters:** Security-critical paths and core functionality.  
**Don't test everything:** Focus on high-value, high-risk areas.  
**Make tests maintainable:** Clear names, good documentation, easy to run.

The SDK is production-ready when:
1. ✅ All security tests pass
2. ✅ Core CRUD tests pass
3. ✅ Coverage meets targets
4. ✅ No flaky tests
