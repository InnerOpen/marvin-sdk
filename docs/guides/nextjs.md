# Next.js Integration Guide

## Overview

Integrate Marvin SDK with Next.js for both App Router and Pages Router.

## Installation

```bash
npm install @inneropen/marvin-sdk marked
```

## Configuration

### Environment Variables

Create `.env.local`:

```env
MARVIN_API_URL=https://marvin.example.com
MARVIN_SITE_CLIENT_TOKEN=your-token-here
MARVIN_WORKSPACE_SLUG=your-workspace
```

### Next.js Config

Update `next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    MARVIN_API_URL: process.env.MARVIN_API_URL,
    MARVIN_SITE_CLIENT_TOKEN: process.env.MARVIN_SITE_CLIENT_TOKEN,
    MARVIN_WORKSPACE_SLUG: process.env.MARVIN_WORKSPACE_SLUG,
  },
};

module.exports = nextConfig;
```

## App Router (Next.js 13+)

### Create Marvin Client

Create `lib/marvin.ts`:

```typescript
import { createMarvinClient } from '@inneropen/marvin-sdk';

export const marvin = createMarvinClient({
  autoInitialize: true,
});
```

### Dynamic Routes

Create `app/[slug]/page.tsx`:

```typescript
import { marvin } from '@/lib/marvin';
import { marked } from 'marked';
import { notFound } from 'next/navigation';

export async function generateStaticParams() {
  const pages = await marvin.pages();
  
  return pages.map((page) => ({
    slug: page.slug,
  }));
}

export async function generateMetadata({ 
  params 
}: { 
  params: { slug: string } 
}) {
  const entry = await marvin.entry(params.slug);
  
  return {
    title: entry.title,
    description: entry.description || entry.summary,
  };
}

export default async function Page({ 
  params 
}: { 
  params: { slug: string } 
}) {
  try {
    const entry = await marvin.entry(params.slug);
    const contentHtml = marked.parse(entry.contentMarkdown ?? '');
    
    return (
      <article>
        <h1>{entry.title}</h1>
        {entry.summary && <p className="summary">{entry.summary}</p>}
        <div dangerouslySetInnerHTML={{ __html: contentHtml }} />
      </article>
    );
  } catch (error) {
    notFound();
  }
}
```

### Blog

Create `app/blog/page.tsx`:

```typescript
import { marvin } from '@/lib/marvin';
import Link from 'next/link';

export const metadata = {
  title: 'Blog',
};

export default async function BlogPage() {
  const posts = await marvin.posts();
  
  return (
    <div>
      <h1>Blog</h1>
      <div className="posts">
        {posts.map((post) => (
          <article key={post.id}>
            <h2>
              <Link href={`/blog/${post.slug}`}>{post.title}</Link>
            </h2>
            {post.summary && <p>{post.summary}</p>}
            <time>{post.publishedAt?.toLocaleDateString()}</time>
          </article>
        ))}
      </div>
    </div>
  );
}
```

Create `app/blog/[slug]/page.tsx`:

```typescript
import { marvin } from '@/lib/marvin';
import { marked } from 'marked';
import { notFound } from 'next/navigation';

export async function generateStaticParams() {
  const posts = await marvin.posts();
  
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ 
  params 
}: { 
  params: { slug: string } 
}) {
  const post = await marvin.entry(params.slug);
  
  return {
    title: post.title,
    description: post.summary || post.description,
  };
}

export default async function BlogPost({ 
  params 
}: { 
  params: { slug: string } 
}) {
  try {
    const post = await marvin.entry(params.slug);
    const contentHtml = marked.parse(post.contentMarkdown ?? '');
    
    return (
      <article>
        <h1>{post.title}</h1>
        <time>{post.publishedAt?.toLocaleDateString()}</time>
        {post.summary && <p className="lead">{post.summary}</p>}
        <div dangerouslySetInnerHTML={{ __html: contentHtml }} />
      </article>
    );
  } catch (error) {
    notFound();
  }
}
```

### Images with next/image

Create `app/gallery/page.tsx`:

```typescript
import { marvin } from '@/lib/marvin';
import Image from 'next/image';

export default async function GalleryPage() {
  const images = await marvin.assets.images();
  
  return (
    <div>
      <h1>Gallery</h1>
      <div className="grid grid-cols-3 gap-4">
        {images.map((image) => (
          <div key={image.id}>
            <Image
              src={image.url}
              alt={image.altText || ''}
              width={image.width || 300}
              height={image.height || 300}
              className="w-full h-auto"
            />
            {image.title && <p>{image.title}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
```

## Pages Router (Legacy)

### getStaticPaths + getStaticProps

Create `pages/[slug].tsx`:

```typescript
import { marvin } from '@/lib/marvin';
import { marked } from 'marked';
import type { GetStaticPaths, GetStaticProps } from 'next';
import type { Entry } from '@inneropen/marvin-sdk';

interface PageProps {
  page: Entry;
}

export const getStaticPaths: GetStaticPaths = async () => {
  const pages = await marvin.pages();
  
  return {
    paths: pages.map((page) => ({
      params: { slug: page.slug },
    })),
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps<PageProps> = async ({ params }) => {
  const page = await marvin.entry(params!.slug as string);
  
  return {
    props: { page },
    revalidate: 60, // ISR: revalidate every 60 seconds
  };
};

export default function Page({ page }: PageProps) {
  const contentHtml = marked.parse(page.contentMarkdown ?? '');
  
  return (
    <article>
      <h1>{page.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: contentHtml }} />
    </article>
  );
}
```

## API Routes

Create `app/api/entries/route.ts`:

```typescript
import { marvin } from '@/lib/marvin';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const entryType = searchParams.get('entryType');
  const limit = parseInt(searchParams.get('limit') || '10');
  
  const entries = await marvin.entries.list({
    entryType: entryType || undefined,
    limit,
  });
  
  return NextResponse.json(entries);
}
```

Create `app/api/entries/[slug]/route.ts`:

```typescript
import { marvin } from '@/lib/marvin';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const entry = await marvin.entry(params.slug);
    return NextResponse.json(entry.toJSON());
  } catch (error) {
    return NextResponse.json(
      { error: 'Entry not found' },
      { status: 404 }
    );
  }
}
```

## Incremental Static Regeneration (ISR)

```typescript
// App Router
export const revalidate = 60; // Revalidate every 60 seconds

export default async function Page() {
  const posts = await marvin.posts();
  // ...
}
```

```typescript
// Pages Router
export const getStaticProps: GetStaticProps = async () => {
  const posts = await marvin.posts();
  
  return {
    props: { posts },
    revalidate: 60, // Revalidate every 60 seconds
  };
};
```

## Server Components vs Client Components

### Server Components (Default)

```typescript
// app/posts/page.tsx (Server Component)
import { marvin } from '@/lib/marvin';

export default async function PostsPage() {
  // Fetch data directly in Server Component
  const posts = await marvin.posts();
  
  return (
    <div>
      {posts.map((post) => (
        <article key={post.id}>
          <h2>{post.title}</h2>
        </article>
      ))}
    </div>
  );
}
```

### Client Components

```typescript
'use client';

import { useEffect, useState } from 'react';
import type { Entry } from '@inneropen/marvin-sdk';

export default function PostsList() {
  const [posts, setPosts] = useState<Entry[]>([]);
  
  useEffect(() => {
    fetch('/api/entries?entryType=post')
      .then(res => res.json())
      .then(setPosts);
  }, []);
  
  return (
    <div>
      {posts.map((post) => (
        <article key={post.id}>
          <h2>{post.title}</h2>
        </article>
      ))}
    </div>
  );
}
```

## TypeScript

```typescript
import type { Entry, Collection, Asset } from '@inneropen/marvin-sdk';

interface PageProps {
  entry: Entry;
}

interface CollectionPageProps {
  collection: Collection;
  entries: Entry[];
}
```

## Troubleshooting

### "Cannot find module '@inneropen/marvin-sdk'"

Install the package:

```bash
npm install @inneropen/marvin-sdk
```

### Environment variables not available

Ensure `.env.local` exists and `next.config.js` exposes variables.

### Build-time errors

Ensure your Marvin server is accessible during build:

```bash
# Test connection
curl $MARVIN_API_URL/api/health
```

## Next Steps

- [API Reference](../api/client.md)
- [Caching Strategy](caching.md)
- [Examples](../examples.md)
