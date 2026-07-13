# Contributing to Marvin SDK

Thank you for your interest in contributing to the Marvin TypeScript SDK! We welcome contributions from the community.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Security Guidelines](#security-guidelines)
- [Coding Standards](#coding-standards)
- [Testing Requirements](#testing-requirements)
- [Pull Request Process](#pull-request-process)
- [Release Process](#release-process)

## Code of Conduct

We are committed to providing a welcoming and inclusive environment. Please be respectful and professional in all interactions.

## Getting Started

### Prerequisites

- Node.js 18+ or 20+
- npm or yarn
- Git
- TypeScript knowledge

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/marvin-sdk.git
   cd marvin-sdk
   ```
3. Add upstream remote:
   ```bash
   git remote add upstream https://github.com/inneropen/marvin-sdk.git
   ```

## Development Setup

### Install Dependencies

```bash
npm install
```

### Build the SDK

```bash
npm run build
```

This creates:
- ESM build (`dist/esm/`)
- CJS build (`dist/cjs/`)
- Type definitions (`dist/types/`)

### Run Tests

```bash
npm test
```

### Type Checking

```bash
npm run typecheck
```

### Linting

```bash
npm run lint
npm run lint:fix  # Auto-fix issues
```

## Security Guidelines

**Security is a top priority.** All contributions must adhere to our security standards.

### Security Checklist

Before submitting a PR, ensure:

- [ ] No secrets, tokens, or credentials committed
- [ ] All user input is validated
- [ ] No sensitive data in error messages or logs
- [ ] No `any` types (use proper TypeScript types)
- [ ] HTTPS enforced for production
- [ ] No XSS, SQLI, or path injection vulnerabilities
- [ ] Dependencies audited (`npm audit`)
- [ ] Security tests included for new features

### Input Validation

**Always validate external input:**

```typescript
// ✅ Good - Validate input
function createEntry(slug: string) {
  if (!isValidSlug(slug)) {
    throw new MarvinValidationError('Invalid slug format');
  }
  // ... proceed
}

// ❌ Bad - No validation
function createEntry(slug: string) {
  return this.http.post(`/entries/${slug}`); // Path injection risk!
}
```

### Token & Secret Handling

**Never expose sensitive data:**

```typescript
// ✅ Good - Sanitize sensitive data
function logRequest(config: RequestConfig) {
  const sanitized = sanitizeForLogging(config);
  console.log('Request:', sanitized);
}

// ❌ Bad - Logs token in plain text
function logRequest(config: RequestConfig) {
  console.log('Request:', config); // Exposes token!
}
```

### Error Handling

**Don't expose internal details:**

```typescript
// ✅ Good - Generic error message
catch (error) {
  throw new MarvinError('Failed to create entry');
}

// ❌ Bad - Exposes internal paths
catch (error) {
  throw new Error(`Database error at /var/lib/marvin: ${error}`);
}
```

### Type Safety

**Use proper TypeScript types:**

```typescript
// ✅ Good - Proper typing
interface EntryResponse {
  id: string;
  title: string;
  dataJson: Record<string, unknown>;
}

// ❌ Bad - Using any
function getEntry(): any {
  // ...
}
```

### Security Resources

- [SECURITY.md](./SECURITY.md) - Security policy and vulnerability reporting
- [SECURITY_FIXES_SUMMARY.md](./SECURITY_FIXES_SUMMARY.md) - Recent security improvements
- [TESTING.md](./TESTING.md) - Security testing guidelines

## Coding Standards

### TypeScript

- **No `any` types** - Use proper types or `unknown`
- **Strict mode** - All code must pass `strict: true`
- **Explicit return types** - Document function signatures
- **Use interfaces** - Not `type` for object shapes

### Code Style

- **2 spaces** for indentation
- **Single quotes** for strings
- **Semicolons** required
- **Trailing commas** in multiline objects/arrays
- **ESLint** - Follow project ESLint config

### Naming Conventions

- **Classes**: PascalCase (`MarvinClient`, `EntryModule`)
- **Functions/Methods**: camelCase (`getEntry`, `sanitizeForLogging`)
- **Interfaces**: PascalCase with descriptive names (`EntryResponse`, `CreateEntryRequest`)
- **Constants**: SCREAMING_SNAKE_CASE (`MAX_TIMEOUT`, `DEFAULT_RETRY_COUNT`)
- **Private members**: Prefix with `#` or `private`

### File Organization

```typescript
// 1. Imports
import { HttpClient } from '../core/http';
import type { Entry } from '../types';

// 2. Constants
const MAX_ENTRIES = 1000;

// 3. Types/Interfaces
interface EntryOptions {
  limit?: number;
}

// 4. Class/Function
export class EntryModule {
  // ...
}
```

### Comments

- **JSDoc** for public APIs
- **Inline comments** for complex logic
- **TODO comments** - Add to TODO.md instead

```typescript
/**
 * Get an entry by slug
 * @param slug - Entry slug
 * @returns Entry object
 * @throws MarvinNotFoundError if entry doesn't exist
 */
async get(slug: string): Promise<Entry> {
  // Validate slug to prevent path injection
  this.validatePathParam(slug);
  
  return this.http.get(`/entries/${slug}`);
}
```

## Testing Requirements

### Test Coverage

All contributions should include tests:

| Priority | Coverage Target | Category |
|----------|----------------|----------|
| P0 | 100% | Security-critical (auth, validation) |
| P1 | 80% | Core functionality (CRUD operations) |
| P2 | 60% | Utilities and helpers |
| P3 | No target | Integration tests (optional) |

### Security Tests

**Required for security-related changes:**

```typescript
// Example: Path injection test
describe('EntryModule', () => {
  it('should prevent path traversal attacks', async () => {
    const module = new EntryModule(client);
    
    await expect(
      module.get('../../../etc/passwd')
    ).rejects.toThrow(MarvinValidationError);
  });
});
```

See [TESTING.md](./TESTING.md) for complete testing guidelines.

### Running Tests

```bash
# All tests
npm test

# Specific test file
npm test -- src/platform/entries.test.ts

# Watch mode
npm test -- --watch

# Coverage report
npm test -- --coverage
```

## Pull Request Process

### Before Submitting

1. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following coding standards

3. **Write/update tests** to maintain coverage

4. **Run the test suite**:
   ```bash
   npm test
   npm run typecheck
   npm run lint
   npm audit
   ```

5. **Update documentation** if needed

6. **Commit with conventional commits**:
   ```bash
   git commit -m "feat: add webhook validation"
   git commit -m "fix: prevent path injection in entries module"
   git commit -m "docs: update security guidelines"
   ```

### Commit Message Format

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding/updating tests
- `chore`: Maintenance tasks
- `security`: Security improvements

**Examples:**
```
feat(entries): add field validation for entry creation

Validates all entry fields before submission to prevent invalid data.

Closes #123
```

```
fix(http): sanitize tokens in debug logs

Prevents token exposure in debug mode by redacting sensitive fields.

BREAKING CHANGE: Debug output format changed
```

### Submitting the PR

1. **Push your branch**:
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create Pull Request** on GitHub

3. **Fill out PR template** with:
   - Description of changes
   - Related issue numbers
   - Testing performed
   - Screenshots (if UI changes)
   - Breaking changes (if any)

4. **Wait for review** - Maintainers will review your PR

5. **Address feedback** - Make requested changes

6. **Get approval** - At least one maintainer approval required

7. **Squash and merge** - Maintainers will merge when ready

### PR Review Checklist

Reviewers will check:

- [ ] Code follows style guidelines
- [ ] Tests pass and coverage maintained
- [ ] Documentation updated
- [ ] No security vulnerabilities
- [ ] No breaking changes (or properly documented)
- [ ] Conventional commit format
- [ ] No merge conflicts

## Release Process

Releases are automated using semantic-release:

1. **Merge to `main`** triggers release workflow
2. **Version bump** based on conventional commits
3. **Changelog** auto-generated
4. **NPM publish** automatic
5. **GitHub release** created with notes

### Version Numbering

We follow [Semantic Versioning](https://semver.org/):

- **MAJOR** (x.0.0) - Breaking changes
- **MINOR** (0.x.0) - New features (backwards compatible)
- **PATCH** (0.0.x) - Bug fixes

**Commit types → Version:**
- `feat:` → MINOR version
- `fix:` → PATCH version
- `BREAKING CHANGE:` → MAJOR version

## Getting Help

- **Documentation**: Check existing docs first
- **Issues**: Search existing issues before creating new ones
- **Discussions**: Use GitHub Discussions for questions
- **Security**: Email security@inneropen.io for vulnerabilities

## Additional Resources

- [README.md](./README.md) - SDK overview and quick start
- [AUTHENTICATION.md](./AUTHENTICATION.md) - Authentication guide
- [ERROR_HANDLING_GUIDE.md](./ERROR_HANDLING_GUIDE.md) - Error handling patterns
- [TESTING.md](./TESTING.md) - Testing strategy
- [SECURITY.md](./SECURITY.md) - Security policy
- [MIGRATION-v2.md](./MIGRATION-v2.md) - Migration guide

## License

By contributing, you agree that your contributions will be licensed under the same license as the project (MIT).

---

Thank you for contributing to Marvin SDK! 🚀
