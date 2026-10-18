# Assets and Resources

## Overview

**Assets** are binary files and media in Marvin (images, videos, documents). **Resources** are
reusable structured objects (fabrics, tools, suppliers). The publishing API has no asset or
resource listing endpoints: both are delivered inline on entries.

## On entries

A single entry (`marvin.entry(slug)`) carries full asset and resource objects:

```typescript
const entry = await marvin.entry('about-us');

const images = entry.assets.filter((a) => a.mimeType.startsWith('image/'));
const featured = entry.assets.find((a) => a.metadata?.featured === true);
const fabrics = entry.resources.filter((r) => r.resourceType === 'fabric');
```

List endpoints (`marvin.posts()`, `workspace.entries.list()`) return `assetSlugs` and
`resourceSlugs` plus a resolved `featuredAsset`; fetch the entry for the full objects.

## Site config

`marvin.getSite()` returns the logo, favicon and SEO image as resolved URLs, ready to use as-is.

Entries carry public asset URLs (`publicUrl`), so there is no download endpoint on the publishing API.
