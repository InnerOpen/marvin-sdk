# Assets

## Overview

**Assets** are binary files and media in Marvin: images, videos, documents, and more.

```typescript
const images = await marvin.assets.images();
const videos = await marvin.assets.videos();
```

## Asset Properties

### Basic Properties

| Property | Type | Description |
|----------|------|-------------|
| `id` | `number` | Unique asset ID |
| `filename` | `string` | Original filename |
| `slug` | `string` | URL-friendly slug |
| `title` | `string \| null` | Asset title |
| `altText` | `string \| null` | Alternative text |

### File Properties

| Property | Type | Description |
|----------|------|-------------|
| `url` | `string` | Public URL |
| `mimeType` | `string` | MIME type (e.g., `image/jpeg`) |
| `fileSize` | `number` | File size in bytes |
| `width` | `number \| null` | Image/video width |
| `height` | `number \| null` | Image/video height |

### Metadata

| Property | Type | Description |
|----------|------|-------------|
| `metadata` | `object` | Custom metadata |
| `createdAt` | `Date` | Upload date |
| `updatedAt` | `Date` | Last update date |

## Fetching Assets

### List All Assets

```typescript
const assets = await marvin.assets.list();

for (const asset of assets) {
  console.log(asset.filename, asset.url);
}
```

### Filter by Type

```typescript
// Get images
const images = await marvin.assets.images();

// Get videos
const videos = await marvin.assets.videos();

// Get documents
const documents = await marvin.assets.documents();
```

### Filter by MIME Type

```typescript
// Get specific MIME types
const jpegImages = await marvin.assets.list({
  type: 'image/jpeg',
});

const pdfDocuments = await marvin.assets.list({
  type: 'application/pdf',
});
```

### Pagination

```typescript
const page1 = await marvin.assets.list({
  limit: 20,
  offset: 0,
});

const page2 = await marvin.assets.list({
  limit: 20,
  offset: 20,
});
```

## Working with Assets

### Display Images

```typescript
const images = await marvin.assets.images();

for (const image of images) {
  console.log(`<img src="${image.url}" alt="${image.altText}" />`);
}
```

### Get Asset Metadata

```typescript
const image = await marvin.assets.list({ type: 'image/jpeg' });
const [firstImage] = image;

console.log(`Filename: ${firstImage.filename}`);
console.log(`Size: ${firstImage.fileSize} bytes`);
console.log(`Dimensions: ${firstImage.width}x${firstImage.height}`);
console.log(`URL: ${firstImage.url}`);
```

### Filter Entry Assets

```typescript
const entry = await marvin.entry('gallery');

// Get all assets
const allAssets = entry.assets;

// Filter images
const images = entry.assets.filter(a => a.mimeType.startsWith('image/'));

// Filter videos
const videos = entry.assets.filter(a => a.mimeType.startsWith('video/'));

// Get featured image
const featuredImage = entry.assets.find(a => a.metadata?.featured === true);
```

## Asset Types

### Images

Common image MIME types:

- `image/jpeg` - JPEG images
- `image/png` - PNG images
- `image/gif` - GIF images
- `image/webp` - WebP images
- `image/svg+xml` - SVG images

```typescript
const images = await marvin.assets.images();

for (const image of images) {
  const { url, altText, width, height } = image;
  console.log(`<img src="${url}" alt="${altText}" width="${width}" height="${height}" />`);
}
```

### Videos

Common video MIME types:

- `video/mp4` - MP4 videos
- `video/webm` - WebM videos
- `video/ogg` - Ogg videos

```typescript
const videos = await marvin.assets.videos();

for (const video of videos) {
  console.log(`<video src="${video.url}" controls></video>`);
}
```

### Documents

Common document MIME types:

- `application/pdf` - PDF documents
- `application/msword` - Word documents
- `text/plain` - Plain text files

```typescript
const documents = await marvin.assets.documents();

for (const doc of documents) {
  console.log(`<a href="${doc.url}" download>${doc.filename}</a>`);
}
```

## Example Usage

### Astro Image Gallery

```typescript
---
import { createMarvinClient } from '@inneropen/marvin-sdk';

const marvin = createMarvinClient();
const images = await marvin.assets.images();
---

<div class="gallery">
  {images.map((image) => (
    <figure>
      <img 
        src={image.url} 
        alt={image.altText} 
        width={image.width} 
        height={image.height} 
      />
      {image.title && <figcaption>{image.title}</figcaption>}
    </figure>
  ))}
</div>
```

### Next.js Asset Grid

```typescript
// app/gallery/page.tsx
import { createMarvinClient } from '@inneropen/marvin-sdk';
import Image from 'next/image';

const marvin = createMarvinClient();

export default async function GalleryPage() {
  const images = await marvin.assets.images();
  
  return (
    <div className="grid grid-cols-3 gap-4">
      {images.map((image) => (
        <div key={image.id}>
          <Image
            src={image.url}
            alt={image.altText || ''}
            width={image.width || 300}
            height={image.height || 300}
          />
        </div>
      ))}
    </div>
  );
}
```

### Express API

```typescript
import express from 'express';
import { createMarvinClient } from '@inneropen/marvin-sdk';

const app = express();
const marvin = createMarvinClient();

app.get('/api/assets', async (req, res) => {
  const { type, limit, offset } = req.query;
  
  const assets = await marvin.assets.list({
    type: type as string,
    limit: parseInt(limit as string) || 20,
    offset: parseInt(offset as string) || 0,
  });
  
  res.json(assets);
});

app.get('/api/assets/images', async (req, res) => {
  const images = await marvin.assets.images();
  res.json(images);
});
```

## Responsive Images

### Generate Srcset

```typescript
const entry = await marvin.entry('gallery');
const images = entry.assets.filter(a => a.mimeType.startsWith('image/'));

for (const image of images) {
  // Marvin may provide image transformations in the future
  console.log(`<img 
    src="${image.url}" 
    alt="${image.altText}"
    width="${image.width}"
    height="${image.height}"
  />`);
}
```

## Next Steps

- [Entries Concept](entries.md)
- [Collections Concept](collections.md)
- [Resources Concept](resources.md)
- [API Reference](../api/assets.md)
