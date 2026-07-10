# Express Integration Guide

## Overview

Integrate Marvin SDK with Express.js for server-side APIs and server-rendered applications.

## Installation

```bash
npm install express @inneropen/marvin-sdk
npm install --save-dev @types/express
```

## Basic Setup

Create `server.ts`:

```typescript
import express from 'express';
import { createMarvinClient } from '@inneropen/marvin-sdk';

const app = express();
const marvin = createMarvinClient();

// Initialize Marvin on server start
marvin.initialize().then(() => {
  console.log('Marvin SDK initialized');
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

## API Endpoints

### List Entries

```typescript
app.get('/api/entries', async (req, res) => {
  try {
    const { entryType, collection, limit, offset } = req.query;
    
    const entries = await marvin.entries.list({
      entryType: entryType as string,
      collection: collection as string,
      limit: limit ? parseInt(limit as string) : undefined,
      offset: offset ? parseInt(offset as string) : undefined,
    });
    
    res.json(entries);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch entries' });
  }
});
```

### Get Single Entry

```typescript
app.get('/api/entries/:slug', async (req, res) => {
  try {
    const entry = await marvin.entry(req.params.slug);
    res.json(entry.toJSON());
  } catch (error) {
    console.error(error);
    res.status(404).json({ error: 'Entry not found' });
  }
});
```

### List Collections

```typescript
app.get('/api/collections', async (req, res) => {
  try {
    const collections = await marvin.collections.list();
    res.json(collections);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch collections' });
  }
});
```

### Get Collection with Entries

```typescript
app.get('/api/collections/:slug', async (req, res) => {
  try {
    const collection = await marvin.collection(req.params.slug);
    const entries = await collection.entries();
    
    res.json({
      collection: collection.toJSON(),
      entries,
    });
  } catch (error) {
    console.error(error);
    res.status(404).json({ error: 'Collection not found' });
  }
});
```

### List Assets

```typescript
app.get('/api/assets', async (req, res) => {
  try {
    const { type, limit, offset } = req.query;
    
    const assets = await marvin.assets.list({
      type: type as string,
      limit: limit ? parseInt(limit as string) : undefined,
      offset: offset ? parseInt(offset as string) : undefined,
    });
    
    res.json(assets);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch assets' });
  }
});
```

### List Resources

```typescript
app.get('/api/resources', async (req, res) => {
  try {
    const { resourceType, limit, offset } = req.query;
    
    const resources = await marvin.resources.list({
      resourceType: resourceType as string,
      limit: limit ? parseInt(limit as string) : undefined,
      offset: offset ? parseInt(offset as string) : undefined,
    });
    
    res.json(resources);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch resources' });
  }
});
```

## Server-Side Rendering

### Render Entry Page

```typescript
import { marked } from 'marked';

app.get('/pages/:slug', async (req, res) => {
  try {
    const entry = await marvin.entry(req.params.slug);
    const contentHtml = marked.parse(entry.contentMarkdown ?? '');
    
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${entry.title}</title>
          <meta name="description" content="${entry.description || entry.summary || ''}" />
        </head>
        <body>
          <article>
            <h1>${entry.title}</h1>
            ${entry.summary ? `<p class="summary">${entry.summary}</p>` : ''}
            <div class="content">${contentHtml}</div>
          </article>
        </body>
      </html>
    `);
  } catch (error) {
    res.status(404).send('Page not found');
  }
});
```

### Render Blog List

```typescript
app.get('/blog', async (req, res) => {
  try {
    const posts = await marvin.posts();
    
    const postsHtml = posts.map(post => `
      <article>
        <h2><a href="/blog/${post.slug}">${post.title}</a></h2>
        ${post.summary ? `<p>${post.summary}</p>` : ''}
        <time>${post.publishedAt?.toLocaleDateString()}</time>
      </article>
    `).join('\n');
    
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Blog</title>
        </head>
        <body>
          <h1>Blog Posts</h1>
          <div class="posts">${postsHtml}</div>
        </body>
      </html>
    `);
  } catch (error) {
    res.status(500).send('Server error');
  }
});
```

## Error Handling

### Middleware

```typescript
import type { Request, Response, NextFunction } from 'express';

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message 
  });
});
```

### Async Handler

```typescript
const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

app.get('/api/entries', asyncHandler(async (req, res) => {
  const entries = await marvin.entries.list();
  res.json(entries);
}));
```

## Caching

### In-Memory Cache

```typescript
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

function getCached<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
  const cached = cache.get(key);
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return Promise.resolve(cached.data);
  }
  
  return fetcher().then(data => {
    cache.set(key, { data, timestamp: Date.now() });
    return data;
  });
}

app.get('/api/entries', async (req, res) => {
  const entries = await getCached('entries', () => marvin.entries.list());
  res.json(entries);
});
```

### Redis Cache

```typescript
import Redis from 'ioredis';

const redis = new Redis();

async function getCachedRedis<T>(
  key: string, 
  fetcher: () => Promise<T>,
  ttl: number = 300
): Promise<T> {
  const cached = await redis.get(key);
  
  if (cached) {
    return JSON.parse(cached);
  }
  
  const data = await fetcher();
  await redis.setex(key, ttl, JSON.stringify(data));
  return data;
}

app.get('/api/entries', async (req, res) => {
  const entries = await getCachedRedis(
    'entries',
    () => marvin.entries.list(),
    300
  );
  res.json(entries);
});
```

## Complete Example

```typescript
import express from 'express';
import { createMarvinClient } from '@inneropen/marvin-sdk';
import { marked } from 'marked';

const app = express();
const marvin = createMarvinClient();

// Initialize
marvin.initialize().then(() => {
  console.log('Marvin SDK initialized');
});

// API Routes
app.get('/api/entries', async (req, res) => {
  const entries = await marvin.entries.list();
  res.json(entries);
});

app.get('/api/entries/:slug', async (req, res) => {
  try {
    const entry = await marvin.entry(req.params.slug);
    res.json(entry.toJSON());
  } catch (error) {
    res.status(404).json({ error: 'Entry not found' });
  }
});

app.get('/api/posts', async (req, res) => {
  const posts = await marvin.posts({ limit: 10 });
  res.json(posts);
});

app.get('/api/collections/:slug/entries', async (req, res) => {
  try {
    const collection = await marvin.collection(req.params.slug);
    const entries = await collection.entries();
    res.json(entries);
  } catch (error) {
    res.status(404).json({ error: 'Collection not found' });
  }
});

// Server-Rendered Pages
app.get('/pages/:slug', async (req, res) => {
  try {
    const entry = await marvin.entry(req.params.slug);
    const contentHtml = marked.parse(entry.contentMarkdown ?? '');
    
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${entry.title}</title>
        </head>
        <body>
          <article>
            <h1>${entry.title}</h1>
            <div>${contentHtml}</div>
          </article>
        </body>
      </html>
    `);
  } catch (error) {
    res.status(404).send('Page not found');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

## TypeScript

```typescript
import type { Entry, Collection, Asset } from '@inneropen/marvin-sdk';

interface EntryResponse {
  entry: Entry;
  html: string;
}

app.get('/api/entries/:slug/render', async (req, res) => {
  const entry = await marvin.entry(req.params.slug);
  const html = marked.parse(entry.contentMarkdown ?? '');
  
  const response: EntryResponse = { entry, html };
  res.json(response);
});
```

## Next Steps

- [API Reference](../api/client.md)
- [Caching Strategy](caching.md)
- [Examples](../examples.md)
