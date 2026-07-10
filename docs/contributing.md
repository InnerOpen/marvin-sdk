# Contributing to Marvin SDK

Thank you for your interest in contributing to the Marvin SDK!

## Development Setup

1. Clone the repository:

```bash
git clone https://github.com/inneropen/marvin-sdk.git
cd marvin-sdk
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp .env.example .env
# Edit .env with your Marvin credentials
```

## Development Workflow

### Build the SDK

```bash
npm run build
```

This compiles TypeScript to JavaScript and generates type definitions.

### Watch Mode

```bash
npm run dev
```

This watches for changes and rebuilds automatically.

### Type Checking

```bash
npm run typecheck
```

## Project Structure

```
marvin-sdk/
├── src/
│   ├── client/       # Core client & HTTP
│   ├── workspaces/   # Workspace object
│   ├── entries/      # Entries module
│   ├── collections/  # Collections module
│   ├── assets/       # Assets module
│   ├── resources/    # Resources module
│   ├── platform/     # Platform API
│   ├── types/        # TypeScript types
│   ├── core/         # Cache & utilities
│   └── index.ts      # Main entry point
├── docs/             # Documentation
├── dist/             # Built output
└── examples/         # Example projects
```

## Making Changes

### 1. Create a Branch

```bash
git checkout -b feature/your-feature-name
```

### 2. Make Your Changes

- Follow existing code style
- Add TypeScript types for all new code
- Update documentation if needed

### 3. Test Your Changes

```bash
npm run typecheck
npm run build
```

### 4. Commit Your Changes

We use [Conventional Commits](https://www.conventionalcommits.org/):

```bash
git commit -m "feat: add new feature"
git commit -m "fix: resolve bug"
git commit -m "docs: update documentation"
```

Commit types:

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `refactor:` - Code refactoring
- `test:` - Test changes
- `chore:` - Build/tooling changes

### 5. Push and Create PR

```bash
git push origin feature/your-feature-name
```

Then create a pull request on GitHub.

## Code Style

### TypeScript

- Use TypeScript for all new code
- Provide type definitions for public APIs
- Avoid `any` types when possible

### Naming Conventions

- **Classes**: PascalCase (`MarvinClient`)
- **Functions**: camelCase (`createMarvinClient`)
- **Variables**: camelCase (`workspaceSlug`)
- **Constants**: SCREAMING_SNAKE_CASE (`DEFAULT_CACHE_DURATION`)
- **Files**: kebab-case (`marvin-client.ts`)

### Code Organization

- Keep files focused and single-purpose
- Export public APIs from `index.ts`
- Keep internal utilities in separate files
- Use clear, descriptive names

## Documentation

### Update Documentation

When adding or changing features:

1. Update relevant docs in `docs/`
2. Add examples if applicable
3. Update API reference
4. Add to CHANGELOG.md

### Build Documentation

```bash
mkdocs serve
```

This starts a local documentation server at `http://localhost:8000`.

## Testing

Currently, the SDK uses manual testing. We welcome contributions to add automated tests!

### Manual Testing

Create a test script in the root directory:

```typescript
// test-my-feature.ts
import { createMarvinClient } from './src';

async function test() {
  const marvin = createMarvinClient();
  
  // Test your feature
  const result = await marvin.someNewFeature();
  console.log(result);
}

test().catch(console.error);
```

Run it:

```bash
npx tsx test-my-feature.ts
```

## Release Process

Releases are automated using semantic-release:

1. Merge PR to `main`
2. semantic-release analyzes commits
3. Generates CHANGELOG
4. Creates Git tag
5. Publishes to npm

See [NPM_RELEASE_PROCESS.md](NPM_RELEASE_PROCESS.md) for details.

## Questions?

- 📖 [Documentation](https://github.com/inneropen/marvin-sdk)
- 🐛 [Report Issues](https://github.com/inneropen/marvin-sdk/issues)
- 💬 [Discussions](https://github.com/inneropen/marvin-sdk/discussions)

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
