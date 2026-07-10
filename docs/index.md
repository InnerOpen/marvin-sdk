# Marvin TypeScript SDK

The official TypeScript SDK for Marvin CMS. A modern, workspace-first SDK for building applications that integrate with Marvin.

## Why This SDK?

Marvin is becoming a platform, not simply a CMS. This SDK is the primary way to integrate with Marvin across:

- **Static Site Generators** (Astro, Next.js, Nuxt)
- **Server Applications** (Express, Fastify, Hono)
- **CLI Tools** & **Build Scripts**
- **Automation** (n8n, GitHub Actions)
- **AI Agents** & **Custom Integrations**

## Key Features

- 🎯 **Workspace-First Architecture** - Work with Marvin concepts (Workspace, Entry, Collection)
- 🚀 **Performance Optimized** - Built-in caching for build-time usage
- 📘 **Fully Typed** - Complete TypeScript support
- 🔄 **Backwards Compatible** - Works with existing publishing APIs
- 🎨 **Object-Oriented** - Rich objects instead of raw JSON
- 🔒 **Secure** - Site client tokens, never user tokens

## Quick Example

```typescript
import { createMarvinClient } from '@inneropen/marvin-sdk';

const marvin = createMarvinClient();

// Get workspace
const workspace = await marvin.getWorkspace();
console.log(workspace.site?.title);

// Get entries
const entries = await marvin.entries.list();

// Get a specific entry
const entry = await marvin.entry('about-us');
console.log(entry.title, entry.contentMarkdown);

// Get collection entries
const projects = await marvin.collection('projects');
const projectEntries = await projects.entries();
```

## Installation

=== "npm"

    ```bash
    npm install @inneropen/marvin-sdk
    ```

=== "yarn"

    ```bash
    yarn add @inneropen/marvin-sdk
    ```

=== "pnpm"

    ```bash
    pnpm add @inneropen/marvin-sdk
    ```

## Next Steps

<div class="grid cards" markdown>

-   :material-clock-fast:{ .lg .middle } __Quick Start__

    ---

    Get up and running in 5 minutes

    [:octicons-arrow-right-24: Quick Start](getting-started/quickstart.md)

-   :material-book-open-variant:{ .lg .middle } __Core Concepts__

    ---

    Understand Marvin's architecture

    [:octicons-arrow-right-24: Learn Concepts](concepts/architecture.md)

-   :material-api:{ .lg .middle } __API Reference__

    ---

    Complete API documentation

    [:octicons-arrow-right-24: API Docs](api/client.md)

-   :material-code-braces:{ .lg .middle } __Examples__

    ---

    Real-world usage examples

    [:octicons-arrow-right-24: See Examples](examples.md)

</div>

## Support

- 📖 [Full Documentation](https://github.com/inneropen/marvin-sdk)
- 🚀 [Quick Start Guide](getting-started/quickstart.md)
- 🐛 [Report Issues](https://github.com/inneropen/marvin-sdk/issues)

## License

MIT - Part of the Marvin project.
