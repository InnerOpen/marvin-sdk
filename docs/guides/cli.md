# CLI Tools Guide

## Overview

Build CLI tools with the Marvin SDK for automation, content management, and DevOps workflows.

## Installation

```bash
npm install @inneropen/marvin-sdk
npm install --save-dev @types/node tsx
```

## Basic CLI Script

Create `cli.ts`:

```typescript
#!/usr/bin/env node
import { createMarvinClient } from '@inneropen/marvin-sdk';

const marvin = createMarvinClient();

async function main() {
  await marvin.initialize();
  
  console.log('Site:', marvin.site?.title);
  
  const entries = await marvin.entries.list();
  console.log(`Found ${entries.length} entries`);
}

main().catch(console.error);
```

Run it:

```bash
npx tsx cli.ts
```

## List Entries

```typescript
#!/usr/bin/env node
import { createMarvinClient } from '@inneropen/marvin-sdk';

const marvin = createMarvinClient();

async function listEntries() {
  const entries = await marvin.entries.list();
  
  console.log(`\nEntries (${entries.length}):`);
  console.log('─'.repeat(60));
  
  for (const entry of entries) {
    console.log(`${entry.title.padEnd(40)} ${entry.status.padEnd(10)} ${entry.slug}`);
  }
}

listEntries().catch(console.error);
```

## Filter and Search

```typescript
#!/usr/bin/env node
import { createMarvinClient } from '@inneropen/marvin-sdk';

const marvin = createMarvinClient();

async function searchEntries(query: string) {
  const entries = await marvin.entries.list();
  
  const results = entries.filter(entry => 
    entry.title.toLowerCase().includes(query.toLowerCase()) ||
    entry.slug.toLowerCase().includes(query.toLowerCase()) ||
    entry.summary?.toLowerCase().includes(query.toLowerCase())
  );
  
  console.log(`\nFound ${results.length} entries matching "${query}":`);
  
  for (const entry of results) {
    console.log(`- ${entry.title} (${entry.slug})`);
  }
}

const query = process.argv[2];
if (!query) {
  console.error('Usage: tsx search.ts <query>');
  process.exit(1);
}

searchEntries(query).catch(console.error);
```

## Export Content

```typescript
#!/usr/bin/env node
import { createMarvinClient } from '@inneropen/marvin-sdk';
import fs from 'fs/promises';
import path from 'path';

const marvin = createMarvinClient();

async function exportContent() {
  const entries = await marvin.entries.list();
  
  // Create export directory
  await fs.mkdir('export', { recursive: true });
  
  for (const entry of entries) {
    const filename = `${entry.slug}.md`;
    const filepath = path.join('export', filename);
    
    const content = [
      `---`,
      `title: ${entry.title}`,
      `slug: ${entry.slug}`,
      `status: ${entry.status}`,
      `published: ${entry.publishedAt?.toISOString()}`,
      `---`,
      ``,
      entry.contentMarkdown || '',
    ].join('\n');
    
    await fs.writeFile(filepath, content, 'utf-8');
    console.log(`Exported: ${filename}`);
  }
  
  console.log(`\nExported ${entries.length} entries to ./export`);
}

exportContent().catch(console.error);
```

## Generate Sitemap

```typescript
#!/usr/bin/env node
import { createMarvinClient } from '@inneropen/marvin-sdk';
import fs from 'fs/promises';

const marvin = createMarvinClient();

async function generateSitemap() {
  const workspace = await marvin.getWorkspace();
  const entries = await marvin.entries.list({ status: 'published' });
  
  const baseUrl = workspace.site?.url || 'https://example.com';
  
  const urls = entries.map(entry => {
    const lastmod = entry.updatedAt.toISOString().split('T')[0];
    return `
  <url>
    <loc>${baseUrl}/${entry.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
  }).join('');
  
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
  
  await fs.writeFile('sitemap.xml', sitemap, 'utf-8');
  console.log(`Generated sitemap.xml with ${entries.length} URLs`);
}

generateSitemap().catch(console.error);
```

## Generate RSS Feed

```typescript
#!/usr/bin/env node
import { createMarvinClient } from '@inneropen/marvin-sdk';
import fs from 'fs/promises';

const marvin = createMarvinClient();

async function generateRSS() {
  const workspace = await marvin.getWorkspace();
  const posts = await marvin.posts();
  
  const baseUrl = workspace.site?.url || 'https://example.com';
  const siteTitle = workspace.site?.title || 'Blog';
  
  const items = posts.map(post => `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${baseUrl}/blog/${post.slug}</link>
      <guid>${baseUrl}/blog/${post.slug}</guid>
      <pubDate>${post.publishedAt?.toUTCString()}</pubDate>
      <description>${escapeXml(post.summary || '')}</description>
    </item>`).join('');
  
  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(siteTitle)}</title>
    <link>${baseUrl}</link>
    <description>Latest posts from ${escapeXml(siteTitle)}</description>
    ${items}
  </channel>
</rss>`;
  
  await fs.writeFile('rss.xml', rss, 'utf-8');
  console.log(`Generated rss.xml with ${posts.length} posts`);
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

generateRSS().catch(console.error);
```

## Interactive CLI with Commander

```bash
npm install commander
```

```typescript
#!/usr/bin/env node
import { Command } from 'commander';
import { createMarvinClient } from '@inneropen/marvin-sdk';

const program = new Command();
const marvin = createMarvinClient();

program
  .name('marvin-cli')
  .description('CLI tool for Marvin CMS')
  .version('1.0.0');

program
  .command('list')
  .description('List all entries')
  .option('-t, --type <type>', 'Filter by entry type')
  .option('-c, --collection <collection>', 'Filter by collection')
  .action(async (options) => {
    const entries = await marvin.entries.list({
      entryType: options.type,
      collection: options.collection,
    });
    
    for (const entry of entries) {
      console.log(`${entry.title} (${entry.slug})`);
    }
  });

program
  .command('get <slug>')
  .description('Get entry by slug')
  .action(async (slug) => {
    const entry = await marvin.entry(slug);
    console.log(JSON.stringify(entry.toJSON(), null, 2));
  });

program
  .command('export')
  .description('Export all entries to Markdown files')
  .option('-o, --output <dir>', 'Output directory', 'export')
  .action(async (options) => {
    // Export logic here
    console.log(`Exporting to ${options.output}...`);
  });

program.parse();
```

Usage:

```bash
npx tsx cli.ts list
npx tsx cli.ts list --type post
npx tsx cli.ts get about-us
npx tsx cli.ts export --output ./content
```

## Interactive Prompts with Inquirer

```bash
npm install inquirer @types/inquirer
```

```typescript
#!/usr/bin/env node
import inquirer from 'inquirer';
import { createMarvinClient } from '@inneropen/marvin-sdk';

const marvin = createMarvinClient();

async function interactive() {
  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'What would you like to do?',
      choices: [
        'List entries',
        'Search entries',
        'Export content',
        'Generate sitemap',
        'Exit',
      ],
    },
  ]);
  
  switch (action) {
    case 'List entries':
      await listEntries();
      break;
    case 'Search entries':
      await searchEntries();
      break;
    case 'Export content':
      await exportContent();
      break;
    case 'Generate sitemap':
      await generateSitemap();
      break;
    case 'Exit':
      process.exit(0);
  }
  
  // Loop back
  await interactive();
}

async function listEntries() {
  const entries = await marvin.entries.list();
  console.log(`\nFound ${entries.length} entries\n`);
  
  for (const entry of entries) {
    console.log(`- ${entry.title}`);
  }
}

async function searchEntries() {
  const { query } = await inquirer.prompt([
    {
      type: 'input',
      name: 'query',
      message: 'Search query:',
    },
  ]);
  
  // Search logic...
  console.log(`Searching for "${query}"...`);
}

interactive().catch(console.error);
```

## Environment Variables

Create `.env`:

```env
MARVIN_API_URL=https://marvin.example.com
MARVIN_SITE_CLIENT_TOKEN=your-token
MARVIN_WORKSPACE_SLUG=your-workspace
```

Use `dotenv`:

```bash
npm install dotenv
```

```typescript
import 'dotenv/config';
import { createMarvinClient } from '@inneropen/marvin-sdk';

const marvin = createMarvinClient();
```

## Progress Bars

```bash
npm install cli-progress @types/cli-progress
```

```typescript
import cliProgress from 'cli-progress';

async function exportAll() {
  const entries = await marvin.entries.list();
  
  const bar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
  bar.start(entries.length, 0);
  
  for (let i = 0; i < entries.length; i++) {
    // Export entry
    bar.update(i + 1);
  }
  
  bar.stop();
  console.log('Export complete!');
}
```

## Make CLI Executable

Add to `package.json`:

```json
{
  "bin": {
    "marvin": "./cli.ts"
  },
  "scripts": {
    "build": "tsc",
    "marvin": "tsx cli.ts"
  }
}
```

Install globally:

```bash
npm link
marvin list
```

## Next Steps

- [API Reference](../api/client.md)
- [Examples](../examples.md)
