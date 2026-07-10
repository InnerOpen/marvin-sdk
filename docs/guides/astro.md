# Astro Integration Guide

## Overview

Integrate Marvin SDK with your Astro static site to fetch content at build time.

## Installation

```bash
npm install @inneropen/marvin-sdk
```

## Configuration

### Environment Variables

Create `.env`:

```env
MARVIN_API_URL=https://marvin.example.com
MARVIN_SITE_CLIENT_TOKEN=your-token-here
MARVIN_WORKSPACE_SLUG=your-workspace
```

### Astro Config

Update `astro.config.mjs` to expose environment variables:

```javascript
import { defineConfig } from 'astro/config';

export default defineConfig({
  vite: {
    define: {
      'process.env.MARVIN_API_URL': JSON.stringify(process.env.MARVIN_API_URL),
      'process.env.MARVIN_SITE_CLIENT_TOKEN': JSON.stringify(process.env.MARVIN_SITE_CLIENT_TOKEN),
      'process.env.MARVIN_WORKSPACE_SLUG': JSON.stringify(process.env.MARVIN_WORKSPACE_SLUG),
    },
  },
});
```

## Basic Usage

### Create Marvin Client

Create `src/lib/marvin.ts`:

```typescript
import { createMarvinClient } from '@inneropen/marvin-sdk';

export const marvin = createMarvinClient({
  autoInitialize: true,
  cacheDuration: 5 * 60 * 1000, // 5 minutes
});
```

### Dynamic Routes

Create `src/pages/[slug].astro`:

```astro
---
import { marvin } from '@/lib/marvin';
import { marked } from 'marked';

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

<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>{page.title}</title>
    {page.description && <meta name="description" content={page.description} />}
  </head>
  <body>
    <article>
      <h1>{page.title}</h1>
      {page.summary && <p class="summary">{page.summary}</p>}
      <div set:html={contentHtml} />
    </article>
  </body>
</html>
```

## Blog

### Blog Index

Create `src/pages/blog/index.astro`:

```astro
---
import { marvin } from '@/lib/marvin';

const posts = await marvin.posts();
---

<html>
  <head>
    <title>Blog</title>
  </head>
  <body>
    <h1>Blog Posts</h1>
    <div class="posts">
      {posts.map((post) => (
        <article>
          <h2><a href={`/blog/${post.slug}`}>{post.title}</a></h2>
          {post.summary && <p>{post.summary}</p>}
          <time>{post.publishedAt?.toLocaleDateString()}</time>
        </article>
      ))}
    </div>
  </body>
</html>
```

### Blog Post Pages

Create `src/pages/blog/[slug].astro`:

```astro
---
import { marvin } from '@/lib/marvin';
import { marked } from 'marked';

export async function getStaticPaths() {
  const posts = await marvin.posts();
  
  return posts.map((post) => ({
    params: { slug: post.slug },
    props: { post },
  }));
}

const { post } = Astro.props;
const contentHtml = marked.parse(post.contentMarkdown ?? '');
---

<html>
  <head>
    <title>{post.title}</title>
  </head>
  <body>
    <article>
      <h1>{post.title}</h1>
      <time>{post.publishedAt?.toLocaleDateString()}</time>
      {post.summary && <p class="lead">{post.summary}</p>}
      <div class="content" set:html={contentHtml} />
    </article>
  </body>
</html>
```

## Collections

### Collection Index

Create `src/pages/collections/[slug].astro`:

```astro
---
import { marvin } from '@/lib/marvin';

export async function getStaticPaths() {
  const collections = await marvin.collections.list();
  
  return collections.map((collection) => ({
    params: { slug: collection.slug },
    props: { collection },
  }));
}

const { collection } = Astro.props;
const entries = await collection.entries();
---

<html>
  <head>
    <title>{collection.name}</title>
  </head>
  <body>
    <h1>{collection.name}</h1>
    {collection.description && <p>{collection.description}</p>}
    
    <div class="entries">
      {entries.map((entry) => (
        <article>
          <h2><a href={`/${entry.slug}`}>{entry.title}</a></h2>
          {entry.summary && <p>{entry.summary}</p>}
        </article>
      ))}
    </div>
  </body>
</html>
```

## Images

### Image Gallery

Create `src/pages/gallery.astro`:

```astro
---
import { marvin } from '@/lib/marvin';

const images = await marvin.assets.images();
---

<html>
  <head>
    <title>Gallery</title>
  </head>
  <body>
    <h1>Gallery</h1>
    <div class="gallery">
      {images.map((image) => (
        <figure>
          <img 
            src={image.url} 
            alt={image.altText} 
            width={image.width} 
            height={image.height}
            loading="lazy"
          />
          {image.title && <figcaption>{image.title}</figcaption>}
        </figure>
      ))}
    </div>
  </body>
</html>
```

## Navigation

### Site Navigation

Create `src/components/Navigation.astro`:

```astro
---
import { marvin } from '@/lib/marvin';

const workspace = await marvin.getWorkspace();
const pages = await marvin.pages();
---

<nav>
  <a href="/">{workspace.site?.title}</a>
  <ul>
    {pages.map((page) => (
      <li><a href={`/${page.slug}`}>{page.title}</a></li>
    ))}
  </ul>
</nav>
```

## Resources

### Resources Directory

Create `src/pages/resources/[slug].astro`:

```astro
---
import { marvin } from '@/lib/marvin';

export async function getStaticPaths() {
  const resources = await marvin.resources.list();
  
  return resources.map((resource) => ({
    params: { slug: resource.slug },
    props: { resource },
  }));
}

const { resource } = Astro.props;
const entries = await resource.entries();
---

<html>
  <head>
    <title>{resource.name}</title>
  </head>
  <body>
    <article>
      <h1>{resource.name}</h1>
      <p class="type">{resource.resourceType}</p>
      {resource.description && <p>{resource.description}</p>}
      {resource.url && <a href={resource.url}>Visit Website</a>}
      
      {entries.length > 0 && (
        <section>
          <h2>Used in {entries.length} projects</h2>
          <ul>
            {entries.map((entry) => (
              <li><a href={`/${entry.slug}`}>{entry.title}</a></li>
            ))}
          </ul>
        </section>
      )}
    </article>
  </body>
</html>
```

## TypeScript Support

### Type Definitions

Create `src/types/marvin.d.ts`:

```typescript
import type { Entry, Collection, Asset, Resource } from '@inneropen/marvin-sdk';

declare module '@/lib/marvin' {
  export const marvin: import('@inneropen/marvin-sdk').MarvinClient;
}
```

## Performance Tips

### Caching

```typescript
// Enable caching for build-time performance
export const marvin = createMarvinClient({
  autoInitialize: true,
  cacheDuration: 10 * 60 * 1000, // 10 minutes during build
});
```

### Pagination

```typescript
// Load all entries efficiently
const allEntries = [];
let offset = 0;
const limit = 100;

while (true) {
  const batch = await marvin.entries.list({ limit, offset });
  allEntries.push(...batch);
  if (batch.length < limit) break;
  offset += limit;
}
```

## Complete Example

See the [examples.md](../examples.md) for a complete Astro project example.

## Troubleshooting

### Build Errors

If you see "process is not defined":

```javascript
// astro.config.mjs
export default defineConfig({
  vite: {
    define: {
      'process.env.MARVIN_API_URL': JSON.stringify(process.env.MARVIN_API_URL),
      // Add other env vars
    },
  },
});
```

### TypeScript Errors

Ensure `tsconfig.json` includes:

```json
{
  "compilerOptions": {
    "moduleResolution": "bundler",
    "types": ["astro/client", "node"]
  }
}
```

## Next Steps

- [Caching Strategy](caching.md)
- [API Reference](../api/client.md)
- [Examples](../examples.md)
