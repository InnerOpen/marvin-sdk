# Caching Strategy Guide

## Overview

The Marvin SDK includes built-in caching for site configuration and supports custom caching strategies for content.

## Built-in Caching

### Default Cache Duration

```typescript
import { createMarvinClient } from '@inneropen/marvin-sdk';

const marvin = createMarvinClient({
  cacheDuration: 5 * 60 * 1000, // 5 minutes (default)
});
```

### What is Cached

- **Site configuration** - Cached after `initialize()` or first `getWorkspace()` call
- **Default duration:** 5 minutes
- **Scope:** In-memory, per client instance

## Custom Cache Duration

### Build-Time Caching (Static Sites)

```typescript
// Long cache for build-time
const marvin = createMarvinClient({
  cacheDuration: 60 * 60 * 1000, // 1 hour
  autoInitialize: true,
});
```

### Server-Side Caching

```typescript
// Shorter cache for server-side
const marvin = createMarvinClient({
  cacheDuration: 5 * 60 * 1000, // 5 minutes
});
```

### Disable Caching

```typescript
// No caching
const marvin = createMarvinClient({
  cacheDuration: 0,
});
```

## Manual Cache Control

### Force Reload

```typescript
const workspace = await marvin.getWorkspace();

// Force reload site configuration
await workspace.loadSite();
```

## Custom Caching Strategies

### In-Memory Cache

```typescript
class CacheManager {
  private cache = new Map<string, { data: any; timestamp: number }>();
  
  get<T>(key: string, ttl: number): T | null {
    const cached = this.cache.get(key);
    
    if (!cached) return null;
    
    if (Date.now() - cached.timestamp > ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data as T;
  }
  
  set<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }
  
  clear(): void {
    this.cache.clear();
  }
}

const cache = new CacheManager();

async function getEntries() {
  const cached = cache.get('entries', 5 * 60 * 1000); // 5 minutes
  if (cached) return cached;
  
  const entries = await marvin.entries.list();
  cache.set('entries', entries);
  return entries;
}
```

### Redis Cache

```typescript
import Redis from 'ioredis';

const redis = new Redis();

async function getCached<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 300 // seconds
): Promise<T> {
  // Try to get from cache
  const cached = await redis.get(key);
  
  if (cached) {
    return JSON.parse(cached) as T;
  }
  
  // Fetch fresh data
  const data = await fetcher();
  
  // Store in cache
  await redis.setex(key, ttl, JSON.stringify(data));
  
  return data;
}

// Usage
const entries = await getCached(
  'entries',
  () => marvin.entries.list(),
  300 // 5 minutes
);
```

### File System Cache

```typescript
import fs from 'fs/promises';
import path from 'path';

const CACHE_DIR = '.cache';

async function getCachedFile<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 5 * 60 * 1000 // milliseconds
): Promise<T> {
  const cacheFile = path.join(CACHE_DIR, `${key}.json`);
  
  try {
    // Check if cache file exists
    const stats = await fs.stat(cacheFile);
    
    // Check if cache is still valid
    if (Date.now() - stats.mtimeMs < ttl) {
      const cached = await fs.readFile(cacheFile, 'utf-8');
      return JSON.parse(cached) as T;
    }
  } catch (error) {
    // Cache file doesn't exist or is invalid
  }
  
  // Fetch fresh data
  const data = await fetcher();
  
  // Ensure cache directory exists
  await fs.mkdir(CACHE_DIR, { recursive: true });
  
  // Write to cache file
  await fs.writeFile(cacheFile, JSON.stringify(data, null, 2), 'utf-8');
  
  return data;
}

// Usage
const entries = await getCachedFile(
  'entries',
  () => marvin.entries.list(),
  10 * 60 * 1000 // 10 minutes
);
```

## Cache Invalidation

### Time-Based Invalidation

```typescript
class TimeBasedCache {
  private cache = new Map<string, { data: any; expiresAt: number }>();
  
  get<T>(key: string): T | null {
    const cached = this.cache.get(key);
    
    if (!cached) return null;
    
    if (Date.now() > cached.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data as T;
  }
  
  set<T>(key: string, data: T, ttl: number): void {
    this.cache.set(key, {
      data,
      expiresAt: Date.now() + ttl,
    });
  }
}
```

### Manual Invalidation

```typescript
class ManualCache {
  private cache = new Map<string, any>();
  
  get<T>(key: string): T | null {
    return this.cache.get(key) || null;
  }
  
  set<T>(key: string, data: T): void {
    this.cache.set(key, data);
  }
  
  invalidate(key: string): void {
    this.cache.delete(key);
  }
  
  invalidateAll(): void {
    this.cache.clear();
  }
}

const cache = new ManualCache();

// Invalidate on webhook event
app.post('/webhook', async (req, res) => {
  cache.invalidateAll();
  res.sendStatus(200);
});
```

### Event-Based Invalidation

```typescript
import { EventEmitter } from 'events';

const cacheEvents = new EventEmitter();
const cache = new Map<string, any>();

// Invalidate on event
cacheEvents.on('invalidate', (key: string) => {
  cache.delete(key);
});

cacheEvents.on('invalidateAll', () => {
  cache.clear();
});

// Trigger invalidation
cacheEvents.emit('invalidate', 'entries');
cacheEvents.emit('invalidateAll');
```

## Framework-Specific Caching

### Next.js ISR

```typescript
// App Router
export const revalidate = 60; // Revalidate every 60 seconds

export default async function Page() {
  const entries = await marvin.entries.list();
  return <div>...</div>;
}
```

### Astro Build Cache

```typescript
// astro.config.mjs
export default defineConfig({
  build: {
    // Cache build assets
    inlineStylesheets: 'auto',
  },
  vite: {
    build: {
      // Rollup cache
      cache: {
        dir: '.astro/cache',
      },
    },
  },
});
```

### Express with Memory Cache

```typescript
import express from 'express';

const app = express();
const cache = new Map<string, { data: any; timestamp: number }>();

app.get('/api/entries', async (req, res) => {
  const key = 'entries';
  const cached = cache.get(key);
  
  if (cached && Date.now() - cached.timestamp < 5 * 60 * 1000) {
    return res.json(cached.data);
  }
  
  const entries = await marvin.entries.list();
  cache.set(key, { data: entries, timestamp: Date.now() });
  res.json(entries);
});
```

## Cache Warming

### Pre-populate Cache

```typescript
async function warmCache() {
  console.log('Warming cache...');
  
  await Promise.all([
    marvin.entries.list().then(data => cache.set('entries', data)),
    marvin.collections.list().then(data => cache.set('collections', data)),
    marvin.assets.images().then(data => cache.set('images', data)),
  ]);
  
  console.log('Cache warmed!');
}

// Warm cache on server start
warmCache().catch(console.error);

// Re-warm periodically
setInterval(() => {
  warmCache().catch(console.error);
}, 10 * 60 * 1000); // Every 10 minutes
```

## Cache Keys

### Deterministic Cache Keys

```typescript
function getCacheKey(params: Record<string, any>): string {
  const sorted = Object.keys(params)
    .sort()
    .map(key => `${key}:${params[key]}`)
    .join('|');
  
  return `cache:${sorted}`;
}

// Usage
const key = getCacheKey({
  entryType: 'post',
  collection: 'featured',
  limit: 10,
});

const entries = cache.get(key) || await marvin.entries.list({
  entryType: 'post',
  collection: 'featured',
  limit: 10,
});
```

## Best Practices

### 1. Choose Appropriate TTL

- **Build-time:** 1 hour or more
- **Server-side:** 5-15 minutes
- **Real-time:** Disable caching or use very short TTL (30 seconds)

### 2. Cache at Multiple Levels

```typescript
// Browser cache (HTTP headers)
res.setHeader('Cache-Control', 'public, max-age=300'); // 5 minutes

// CDN cache
res.setHeader('CDN-Cache-Control', 'public, max-age=3600'); // 1 hour

// Application cache
const entries = await getCached('entries', () => marvin.entries.list());
```

### 3. Monitor Cache Performance

```typescript
class CacheStats {
  hits = 0;
  misses = 0;
  
  hit() {
    this.hits++;
  }
  
  miss() {
    this.misses++;
  }
  
  get hitRate() {
    const total = this.hits + this.misses;
    return total === 0 ? 0 : this.hits / total;
  }
}

const stats = new CacheStats();

async function getCached<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
  const cached = cache.get(key);
  
  if (cached) {
    stats.hit();
    return cached;
  }
  
  stats.miss();
  const data = await fetcher();
  cache.set(key, data);
  return data;
}

// Log stats periodically
setInterval(() => {
  console.log(`Cache hit rate: ${(stats.hitRate * 100).toFixed(2)}%`);
}, 60000);
```

### 4. Handle Cache Failures Gracefully

```typescript
async function getCachedSafe<T>(
  key: string,
  fetcher: () => Promise<T>
): Promise<T> {
  try {
    const cached = await redis.get(key);
    if (cached) return JSON.parse(cached);
  } catch (error) {
    console.error('Cache read error:', error);
    // Fall through to fetcher
  }
  
  const data = await fetcher();
  
  try {
    await redis.setex(key, 300, JSON.stringify(data));
  } catch (error) {
    console.error('Cache write error:', error);
    // Continue without caching
  }
  
  return data;
}
```

## Next Steps

- [API Reference](../api/client.md)
- [Astro Guide](astro.md)
- [Next.js Guide](nextjs.md)
- [Express Guide](express.md)
