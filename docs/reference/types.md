# TypeScript Types Reference

Complete TypeScript type definitions for the Marvin SDK.

## Import Paths

```typescript
// Main types
import type {
  MarvinClient,
  MarvinConfig,
  MarvinSite,
  MarvinEntry,
  MarvinCollection,
  MarvinAsset,
  MarvinResource,
  MarvinEntryType,
} from '@inneropen/marvin-sdk';

// Module types
import type {
  EntriesModule,
  CollectionsModule,
  AssetsModule,
  ResourcesModule,
} from '@inneropen/marvin-sdk';

// Options types
import type {
  GetEntriesOptions,
  GetAssetsOptions,
  GetResourcesOptions,
} from '@inneropen/marvin-sdk';
```

## Configuration Types

### `MarvinConfig`

Client configuration object.

```typescript
interface MarvinConfig {
  /** Marvin API URL */
  apiUrl: string;
  
  /** Site client token (marvin_sk_*) */
  siteClientToken: string;
  
  /** Workspace slug */
  workspaceSlug: string;
  
  /** Auto-initialize on creation (default: false) */
  autoInitialize?: boolean;
  
  /** Cache duration in milliseconds (default: 300000 / 5 min) */
  cacheDuration?: number;
}
```

**Example:**

```typescript
const config: MarvinConfig = {
  apiUrl: 'https://marvin.example.com',
  siteClientToken: 'marvin_sk_1234567890abcdef',
  workspaceSlug: 'my-workspace',
  autoInitialize: true,
  cacheDuration: 10 * 60 * 1000, // 10 minutes
};
```

## Core Types

### `MarvinSite`

Site configuration object.

```typescript
interface MarvinSite {
  id: string;
  name: string;
  slug: string;
  title?: string;
  tagline?: string;
  description?: string;
  canonicalUrl?: string;
  logo?: string;
  favicon?: string;
  locale?: string;
  timezone?: string;
  metadata?: Record<string, unknown>;
}
```

**Example:**

```typescript
const site: MarvinSite = {
  id: 'abc-123',
  name: 'My Site',
  slug: 'my-site',
  title: 'My Awesome Site',
  description: 'A site built with Marvin',
  canonicalUrl: 'https://example.com',
  locale: 'en-US',
  timezone: 'America/New_York',
};
```

### `MarvinEntry`

Entry object.

```typescript
interface MarvinEntry {
  id: string;
  title: string;
  slug: string;
  summary?: string;
  description?: string;
  
  /**
   * Schema-driven content data (v2.0.0+)
   * Structured according to entry type's schemaJson
   */
  dataJson?: Record<string, unknown>;
  
  /**
   * @deprecated Use dataJson instead (removed in v3.0.0)
   */
  contentMarkdown?: string;
  
  /**
   * Custom non-schema metadata
   * Use for API keys, external IDs, CMS-specific config
   */
  metadata?: Record<string, unknown>;
  
  status: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  
  // Relationships
  entryTypeId: string;
  entryType?: MarvinEntryType;
  collections?: MarvinCollection[];
  assets?: MarvinAsset[];
  resources?: MarvinResource[];
}
```

**Example:**

```typescript
const entry: MarvinEntry = {
  id: 'entry-123',
  title: 'Getting Started',
  slug: 'getting-started',
  summary: 'Learn how to use Marvin',
  dataJson: {
    body: '# Getting Started\n\nWelcome!',
    difficulty: 'beginner',
    heroImage: 'asset-uuid-123',
  },
  metadata: {
    externalId: 'cms-456',
  },
  status: 'published',
  publishedAt: '2026-07-01T00:00:00Z',
  createdAt: '2026-06-30T00:00:00Z',
  updatedAt: '2026-07-01T00:00:00Z',
  entryTypeId: 'type-789',
};
```

### `MarvinEntryType`

Entry type definition with schema.

```typescript
interface MarvinEntryType {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  color?: string;
  description?: string;
  sortOrder: number;
  isSystem: boolean;
  
  /**
   * Schema definition (v2.0.0+)
   * Defines fields, types, and validation
   */
  schemaJson?: {
    fields: Array<{
      key: string;
      label: string;
      type: string;
      required?: boolean;
      defaultValue?: unknown;
      options?: string[];
      min?: number;
      max?: number;
      pattern?: string;
      multiple?: boolean;
    }>;
  };
}
```

**Example:**

```typescript
const entryType: MarvinEntryType = {
  id: 'type-123',
  name: 'Article',
  slug: 'article',
  icon: 'document',
  color: '#3b82f6',
  sortOrder: 1,
  isSystem: false,
  schemaJson: {
    fields: [
      {
        key: 'body',
        label: 'Body',
        type: 'markdown',
        required: true,
      },
      {
        key: 'author',
        label: 'Author',
        type: 'text',
        required: true,
      },
      {
        key: 'tags',
        label: 'Tags',
        type: 'select',
        multiple: true,
        options: ['tech', 'design', 'business'],
      },
    ],
  },
};
```

### `MarvinCollection`

Collection object.

```typescript
interface MarvinCollection {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  sortOrder: number;
  isSmart: boolean;
  smartRules?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  entryCount?: number;
  entries?: MarvinEntry[];
}
```

**Example:**

```typescript
const collection: MarvinCollection = {
  id: 'col-123',
  name: 'Featured Projects',
  slug: 'featured',
  description: 'Our best work',
  icon: 'star',
  color: '#f59e0b',
  sortOrder: 1,
  isSmart: false,
  entryCount: 12,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-07-01T00:00:00Z',
};
```

### `MarvinAsset`

Asset object.

```typescript
interface MarvinAsset {
  id: string;
  slug: string;
  name: string;
  originalFilename: string;
  filename: string;
  extension: string;
  mimeType: string;
  assetType: 'image' | 'document' | 'video' | 'audio' | 'archive' | 'svg' | 'other';
  fileSize: number;
  checksum: string;
  width?: number;
  height?: number;
  orientation?: number;
  storageProvider: string;
  storageKey: string;
  publicUrl?: string;
  altText?: string;
  description?: string;
  metadata?: Record<string, unknown>;
  uploadedBy: string;
  createdAt: string;
  updatedAt: string;
}
```

**Example:**

```typescript
const asset: MarvinAsset = {
  id: 'asset-123',
  slug: 'hero-image',
  name: 'Hero Image',
  originalFilename: 'hero.jpg',
  filename: 'hero-abc123.jpg',
  extension: 'jpg',
  mimeType: 'image/jpeg',
  assetType: 'image',
  fileSize: 245760,
  checksum: 'abc123def456',
  width: 1920,
  height: 1080,
  storageProvider: 's3',
  storageKey: 'assets/hero-abc123.jpg',
  publicUrl: 'https://cdn.example.com/hero-abc123.jpg',
  altText: 'Hero image',
  uploadedBy: 'user-123',
  createdAt: '2026-07-01T00:00:00Z',
  updatedAt: '2026-07-01T00:00:00Z',
};
```

### `MarvinResource`

Resource object.

```typescript
interface MarvinResource {
  id: string;
  name: string;
  slug: string;
  resourceType?: string;
  description?: string;
  externalId?: string;
  url?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}
```

**Example:**

```typescript
const resource: MarvinResource = {
  id: 'res-123',
  name: 'Kuroki S022',
  slug: 'kuroki-s022',
  resourceType: 'fabric',
  description: 'Japanese selvage denim',
  externalId: 'ext-789',
  metadata: {
    weight: '14oz',
    origin: 'Japan',
  },
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-07-01T00:00:00Z',
};
```

## Module Types

### `EntriesModule`

Entries module interface.

```typescript
interface EntriesModule {
  list(options?: GetEntriesOptions): Promise<Entry[]>;
  get(slug: string): Promise<Entry>;
  pages(options?: GetEntriesOptions): Promise<Entry[]>;
  posts(options?: GetEntriesOptions): Promise<Entry[]>;
  projects(options?: GetEntriesOptions): Promise<Entry[]>;
}
```

### `CollectionsModule`

Collections module interface.

```typescript
interface CollectionsModule {
  list(): Promise<Collection[]>;
  get(slug: string): Promise<Collection>;
  entries(slug: string): Promise<Entry[]>;
}
```

### `AssetsModule`

Assets module interface.

```typescript
interface AssetsModule {
  list(options?: GetAssetsOptions): Promise<Asset[]>;
  get(slug: string): Promise<Asset>;
  images(options?: GetAssetsOptions): Promise<Asset[]>;
  videos(options?: GetAssetsOptions): Promise<Asset[]>;
  documents(options?: GetAssetsOptions): Promise<Asset[]>;
}
```

### `ResourcesModule`

Resources module interface.

```typescript
interface ResourcesModule {
  list(options?: GetResourcesOptions): Promise<Resource[]>;
  get(slug: string): Promise<Resource>;
  entries(slug: string): Promise<Entry[]>;
}
```

## Options Types

### `GetEntriesOptions`

Options for listing entries.

```typescript
interface GetEntriesOptions {
  /** Filter by entry type slug */
  entryType?: string;
  
  /** Filter by collection slug */
  collection?: string;
  
  /** Maximum number of results */
  limit?: number;
  
  /** Number of results to skip */
  offset?: number;
  
  /** Filter by status (default: 'published') */
  status?: string;
}
```

**Example:**

```typescript
const options: GetEntriesOptions = {
  entryType: 'page',
  limit: 10,
  offset: 0,
  status: 'published',
};

const entries = await marvin.entries.list(options);
```

### `GetAssetsOptions`

Options for listing assets.

```typescript
interface GetAssetsOptions {
  /** Filter by asset type */
  type?: 'image' | 'document' | 'video' | 'audio' | 'archive' | 'svg' | 'other';
  
  /** Maximum number of results */
  limit?: number;
  
  /** Number of results to skip */
  offset?: number;
}
```

**Example:**

```typescript
const options: GetAssetsOptions = {
  type: 'image',
  limit: 20,
};

const images = await marvin.assets.list(options);
```

### `GetResourcesOptions`

Options for listing resources.

```typescript
interface GetResourcesOptions {
  /** Filter by resource type */
  resourceType?: string;
  
  /** Maximum number of results */
  limit?: number;
  
  /** Number of results to skip */
  offset?: number;
}
```

**Example:**

```typescript
const options: GetResourcesOptions = {
  resourceType: 'fabric',
  limit: 50,
};

const fabrics = await marvin.resources.list(options);
```

## Helper Types

### Generic Field Types

Type-safe field access:

```typescript
// String field
const body = entry.field<string>('body');

// Number field
const price = entry.field<number>('price');

// Boolean field
const featured = entry.field<boolean>('featured');

// Array field
const tags = entry.field<string[]>('tags');

// Union type
const difficulty = entry.field<'beginner' | 'intermediate' | 'advanced'>('difficulty');

// Asset UUID
const heroImage = entry.field<string>('heroImage');
```

### Response Types

```typescript
interface MarvinPublishResponse<T> {
  data: T;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
  };
}
```

## Type Guards

### Check Asset Type

```typescript
function isImage(asset: MarvinAsset): boolean {
  return asset.assetType === 'image';
}

function isVideo(asset: MarvinAsset): boolean {
  return asset.assetType === 'video';
}
```

### Check Entry Schema

```typescript
function hasField(entry: MarvinEntry, fieldKey: string): boolean {
  return entry.dataJson !== undefined && fieldKey in entry.dataJson;
}

function getFieldType(entryType: MarvinEntryType, fieldKey: string): string | undefined {
  const field = entryType.schemaJson?.fields.find(f => f.key === fieldKey);
  return field?.type;
}
```

## Custom Types

### Extending Entry Types

Define custom types for your entry schemas:

```typescript
interface ArticleData {
  body: string;
  author: string;
  publishDate: string;
  tags: string[];
  heroImage?: string;
}

interface ArticleEntry extends MarvinEntry {
  dataJson: ArticleData;
}

// Usage
const article = await marvin.entry('my-article') as ArticleEntry;
const author = article.dataJson.author; // Type-safe!
```

### Custom Resource Types

```typescript
interface FabricResource extends MarvinResource {
  resourceType: 'fabric';
  metadata: {
    weight: string;
    origin: string;
    mill: string;
  };
}

const fabric = await marvin.resource('kuroki-s022') as FabricResource;
const weight = fabric.metadata.weight; // Type-safe!
```

## Next Steps

- [Security Best Practices](security.md) - Secure your tokens
- [Error Handling](errors.md) - Handle errors gracefully
- [API Reference](../api/client.md) - Complete API docs
