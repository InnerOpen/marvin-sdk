# Marvin TypeScript SDK

> 🔒 **Enterprise-Grade Security** | ✅ **Zero Vulnerabilities** | 🚀 **Production-Ready**

The official TypeScript SDK for Marvin CMS. A modern, workspace-first SDK for building applications that integrate with Marvin.

!!! success "Security Status: Enterprise-Grade"
    **Latest version v2.0.1** achieves zero known security vulnerabilities after comprehensive audit.

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
- 🔒 **Enterprise Security** - Production-ready with comprehensive security features

### Security Features

- 🔐 **Token Sanitization** - Automatic redaction of sensitive data in logs/errors
- 🛡️ **Input Validation** - Path injection, XSS, and SSRF prevention
- 📧 **Email Validation** - RFC 5322 compliant validation
- 📁 **File Upload Security** - Size, type, and filename validation
- 🔄 **Network Resilience** - Automatic retry with exponential backoff
- 🔒 **CSRF Protection** - Session authentication security
- ✅ **Type Safety** - 100% TypeScript with zero `any` types

**[Complete Security Documentation →](reference/security.md)**

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
    npm install @inneropen/marvin-sdk@^2.0.1
    ```

=== "yarn"

    ```bash
    yarn add @inneropen/marvin-sdk@^2.0.1
    ```

=== "pnpm"

    ```bash
    pnpm add @inneropen/marvin-sdk@^2.0.1
    ```

!!! tip "Latest Stable Version"
    **v2.0.1** includes comprehensive security fixes and is production-ready.

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

-   :material-shield-check:{ .lg .middle } __Security__

    ---

    Enterprise-grade security documentation

    [:octicons-arrow-right-24: Security Guide](reference/security.md)

</div>

## Documentation

- 🔒 Security Audit Report - See GitHub repository
- 📋 Security Fixes Summary - See GitHub repository  
- 🔐 Authentication Guide - See GitHub repository
- ⚠️ Error Handling Guide - See GitHub repository
- 🧪 Testing Guide - See GitHub repository

## Support

- 📖 [Full Documentation](https://github.com/inneropen/marvin-sdk)
- 🚀 [Quick Start Guide](getting-started/quickstart.md)
- 🐛 [Report Issues](https://github.com/inneropen/marvin-sdk/issues)
- 🔒 Security Policy - See GitHub repository

## License

MIT - Part of the Marvin project.
