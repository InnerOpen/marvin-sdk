# Marvin SDK Documentation

This directory contains the MkDocs documentation for the Marvin SDK.

## Building Documentation

### Prerequisites

Install Python dependencies:

```bash
pip install -r requirements.txt
```

### Serve Locally

```bash
npm run docs:serve
# or
mkdocs serve
```

Visit http://localhost:8000

### Build Static Site

```bash
npm run docs:build
# or
mkdocs build
```

This generates static HTML in the `site/` directory.

### Deploy to GitHub Pages

```bash
npm run docs:deploy
# or
mkdocs gh-deploy
```

## Documentation Structure

```
docs/
├── index.md                    # Homepage
├── getting-started/
│   ├── installation.md        # Installation guide
│   ├── quickstart.md          # Quick start guide
│   └── configuration.md       # Configuration options
├── concepts/
│   ├── architecture.md        # Architecture overview
│   ├── workspace.md           # Workspace concept
│   ├── entries.md             # Entries concept
│   ├── collections.md         # Collections concept
│   ├── assets.md              # Assets concept
│   └── resources.md           # Resources concept
├── api/
│   ├── client.md              # Client API reference
│   ├── workspace.md           # Workspace API reference
│   ├── entries.md             # Entries module API
│   ├── collections.md         # Collections module API
│   ├── assets.md              # Assets module API
│   ├── resources.md           # Resources module API
│   └── platform.md            # Platform API reference
├── guides/
│   ├── astro.md               # Astro integration guide
│   ├── nextjs.md              # Next.js integration guide
│   ├── express.md             # Express integration guide
│   ├── cli.md                 # CLI tools guide
│   └── caching.md             # Caching strategy guide
├── platform/
│   ├── overview.md            # Platform API overview
│   ├── auth.md                # Authentication
│   ├── workspaces.md          # Workspaces management
│   ├── email-templates.md     # Email templates
│   ├── webhooks.md            # Webhooks
│   └── admin.md               # Admin API
├── migration/
│   ├── v2-migration.md        # v2 migration guide
│   └── breaking-changes.md    # Breaking changes
├── reference/
│   ├── security.md            # Security best practices
│   ├── types.md               # TypeScript types
│   ├── errors.md              # Error handling
│   └── troubleshooting.md     # Troubleshooting guide
├── examples.md                # Examples
└── contributing.md            # Contributing guide
```

## Writing Documentation

### Markdown Extensions

This documentation uses Material for MkDocs with several extensions:

#### Admonitions

```markdown
!!! note "Title"
    This is a note

!!! warning
    This is a warning

!!! tip
    This is a tip
```

#### Code Blocks with Tabs

```markdown
=== "npm"
    ```bash
    npm install @inneropen/marvin-sdk
    ```

=== "yarn"
    ```bash
    yarn add @inneropen/marvin-sdk
    ```
```

#### Tables

```markdown
| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |
```

#### Syntax Highlighting

````markdown
```typescript
const marvin = createMarvinClient();
```
````

### Internal Links

Use relative paths:

```markdown
[Quick Start](getting-started/quickstart.md)
[API Reference](api/client.md)
```

### Style Guide

- Use clear, concise language
- Provide code examples
- Include real-world use cases
- Keep examples focused
- Use TypeScript for code examples
- Add comments to complex code

## Contributing

See [CONTRIBUTING.md](contributing.md) for guidelines on contributing to the documentation.
