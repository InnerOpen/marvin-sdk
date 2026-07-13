# Error Handling Guidelines

This document establishes consistent error handling patterns across the Marvin SDK.

## Core Principle

**Errors should be explicit and actionable.**

## When to Throw vs Return Null

### Throw Exceptions When:

1. **Invalid Input** - User provided bad data
   ```typescript
   async get(id: string): Promise<Entry> {
     if (!id) throw new MarvinValidationError('ID is required');
     return this.http.get(`/entries/${id}`);
   }
   ```

2. **Network/API Failures** - Infrastructure problems
   ```typescript
   // These are thrown by HttpClient automatically:
   // - MarvinNetworkError (network/timeout)
   // - MarvinServerError (500+ status codes)
   // - MarvinApiError (generic API errors)
   ```

3. **Authorization Failures** - Auth problems
   ```typescript
   // MarvinAuthError thrown for 401/403
   // User needs to re-authenticate or lacks permissions
   ```

4. **Configuration Errors** - SDK misconfiguration
   ```typescript
   if (!config.apiUrl) {
     throw new MarvinConfigError('apiUrl is required');
   }
   ```

### Return Null When:

1. **Optional Resources** - Resource may legitimately not exist
   ```typescript
   async tryGetEntry(slug: string): Promise<Entry | null> {
     try {
       return await this.getEntry(slug);
     } catch (error) {
       if (error instanceof MarvinNotFoundError) {
         return null; // Expected - entry doesn't exist
       }
       throw error; // Unexpected - re-throw
     }
   }
   ```

2. **Graceful Degradation** - Feature can work without resource
   ```typescript
   async getOptionalConfig(): Promise<Config | null> {
     try {
       return await this.http.get('/config');
     } catch {
       return null; // App can work with defaults
     }
   }
   ```

### Never Silently Swallow Errors

❌ **Bad:**
```typescript
async doSomething() {
  try {
    await riskyOperation();
  } catch {
    // Silent failure - caller has no idea it failed!
  }
}
```

✅ **Good:**
```typescript
async doSomething() {
  try {
    await riskyOperation();
  } catch (error) {
    // Log for debugging
    console.error('Operation failed:', error);
    // Either re-throw or return explicit failure state
    throw error;
  }
}
```

## Error Type Hierarchy

```
MarvinError (base)
├── MarvinApiError (API returned error)
│   ├── MarvinNotFoundError (404)
│   ├── MarvinAuthError (401/403)
│   └── MarvinServerError (500+)
├── MarvinNetworkError (network/timeout)
├── MarvinValidationError (bad input)
└── MarvinConfigError (SDK misconfiguration)
```

## Patterns by Module Type

### CRUD Modules (Entries, Collections, Resources, etc.)

```typescript
class EntriesModule {
  // GET by ID - throw on not found (caller expects it to exist)
  async get(id: string): Promise<Entry> {
    return this.http.get(`/entries/${id}`);
    // Throws MarvinNotFoundError if 404
  }

  // GET by slug - return null if not found (slug might be user input)
  async getBySlug(slug: string): Promise<Entry | null> {
    try {
      return await this.http.get(`/entries/slug/${slug}`);
    } catch (error) {
      if (error instanceof MarvinNotFoundError) {
        return null;
      }
      throw error;
    }
  }

  // LIST - return empty array if none found
  async list(): Promise<Entry[]> {
    return this.http.get('/entries');
    // Returns [] if empty, not null
  }

  // CREATE - throw on validation errors
  async create(data: EntryCreate): Promise<Entry> {
    return this.http.post('/entries', data);
    // Throws MarvinApiError if validation fails
  }

  // UPDATE - throw on not found
  async update(id: string, data: EntryUpdate): Promise<Entry> {
    return this.http.patch(`/entries/${id}`, data);
    // Throws MarvinNotFoundError if entry doesn't exist
  }

  // DELETE - throw on not found (can't delete what doesn't exist)
  async delete(id: string): Promise<void> {
    return this.http.delete(`/entries/${id}`);
    // Throws MarvinNotFoundError if entry doesn't exist
  }
}
```

### Auth Modules

```typescript
class AuthClient {
  // Login - throw on invalid credentials
  async login(credentials: LoginRequest): Promise<AuthToken> {
    return this.post('/auth/token', credentials);
    // Throws MarvinAuthError if credentials invalid
  }

  // Register - throw on validation errors
  async register(data: UserRegistration): Promise<User> {
    return this.post('/users/register', data);
    // Throws MarvinApiError if email already exists, etc.
  }

  // Forgot password - always return success (don't leak user existence)
  async forgotPassword(data: { email: string }): Promise<{ message: string }> {
    return this.post('/users/forgot-password', data);
    // Always returns success, even if email not found (security)
  }
}
```

### Validation Helpers

```typescript
// Validation helpers should throw MarvinValidationError
validateEmail(email: string): string {
  if (!email || !EMAIL_REGEX.test(email)) {
    throw new MarvinValidationError('Invalid email format');
  }
  return email;
}

validateUrl(url: string): string {
  try {
    new URL(url);
  } catch {
    throw new MarvinValidationError('Invalid URL format');
  }
  return url;
}
```

## Error Messages

### Good Error Messages

✅ Specific and actionable:
```typescript
throw new MarvinValidationError('Email format is invalid. Expected: user@domain.com');
throw new MarvinAuthError('Invalid credentials. Please check username and password.');
throw new MarvinNotFoundError('Entry with ID "abc123" not found');
```

### Bad Error Messages

❌ Vague or unhelpful:
```typescript
throw new Error('Invalid input'); // What input? Why invalid?
throw new Error('Failed'); // What failed? Why?
throw new Error('Error'); // Useless
```

## Rethrowing Errors

When catching to add context:

```typescript
async processEntry(id: string): Promise<void> {
  try {
    const entry = await this.entries.get(id);
    await this.validate(entry);
    await this.publish(entry);
  } catch (error) {
    // Add context before rethrowing
    if (error instanceof MarvinError) {
      throw new MarvinApiError(
        `Failed to process entry ${id}: ${error.message}`,
        error.statusCode || 500,
        `/entries/${id}`
      );
    }
    throw error;
  }
}
```

## Async Error Handling

Always use try/catch with async/await:

```typescript
// ❌ Bad - unhandled promise rejection
async doWork() {
  this.riskyOperation(); // Forgot await! Error goes unhandled
}

// ✅ Good
async doWork() {
  try {
    await this.riskyOperation();
  } catch (error) {
    this.handleError(error);
  }
}
```

## Summary

| Scenario | Action |
|----------|--------|
| Invalid user input | Throw `MarvinValidationError` |
| Resource not found (required) | Throw `MarvinNotFoundError` |
| Resource not found (optional) | Return `null` |
| Auth failure | Throw `MarvinAuthError` |
| Server error | Throw `MarvinServerError` |
| Network failure | Throw `MarvinNetworkError` |
| Empty list | Return `[]` (not `null`) |
| Config error | Throw `MarvinConfigError` |

**Golden Rule:** If the caller can't proceed without the data, throw. If the caller can handle the absence, return null.
