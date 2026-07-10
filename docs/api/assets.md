# Assets Module API Reference

## Overview

The Assets Module provides methods for fetching and working with binary files and media (images, videos, documents).

## Accessing the Module

```typescript
// Via workspace
const workspace = await marvin.getWorkspace();
const assetsModule = workspace.assets;

// Via client
const assetsModule = marvin.assets;
```

## Methods

### `list(options?)`

Get all assets with optional filtering.

```typescript
async list(options?: ListAssetsOptions): Promise<Asset[]>
```

**Parameters:**

```typescript
interface ListAssetsOptions {
  type?: string;     // Filter by MIME type prefix (e.g., 'image/', 'video/')
  limit?: number;    // Max results
  offset?: number;   // Pagination offset
}
```

**Returns:** `Promise<Asset[]>`

**Examples:**

```typescript
// All assets
const assets = await marvin.assets.list();

// Filter by MIME type
const images = await marvin.assets.list({ type: 'image/' });
const videos = await marvin.assets.list({ type: 'video/' });
const pdfs = await marvin.assets.list({ type: 'application/pdf' });

// Pagination
const page1 = await marvin.assets.list({ limit: 20, offset: 0 });
const page2 = await marvin.assets.list({ limit: 20, offset: 20 });
```

### `images(options?)`

Get all images (shortcut for `list({ type: 'image/' })`).

```typescript
async images(options?: Omit<ListAssetsOptions, 'type'>): Promise<Asset[]>
```

**Example:**
```typescript
const images = await marvin.assets.images();
const recentImages = await marvin.assets.images({ limit: 10 });
```

### `videos(options?)`

Get all videos (shortcut for `list({ type: 'video/' })`).

```typescript
async videos(options?: Omit<ListAssetsOptions, 'type'>): Promise<Asset[]>
```

**Example:**
```typescript
const videos = await marvin.assets.videos();
```

### `documents(options?)`

Get all documents (shortcut for `list({ type: 'application/' })`).

```typescript
async documents(options?: Omit<ListAssetsOptions, 'type'>): Promise<Asset[]>
```

**Example:**
```typescript
const documents = await marvin.assets.documents();
```

## Asset Object

### Properties

| Property | Type | Description |
|----------|------|-------------|
| `id` | `number` | Unique asset ID |
| `filename` | `string` | Original filename |
| `slug` | `string` | URL-friendly slug |
| `title` | `string \| null` | Asset title |
| `altText` | `string \| null` | Alternative text |
| `url` | `string` | Public URL |
| `mimeType` | `string` | MIME type (e.g., `image/jpeg`) |
| `fileSize` | `number` | File size in bytes |
| `width` | `number \| null` | Image/video width |
| `height` | `number \| null` | Image/video height |
| `metadata` | `object` | Custom metadata |
| `createdAt` | `Date` | Upload date |
| `updatedAt` | `Date` | Last update date |

## Usage Examples

### List All Assets

```typescript
const assets = await marvin.assets.list();

for (const asset of assets) {
  console.log(`${asset.filename} - ${asset.mimeType}`);
  console.log(`  URL: ${asset.url}`);
  console.log(`  Size: ${asset.fileSize} bytes`);
}
```

### Get Images

```typescript
const images = await marvin.assets.images();

for (const image of images) {
  console.log(`<img src="${image.url}" alt="${image.altText}" />`);
}
```

### Get Videos

```typescript
const videos = await marvin.assets.videos();

for (const video of videos) {
  console.log(`<video src="${video.url}" controls></video>`);
}
```

### Get Documents

```typescript
const documents = await marvin.assets.documents();

for (const doc of documents) {
  console.log(`<a href="${doc.url}" download>${doc.filename}</a>`);
}
```

### Filter by Specific MIME Type

```typescript
// JPEG images only
const jpegs = await marvin.assets.list({ type: 'image/jpeg' });

// PNG images only
const pngs = await marvin.assets.list({ type: 'image/png' });

// PDF documents only
const pdfs = await marvin.assets.list({ type: 'application/pdf' });

// MP4 videos only
const mp4s = await marvin.assets.list({ type: 'video/mp4' });
```

### Image Gallery

```typescript
const images = await marvin.assets.images();

const gallery = images.map(image => ({
  src: image.url,
  alt: image.altText || image.title || image.filename,
  width: image.width,
  height: image.height,
  title: image.title,
}));
```

### Download Links

```typescript
const documents = await marvin.assets.documents();

for (const doc of documents) {
  const sizeInKB = (doc.fileSize / 1024).toFixed(2);
  console.log(`${doc.filename} (${sizeInKB} KB)`);
  console.log(`Download: ${doc.url}`);
}
```

### Responsive Images

```typescript
const images = await marvin.assets.images();

for (const image of images) {
  console.log(`
    <img 
      src="${image.url}" 
      alt="${image.altText}"
      width="${image.width}"
      height="${image.height}"
      loading="lazy"
    />
  `);
}
```

### Filter Entry Assets

```typescript
const entry = await marvin.entry('gallery');

// Get all entry assets
const allAssets = entry.assets;

// Filter by type
const images = entry.assets.filter(a => a.mimeType.startsWith('image/'));
const videos = entry.assets.filter(a => a.mimeType.startsWith('video/'));

// Get featured asset
const featured = entry.assets.find(a => a.metadata?.featured === true);

// Sort by filename
const sorted = entry.assets.sort((a, b) => 
  a.filename.localeCompare(b.filename)
);
```

### Asset Metadata

```typescript
const images = await marvin.assets.images();

for (const image of images) {
  // Standard properties
  console.log(`Filename: ${image.filename}`);
  console.log(`URL: ${image.url}`);
  console.log(`Size: ${image.fileSize} bytes`);
  console.log(`Dimensions: ${image.width}x${image.height}`);
  
  // Custom metadata
  if (image.metadata) {
    console.log(`Caption: ${image.metadata.caption}`);
    console.log(`Credit: ${image.metadata.photographer}`);
  }
}
```

### Pagination

```typescript
const allImages = [];
let offset = 0;
const limit = 50;

while (true) {
  const batch = await marvin.assets.images({ limit, offset });
  allImages.push(...batch);
  
  if (batch.length < limit) break;
  offset += limit;
}

console.log(`Total images: ${allImages.length}`);
```

## Common MIME Types

### Images

- `image/jpeg` - JPEG images
- `image/png` - PNG images
- `image/gif` - GIF images
- `image/webp` - WebP images
- `image/svg+xml` - SVG images

### Videos

- `video/mp4` - MP4 videos
- `video/webm` - WebM videos
- `video/ogg` - Ogg videos
- `video/quicktime` - MOV videos

### Documents

- `application/pdf` - PDF documents
- `application/msword` - Word documents (.doc)
- `application/vnd.openxmlformats-officedocument.wordprocessingml.document` - Word documents (.docx)
- `application/vnd.ms-excel` - Excel spreadsheets (.xls)
- `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` - Excel spreadsheets (.xlsx)
- `text/plain` - Plain text files

## Type Definitions

### `Asset`

```typescript
interface Asset {
  id: number;
  filename: string;
  slug: string;
  title: string | null;
  altText: string | null;
  url: string;
  mimeType: string;
  fileSize: number;
  width: number | null;
  height: number | null;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}
```

### `ListAssetsOptions`

```typescript
interface ListAssetsOptions {
  type?: string;
  limit?: number;
  offset?: number;
}
```

## See Also

- [Assets Concept](../concepts/assets.md)
- [Entries Module](entries.md)
- [Workspace API](workspace.md)
