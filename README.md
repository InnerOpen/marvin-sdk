# Marvin TypeScript SDK

> 🔒 **Enterprise-Grade Security** | ✅ **Zero Vulnerabilities** | 🚀 **Production-Ready**

The official TypeScript SDK for Marvin CMS. A modern, workspace-first SDK for building applications that integrate with Marvin.

[![Security Status](https://img.shields.io/badge/security-enterprise%20grade-brightgreen)](./SECURITY_FIXES_SUMMARY.md)
[![Version](https://img.shields.io/badge/version-2.0.1-blue)](https://github.com/inneropen/marvin-sdk/releases)
[![TypeScript](https://img.shields.io/badge/TypeScript-100%25-blue)](https://www.typescriptlang.org/)

## Security First

**The Marvin SDK has undergone a comprehensive security audit and achieved zero security vulnerabilities.** All 20 identified issues have been fixed, including:

- ✅ 8 HIGH priority vulnerabilities eliminated
- ✅ 7 MEDIUM priority security issues resolved
- ✅ 5 LOW priority code quality improvements implemented

**[View Complete Security Audit →](./COMPLETE_SECURITY_AUDIT.md)**

### Key Security Features

- 🔐 **Token Sanitization** - Automatic redaction of sensitive data in logs/errors
- 🛡️ **Input Validation** - Path injection, XSS, and SSRF prevention
- 📧 **Email Validation** - RFC 5322 compliant validation
- 📁 **File Upload Security** - Size, type, and filename validation
- 🔄 **Network Resilience** - Automatic retry with exponential backoff
- 🔒 **CSRF Protection** - Session authentication security
- ✅ **Type Safety** - 100% TypeScript with zero `any` types

**[View Security Best Practices →](./AUTHENTICATION.md#security-best-practices)**

## Why This SDK?

Marvin is becoming a platform, not simply a CMS. This SDK is the primary way to integrate with Marvin across:

- **Static Site Generators** (Astro, Next.js, Nuxt)
- **Server Applications** (Express, Fastify, Hono)
- **CLI Tools** & **Build Scripts**
- **Automation** (n8n, GitHub Actions)
- **AI Agents** & **Custom Integrations**

The SDK provides:

- 🎯 **Workspace-First Architecture** - Work with Marvin concepts (Workspace, Entry, Collection)
- 🚀 **Performance Optimized** - Built-in caching for build-time usage
- 📘 **Fully Typed** - Complete TypeScript support
- 🔄 **Backwards Compatible** - Works with existing publishing APIs
- 🎨 **Object-Oriented** - Rich objects instead of raw JSON
- 🔒 **Enterprise Security** - Production-ready with comprehensive security features

## Installation

```bash
npm install @inneropen/marvin-sdk@^2.0.1
```

**Latest stable version:** v2.0.1 with complete security fixes and enterprise-grade quality.

## Entry Points

The SDK provides three distinct entry points for different use cases:

### 📖 Publishing API (`/publish`)
Read-only access to published content (frontends, websites)
```typescript
import { createMarvinClient } from '@inneropen/marvin-sdk/publish';
```
**Auth:** Site client tokens (`MARVIN_SITE_CLIENT_TOKEN`)

### ⚙️ Platform API (`/platform`)
Full CRUD admin operations (backend, CLI, automation)
```typescript
import { createPlatformClient } from '@inneropen/marvin-sdk/platform';
```
**Auth:** User tokens (`MARVIN_USER_TOKEN`) or session cookies

### 🔐 Auth API (Default export)
Public registration, login, password reset
```typescript
import { createAuthClient } from '@inneropen/marvin-sdk';
```
**Auth:** None required (public endpoints)

📚 **[See complete authentication guide →](./AUTHENTICATION.md)**

## Quick Start - Publishing API

### 1. Configure Environment

```env
MARVIN_API_URL=https://marvin.example.com
MARVIN_SITE_CLIENT_TOKEN=your-site-client-token
MARVIN_WORKSPACE_SLUG=your-workspace
```

### 2. Create Client

```typescript
import { createMarvinClient } from '@inneropen/marvin-sdk/publish';

const marvin = createMarvinClient();
```

### 3. Fetch Content

```typescript
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

## Quick Start - Platform API

### Programmatic Admin Access

```typescript
import { createPlatformClient } from '@inneropen/marvin-sdk/platform';

// From environment (MARVIN_USER_TOKEN)
const platform = createPlatformClient();

// Or explicit token
const platform = createPlatformClient({
  userToken: 'your-user-token'
});

// Full CRUD operations
await platform.entries.create({
  title: 'New Post',
  content: 'Content here...',
  collection_id: collectionId
});

await platform.entries.update(entryId, {
  title: 'Updated Title'
});

await platform.entries.delete(entryId);
```

## Architecture

### Workspace-First Design

Everything starts with the **Workspace**:

```ts
const workspace = await marvin.getWorkspace();

// Access workspace modules
workspace.entries     // Entries module
workspace.collections // Collections module
workspace.assets      // Assets module
workspace.renderers   // Renderers module (entry type rendering metadata)
workspace.site        // Site configuration (cached)
```

### Modular Structure

The SDK is organized into focused modules:

```
@marvin/sdk
├── client/       → Core client & HTTP
├── workspaces/   → Workspace object
├── entries/      → Entries module
├── collections/  → Collections module
├── assets/       → Assets module
├── renderers/    → Renderers module (entry type rendering metadata)
├── auth/         → Authentication (future)
├── types/        → TypeScript types
└── utils/        → Cache & utilities
```

## API Styles

The SDK supports **three API styles**:

### 1. Workspace API (Recommended)

```ts
const workspace = await marvin.getWorkspace();
const entries = await workspace.entries.list();
const collection = await workspace.collections.get('featured');
```

### 2. Convenience API

```ts
const entry = await marvin.entry('about');
const projects = await marvin.projects();
const pages = await marvin.pages();
```

### 3. Backwards-Compatible API

```ts
// Still works! (Deprecated but supported)
const site = await marvin.getSite();
const entries = await marvin.getEntries();
const entry = await marvin.getEntry('about');
```

## Core Concepts

### Workspace

The workspace is the root object representing your Marvin workspace.

```ts
const workspace = await marvin.getWorkspace();

// Cached site configuration
workspace.site?.title
workspace.site?.description

// Access modules
workspace.entries.list()
workspace.collections.get('slug')
workspace.assets.images()
workspace.resources.list()
```

### Content Primitives

Marvin has four first-class content primitives:

- **Entries** - Content you create (pages, blog posts, projects)
- **Collections** - Organize and group entries
- **Assets** - Binary files and media (images, videos, documents)
- **Resources** - Reusable structured objects (fabrics, tools, suppliers, APIs)

### Entries

Rich entry objects with methods and properties:

```ts
const entry = await marvin.entry('about-us');

// Properties
entry.title
entry.slug
entry.contentMarkdown
entry.metadata
entry.publishedAt

// Relationships
entry.assets        // MarvinAsset[]
entry.collections   // MarvinCollection[]
entry.resources     // MarvinResource[]

// Methods (future)
await entry.relatedEntries()
```

### Collections

Collections as first-class objects:

```ts
const collection = await marvin.collection('projects');

// Properties
collection.name
collection.slug
collection.isSmart
collection.smartRules

// Methods
const entries = await collection.entries();

// Future
await collection.assets()
await collection.metadata()
```

### Resources

Resources are reusable structured objects referenced by entries:

```ts
const resource = await marvin.resource('kuroki-s022');

// Properties
resource.name
resource.slug
resource.resourceType    // 'fabric', 'tool', 'supplier', etc.
resource.description
resource.externalId
resource.url
resource.metadata

// Methods
const entries = await resource.entries();  // Entries that reference this resource

// Future
await resource.assets()
```

**Examples of Resources:**
- Fabrics (denim, canvas, etc.)
- Tools (sewing machine, cutting tool)
- Suppliers (fabric mills, button manufacturers)
- Git repositories
- APIs and services
- Books and documents

**Note:** Resources are not binary files. Use Assets for media files.

## Usage Examples

### Astro Static Site

```ts
// src/pages/[slug].astro
---
import { marked } from 'marked';
import { createMarvinClient } from '@/lib/marvin';

const marvin = createMarvinClient();

export async function getStaticPaths() {
  const pages = await marvin.pages();
  
  return pages.map((page) => ({
    params: { slug: page.slug },
    props: { page },
  }));
}

const { page } = Astro.props;
const contentHtml = marked.parse(page.contentMarkdown ?? '');
---

<article>
  <h1>{page.title}</h1>
  <div set:html={contentHtml} />
</article>
```

### Next.js App

```ts
// app/blog/page.tsx
import { createMarvinClient } from '@/lib/marvin';

const marvin = createMarvinClient();

export default async function BlogPage() {
  const posts = await marvin.posts();
  
  return (
    <div>
      {posts.map((post) => (
        <article key={post.id}>
          <h2>{post.title}</h2>
          <p>{post.summary}</p>
        </article>
      ))}
    </div>
  );
}
```

### Express Server

```ts
import express from 'express';
import { createMarvinClient } from './marvin-sdk';

const app = express();
const marvin = createMarvinClient();

app.get('/api/posts', async (req, res) => {
  const posts = await marvin.posts();
  res.json(posts);
});

app.get('/api/posts/:slug', async (req, res) => {
  const entry = await marvin.entry(req.params.slug);
  res.json(entry.toJSON());
});
```

### CLI Tool

```ts
#!/usr/bin/env node
import { createMarvinClient } from '@marvin/sdk';

const marvin = createMarvinClient();

async function main() {
  await marvin.initialize();
  
  console.log('Site:', marvin.site?.title);
  
  const entries = await marvin.entries.list();
  console.log(`Found ${entries.length} entries`);
  
  for (const entry of entries) {
    console.log(`- ${entry.title} (${entry.status})`);
  }
}

main().catch(console.error);
```

## Initialization & Caching

### Auto-Initialize

```ts
const marvin = createMarvinClient({
  autoInitialize: true,
});

// Site is preloaded
console.log(marvin.site?.title);
```

### Manual Initialize

```ts
const marvin = createMarvinClient();

await marvin.initialize();

// Now site is cached
console.log(marvin.site?.title);
```

### Cache Duration

```ts
const marvin = createMarvinClient({
  cacheDuration: 10 * 60 * 1000, // 10 minutes
});
```

## Convenience Methods

Quick access to common content types:

```ts
// Pages
const pages = await marvin.pages();
const about = await marvin.entry('about');

// Blog posts
const posts = await marvin.posts({ limit: 10 });

// Projects
const projects = await marvin.projects();

// Collections
const featured = await marvin.collection('featured');
const entries = await featured.entries();

// Assets
const images = await marvin.assets.images();
const videos = await marvin.assets.videos();

// Resources
const resources = await marvin.resources.list();
const fabric = await marvin.resource('kuroki-s022');
const entries = await fabric.entries();
```

## API Reference

### Client Methods

#### `createMarvinClient(config?)`

Create a new Marvin client instance.

**Config Options:**
- `apiUrl?: string` - API URL (default: `process.env.MARVIN_API_URL`)
- `siteClientToken?: string` - Site client token (default: `process.env.MARVIN_SITE_CLIENT_TOKEN`)
- `workspaceSlug?: string` - Workspace slug (default: `process.env.MARVIN_WORKSPACE_SLUG`)
- `autoInitialize?: boolean` - Auto-initialize on creation (default: `false`)
- `cacheDuration?: number` - Cache duration in ms (default: `300000` / 5 min)

#### `marvin.initialize()`

Initialize the SDK and preload workspace data.

#### `marvin.getWorkspace()`

Get the workspace object.

#### `marvin.getWorkspaceInfo()`

Get basic workspace information (name and slug only).

**Returns:**
```ts
{
  slug: string;
  name: string;
}
```

#### `marvin.entry(slug)`

Get a single entry by slug (returns `Entry` object).

#### `marvin.collection(slug)`

Get a single collection by slug (returns `Collection` object).

#### `marvin.pages(options?)`

Get all pages.

#### `marvin.posts(options?)`

Get all blog posts.

#### `marvin.projects(options?)`

Get all projects.

### Workspace

#### `workspace.slug`

The workspace slug (string).

#### `workspace.site`

Site configuration (cached after `initialize()`).

#### `workspace.getInfo()`

Get workspace info (name and slug).

#### `workspace.loadSite()`

Load/reload site configuration from the API.

#### `workspace.entries`

Entries module.

#### `workspace.collections`

Collections module.

#### `workspace.assets`

Assets module.

### Entries Module

#### `entries.list(options?)`

Get all entries with optional filtering.

**Options:**
- `entryType?: string` - Filter by entry type slug
- `collection?: string` - Filter by collection slug
- `status?: string` - Filter by status (default: `'published'`)
- `limit?: number` - Max results
- `offset?: number` - Pagination offset

#### `entries.get(slug)`

Get a single entry (returns `Entry` object).

#### `entries.pages(options?)`

Get all pages.

#### `entries.posts(options?)`

Get all blog posts.

#### `entries.projects(options?)`

Get all projects.

### Entry Object

Properties:
- `id`, `title`, `slug`, `summary`, `description`
- `contentMarkdown` - Raw Markdown content
- `metadata` - Custom metadata object
- `status`, `publishedAt`, `createdAt`, `updatedAt`
- `entryTypeId`, `entryType`
- `assets` - Array of related assets
- `collections` - Array of related collections

Methods:
- `entry.toJSON()` - Get raw entry data

### Collections Module

#### `collections.list()`

Get all collections.

#### `collections.get(slug)`

Get a single collection (returns `Collection` object).

#### `collections.entries(slug)`

Get entries in a collection.

### Collection Object

Properties:
- `id`, `name`, `slug`, `description`
- `icon`, `color`, `sortOrder`
- `isSmart`, `smartRules`
- `createdAt`, `updatedAt`

Methods:
- `collection.entries()` - Get entries in collection
- `collection.toJSON()` - Get raw collection data

### Assets Module

#### `assets.list(options?)`

Get all assets.

**Options:**
- `type?: string` - Filter by type
- `limit?: number` - Max results
- `offset?: number` - Pagination offset

#### `assets.images(options?)`

Get all images.

#### `assets.videos(options?)`

Get all videos.

#### `assets.documents(options?)`

Get all documents.

### Resources Module

#### `resources.list(options?)`

Get all resources.

**Options:**
- `resourceType?: string` - Filter by resource type
- `limit?: number` - Max results
- `offset?: number` - Pagination offset

#### `resources.get(slug)`

Get a single resource (returns `Resource` object).

#### `resources.entries(slug)`

Get entries that reference a resource.

### Resource Object

Properties:
- `id`, `name`, `slug`
- `resourceType` - Type of resource (fabric, tool, supplier, etc.)
- `description`, `externalId`, `url`
- `metadata` - Custom metadata object
- `createdAt`, `updatedAt`

Methods:
- `resource.entries()` - Get entries that reference this resource
- `resource.toJSON()` - Get raw resource data

### Renderers Module

#### `renderers.list()`

Get all entry types with their rendering and capability metadata.

**Returns:** `PublishedEntryType[]`

```ts
interface PublishedEntryType {
  slug: string;
  name: string;
  isRendered: boolean;
  rendering?: {
    renderer?: string;
    package?: string;
    version?: string;
    config?: Record<string, unknown>;
  };
  capabilities?: {
    publishable?: boolean;
    submittable?: boolean;
    routable?: boolean;
  };
}
```

**Example:**

```ts
const workspace = await marvin.getWorkspace();
const renderers = await workspace.renderers.list();

const rendered = renderers.filter(r => r.isRendered);
console.log(`${rendered.length} entry types have renderers`);
```

## Backend API Endpoints

The SDK uses these Marvin publishing API endpoints:

| Endpoint | Method | Purpose | Status |
|----------|--------|---------|--------|
| `/api/publish/{workspace}` | GET | Workspace info (name, slug) | ✅ Implemented |
| `/api/publish/{workspace}/site` | GET | Site configuration | ✅ Implemented |
| `/api/publish/{workspace}/entries` | GET | List entries | ✅ Implemented |
| `/api/publish/{workspace}/entries/{slug}` | GET | Get entry | ✅ Implemented |
| `/api/publish/{workspace}/collections` | GET | List collections | ✅ Implemented |
| `/api/publish/{workspace}/collections/{slug}` | GET | Get collection | ✅ Implemented |
| `/api/publish/{workspace}/collections/{slug}/entries` | GET | Collection entries | ✅ Implemented |
| `/api/publish/{workspace}/assets` | GET | List assets | ✅ Implemented |
| `/api/publish/{workspace}/assets/{slug}` | GET | Get asset metadata | ✅ Implemented |
| `/api/publish/{workspace}/resources` | GET | List resources | ✅ Implemented |
| `/api/publish/{workspace}/resources/{slug}` | GET | Get resource | ✅ Implemented |
| `/api/publish/{workspace}/resources/{slug}/entries` | GET | Resource entries | ✅ Implemented |
| `/api/publish/{workspace}/entry-types` | GET | List entry types (renderers) | ✅ Implemented |

**Query Parameters:**

- **Entries**: `entry_type`, `collection`, `slug`, `updated_since`, `page`, `limit`
- **Assets**: `type` (MIME type prefix), `limit`, `offset`
- **Resources**: `resource_type`, `limit`, `offset`

## Security

### Security Features

The SDK includes comprehensive security protections:

#### Input Validation
- **Path Injection Prevention** - Validates all path parameters to prevent `../` attacks
- **Email Validation** - RFC 5322 compliant email format checking
- **Webhook URL Validation** - SSRF prevention for webhook endpoints
- **File Upload Validation** - Size limits (10MB), type checking, and filename sanitization
- **Form Submission Validation** - XSS prevention with script tag detection

#### Data Protection
- **Token Sanitization** - Automatic redaction of sensitive data in debug logs and errors
  - Tokens, passwords, secrets, API keys automatically masked
  - Recursive sanitization for nested objects and arrays
- **Email Password Security** - Passwords never returned in API responses
- **CSRF Protection** - Session authentication with CSRF token support

#### Network Security
- **Retry Logic** - Automatic exponential backoff for transient failures (3 retries, configurable)
- **Timeout Limits** - Maximum 2-minute timeout to prevent resource exhaustion
- **Error Handling** - Comprehensive error types with actionable messages

**[Complete Security Documentation →](./SECURITY_FIXES_SUMMARY.md)**

### Site Client Tokens

Always use **site client tokens**, never user tokens.

Get a site client token:
1. Log into Marvin
2. Go to **Settings → Publishing → Site Clients**
3. Create a new client
4. Copy the token

### Server-Side Only

**Never expose tokens in browser code:**

```ts
// ✅ Good - Server/build time
const marvin = createMarvinClient();

// ❌ Bad - Browser code with exposed token
<script>
  const marvin = createMarvinClient({
    siteClientToken: '{TOKEN}' // DON'T DO THIS!
  });
</script>
```

### Security Best Practices

1. **Environment Variables** - Never commit tokens to version control
2. **Token Rotation** - Regenerate user tokens periodically
3. **Debug Mode** - Tokens are automatically sanitized in logs, but still use caution
4. **Input Validation** - The SDK validates all inputs, but validate on your side too
5. **HTTPS Only** - Always use HTTPS in production (enforced by default)
6. **CSRF Tokens** - Enable CSRF protection for browser-based admin UIs

**[Complete Authentication Guide →](./AUTHENTICATION.md)**

## Future Modules

The SDK architecture supports future expansion:

- ✅ **Publishing** - Implemented
- 🔜 **Authentication** - User authentication
- 🔜 **Users** - User management
- 🔜 **Workspaces** - Workspace management
- 🔜 **Events** - Event streams
- 🔜 **Webhooks** - Webhook management
- 🔜 **Search** - Full-text search
- 🔜 **AI** - AI-powered features

## Design Philosophy

The SDK is inspired by:

- [Supabase JavaScript SDK](https://github.com/supabase/supabase-js)
- [Stripe SDK](https://github.com/stripe/stripe-node)
- [GitHub Octokit](https://github.com/octokit/octokit.js)

**Simple to start, powerful as you grow.**

Consumers think in **Marvin concepts** (Workspace, Entry, Collection), not raw REST endpoints.

## Troubleshooting

### "MARVIN_API_URL is required"

Make sure your `.env` file exists with all required variables.

### "401 Unauthorized"

- Verify your site client token is valid
- Check that you're using a site client token, not a user token
- Ensure the token hasn't expired

### TypeScript Errors

Make sure your `tsconfig.json` includes:

```json
{
  "compilerOptions": {
    "moduleResolution": "bundler",
    "types": ["node"]
  }
}
```

## License

MIT - Part of the Marvin project.

## Documentation

- 🔒 [Security Audit Report](./COMPLETE_SECURITY_AUDIT.md) - Complete security fixes (20 issues resolved)
- 📋 [Security Fixes Summary](./SECURITY_FIXES_SUMMARY.md) - Key improvements and migration guide
- 🔐 [Authentication Guide](./AUTHENTICATION.md) - Complete auth documentation and security best practices
- ⚠️ [Error Handling Guide](./ERROR_HANDLING_GUIDE.md) - Comprehensive error handling patterns
- 🧪 [Testing Guide](./TESTING.md) - Testing strategy and security test examples
- 🔄 [Migration Guide v2.0](./MIGRATION-v2.md) - Upgrade from v1.x to v2.0

## Support

- 📖 [Full Documentation](./examples.md)
- 🚀 [Quick Start Guide](./QUICKSTART.md)
- 🐛 [Report Issues](https://github.com/jmashburn/Marvin/issues)
- 🔒 [Security Policy](./SECURITY.md) - Vulnerability reporting and security policy
