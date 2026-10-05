/**
 * `expand: 'full'` on the publishing list reads.
 *
 * An expanding server returns full entries (the single read) and the SDK hands back `Entry`
 * objects; an older server ignores `?expand=full` and returns list items, which come back in
 * their usual shape. Without the option nothing changes.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MarvinHttpClient } from '../client/http'
import { CollectionsModule } from '../collections/collections'
import { EntriesModule } from '../entries/entries'
import { Entry, isFullEntryData } from '../entries/entry'
import { MarvinNotFoundError } from '../core/errors'

const membership = { role: 'item', position: 3, metadataJson: null, collection: { slug: 'projects', name: 'Projects', sortOrder: 0 } }

const fullEntry = {
  slug: 'tote',
  title: 'Tote',
  entryType: 'project',
  data: { body: 'x' },
  collections: [membership],
  assets: [{ role: 'hero', position: 0, metadataJson: null, asset: { slug: 'tote-hero', name: 'Hero', mimeType: 'image/jpeg', assetType: 'image', publicUrl: '/a' } }],
  resources: [],
  tags: [],
  embeds: {},
  order: 3,
}

const listItem = {
  slug: 'tote',
  title: 'Tote',
  entryType: 'project',
  status: 'published',
  data: { body: 'x' },
  collections: [membership],
  assetSlugs: ['tote-hero'],
  resourceSlugs: [],
  tags: [],
  featuredAsset: null,
  embeds: {},
  order: 3,
}

const collection = (entries: unknown[]) => ({ slug: 'projects', name: 'Projects', entryCount: entries.length, entries })

describe('isFullEntryData', () => {
  it('tells a full entry from a list item', () => {
    expect(isFullEntryData(fullEntry)).toBe(true)
    expect(isFullEntryData(listItem)).toBe(false)
    expect(isFullEntryData(null)).toBe(false)
    expect(isFullEntryData({ slug: 'x' })).toBe(false)
  })
})

describe('collections.entries with expand', () => {
  let http: MarvinHttpClient
  let fetch: ReturnType<typeof vi.spyOn>
  let collections: CollectionsModule

  beforeEach(() => {
    http = new MarvinHttpClient({ apiUrl: 'https://marvin.test', siteClientToken: 'marvin_sk_x', workspaceSlug: 'ws' })
    fetch = vi.spyOn(http, 'fetch')
    collections = new CollectionsModule(http, 'ws')
  })

  it('asks for ?expand=full and returns Entry objects from an expanding server', async () => {
    fetch.mockResolvedValueOnce(collection([fullEntry]))

    const entries = await collections.entries('projects', { expand: 'full' })

    expect(fetch).toHaveBeenCalledWith('/api/publish/ws/collections/projects?expand=full')
    expect(fetch).toHaveBeenCalledTimes(1)
    expect(entries).toHaveLength(1)
    const [entry] = entries
    expect(entry).toBeInstanceOf(Entry)
    expect((entry as Entry).assets[0]).toMatchObject({ slug: 'tote-hero', entryMetadata: { role: 'hero' } })
    expect((entry as Entry).collections[0]?.entryMetadata.role).toBe('item')
    expect((entry as Entry).order).toBe(3)
    expect((entry as Entry).toJSON()).toEqual(fullEntry)
  })

  it('passes an older server’s list items through in their usual shape', async () => {
    fetch.mockResolvedValueOnce(collection([listItem]))

    const entries = await collections.entries('projects', { expand: 'full' })

    expect(entries[0]).not.toBeInstanceOf(Entry)
    expect(entries[0]).toMatchObject({ slug: 'tote', assetSlugs: ['tote-hero'], collectionSlugs: ['projects'] })
    expect(entries[0]).toHaveProperty('collection.entryMetadata.role', 'item')
  })

  it('returns [] for a missing collection', async () => {
    fetch.mockRejectedValueOnce(new MarvinNotFoundError('Collection', 'nope'))

    expect(await collections.entries('nope', { expand: 'full' })).toEqual([])
  })

  it('is unchanged without the option', async () => {
    fetch.mockResolvedValueOnce(collection([listItem]))

    const entries = await collections.entries('projects')

    expect(fetch).toHaveBeenCalledWith('/api/publish/ws/collections/projects')
    expect(entries[0]).not.toBeInstanceOf(Entry)
    expect(entries[0]).toMatchObject({ assetSlugs: ['tote-hero'], collectionSlugs: ['projects'] })
  })
})

describe('entries.list with expand', () => {
  let http: MarvinHttpClient
  let fetch: ReturnType<typeof vi.spyOn>
  let entries: EntriesModule

  beforeEach(() => {
    http = new MarvinHttpClient({ apiUrl: 'https://marvin.test', siteClientToken: 'marvin_sk_x', workspaceSlug: 'ws' })
    fetch = vi.spyOn(http, 'fetch')
    entries = new EntriesModule(http, 'ws')
  })

  it('asks for expand=full with the other filters and returns Entry objects', async () => {
    fetch.mockResolvedValueOnce({ data: [fullEntry], meta: { total: 1, page: 1, limit: 100, offset: 0 } })

    const page = await entries.list({ collection: 'projects', limit: 100, expand: 'full' })

    expect(fetch).toHaveBeenCalledWith('/api/publish/ws/entries?collection=projects&limit=100&expand=full')
    expect(page[0]).toBeInstanceOf(Entry)
  })

  it('returns list entries from an older server', async () => {
    fetch.mockResolvedValueOnce({ data: [listItem], meta: { total: 1, page: 1, limit: 20, offset: 0 } })

    const page = await entries.list({ expand: 'full' })

    expect(page[0]).not.toBeInstanceOf(Entry)
    expect(page[0]).toHaveProperty('collections.0.entryMetadata.role', 'item')
  })

  it('sends no expand without the option', async () => {
    fetch.mockResolvedValueOnce({ data: [listItem] })

    await entries.list({ collection: 'projects' })

    expect(fetch).toHaveBeenCalledWith('/api/publish/ws/entries?collection=projects')
  })
})
