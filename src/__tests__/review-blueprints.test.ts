/**
 * SDK 4.3 platform methods: the review queue (entry counts, AI suggestions, suggested assets), the
 * dashboard, blueprints, incoming-webhook signature schemes, smart-collection preview/members.
 *
 * Most modules run against a mocked HttpClient (URLs, methods, bodies); blueprints run on a real
 * client with a stubbed fetch, to check their query strings and bodies.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { HttpClient, NoAuth } from '../core'
import { EntriesModule } from '../platform/entries'
import { AssetsModule } from '../platform/assets'
import { ResourcesModule } from '../platform/resources'
import { WorkspacesModule } from '../platform/workspaces'
import { CollectionsModule } from '../platform/collections'
import { IncomingWebhooksModule } from '../platform/incomingWebhooks'
import { BlueprintsModule } from '../platform/blueprints'
import { PlatformClient } from '../platform/client'

function createMockHttp() {
  return {
    get: vi.fn().mockResolvedValue({}),
    post: vi.fn().mockResolvedValue({}),
    put: vi.fn().mockResolvedValue({}),
    patch: vi.fn().mockResolvedValue({}),
    delete: vi.fn().mockResolvedValue(undefined),
    validatePathParam: vi.fn((v: string) => v),
  }
}

const ENTRY = '7f2c1d3e-0000-4000-8000-000000000001'
const ASSET = '7f2c1d3e-0000-4000-8000-000000000002'
const COLLECTION = '7f2c1d3e-0000-4000-8000-000000000003'

describe('review queue', () => {
  let http: ReturnType<typeof createMockHttp>

  beforeEach(() => {
    http = createMockHttp()
  })

  it('entries.counts reads /entries/counts', async () => {
    http.get.mockResolvedValueOnce({ inbox: 2, draft: 1, total: 3 })
    expect(await new EntriesModule(http as any).counts()).toEqual({ inbox: 2, draft: 1, total: 3 })
    expect(http.get).toHaveBeenCalledWith('/api/platform/entries/counts')
  })

  it.each([
    ['applySuggestion', 'apply-suggestion'],
    ['rejectSuggestion', 'reject-suggestion'],
  ] as const)('entries.%s posts to /{id}/%s', async (method, path) => {
    await new EntriesModule(http as any)[method](ENTRY)
    expect(http.post).toHaveBeenCalledWith(`/api/platform/entries/${ENTRY}/${path}`, {})
  })

  it.each([
    ['approveSuggestedAsset', 'approve'],
    ['rejectSuggestedAsset', 'reject'],
  ] as const)('entries.%s posts to /suggested-assets/{asset}/%s', async (method, verb) => {
    await new EntriesModule(http as any)[method](ENTRY, ASSET)
    expect(http.post).toHaveBeenCalledWith(`/api/platform/entries/${ENTRY}/suggested-assets/${ASSET}/${verb}`, {})
    expect(http.validatePathParam).toHaveBeenCalledWith(ASSET, 'asset ID')
  })

  it.each([
    ['assets', AssetsModule],
    ['resources', ResourcesModule],
  ] as const)('%s apply/reject suggestions', async (kind, Module) => {
    const module = new Module(http as any)
    await module.applySuggestion(ASSET)
    expect(http.post).toHaveBeenLastCalledWith(`/api/platform/${kind}/${ASSET}/apply-suggestion`, {})
    await module.rejectSuggestion(ASSET)
    expect(http.post).toHaveBeenLastCalledWith(`/api/platform/${kind}/${ASSET}/reject-suggestion`, {})
  })

  it('workspaces.getDashboard reads /stats/dashboard', async () => {
    const dashboard = { recentActivity: [], attention: { inbox: 1, drafts: 0, needsReview: 2, aiSuggestions: 3, failures: 0 } }
    http.get.mockResolvedValueOnce(dashboard)
    expect(await new WorkspacesModule(http as any).getDashboard()).toEqual(dashboard)
    expect(http.get).toHaveBeenCalledWith('/api/platform/stats/dashboard')
  })
})

describe('smart collections', () => {
  it('preview posts the unsaved rules', async () => {
    const http = createMockHttp()
    http.post.mockResolvedValueOnce({ total: 4, items: [], ignoredKeys: [] })
    const request = { targetType: 'entry' as const, smartRules: { tags: ['news'] }, limit: 5 }
    expect(await new CollectionsModule(http as any).preview(request)).toMatchObject({ total: 4 })
    expect(http.post).toHaveBeenCalledWith('/api/platform/collections/preview', request)
  })

  it('members reads /{id}/members', async () => {
    const http = createMockHttp()
    http.get.mockResolvedValueOnce([{ id: ENTRY, label: 'Hello', slug: 'hello', type: 'entry' }])
    expect(await new CollectionsModule(http as any).members(COLLECTION)).toHaveLength(1)
    expect(http.get).toHaveBeenCalledWith(`/api/platform/collections/${COLLECTION}/members`)
  })
})

describe('incoming webhooks', () => {
  it('signatureSchemes reads /signature-schemes', async () => {
    const http = createMockHttp()
    http.get.mockResolvedValueOnce([{ name: 'github', notes: '', source: 'core' }])
    expect(await new IncomingWebhooksModule(http as any).signatureSchemes()).toEqual([{ name: 'github', notes: '', source: 'core' }])
    expect(http.get).toHaveBeenCalledWith('/api/incoming-webhooks/signature-schemes')
  })
})

describe('BlueprintsModule', () => {
  let fetchMock: ReturnType<typeof vi.fn>
  let blueprints: BlueprintsModule

  const json = (body: unknown) => new Response(JSON.stringify(body), { status: 200, headers: { 'content-type': 'application/json' } })
  const call = (n = 0) => {
    const [url, init] = fetchMock.mock.calls[n] as [string, RequestInit]
    return { url, method: init.method, body: init.body === undefined ? undefined : JSON.parse(init.body as string) }
  }

  beforeEach(() => {
    fetchMock = vi.fn().mockImplementation(() => Promise.resolve(json([])))
    vi.stubGlobal('fetch', fetchMock)
    blueprints = new BlueprintsModule(new HttpClient({ baseUrl: 'https://api.example.test', auth: new NoAuth() }))
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('list passes the filters as query parameters', async () => {
    await blueprints.list({ kind: 'collection', category: 'Shop', source: 'square', integrationId: 'i-1' })
    expect(call().url).toBe('https://api.example.test/api/groups/blueprints?kind=collection&category=Shop&source=square&integration_id=i-1')
  })

  it('list without filters sends no query', async () => {
    await blueprints.list()
    expect(call().url).toBe('https://api.example.test/api/groups/blueprints')
  })

  it('categories and get', async () => {
    await blueprints.categories()
    expect(call(0).url).toBe('https://api.example.test/api/groups/blueprints/categories')
    await blueprints.get('blog', { source: 'core' })
    expect(call(1).url).toBe('https://api.example.test/api/groups/blueprints/blog?source=core')
  })

  it('apply posts the params as the body', async () => {
    fetchMock.mockResolvedValueOnce(json({ slug: 'tag-posts', kind: 'workflow', created: true }))
    const result = await blueprints.apply('tag-posts', { entry_type: 'post' }, { integrationId: 'i-1' })
    expect(result.created).toBe(true)
    expect(call()).toEqual({
      url: 'https://api.example.test/api/groups/blueprints/tag-posts/apply?integration_id=i-1',
      method: 'POST',
      body: { entry_type: 'post' },
    })
  })

  it('apply without params sends no body', async () => {
    await blueprints.apply('blog')
    expect(call()).toEqual({ url: 'https://api.example.test/api/groups/blueprints/blog/apply', method: 'POST', body: undefined })
  })

  it('applyMany posts the slugs and the per-slug params', async () => {
    await blueprints.applyMany(['post', 'blog'], { blog: { entry_type: 'post' } }, { source: 'core' })
    expect(call()).toEqual({
      url: 'https://api.example.test/api/groups/blueprints/apply?source=core',
      method: 'POST',
      body: { slugs: ['post', 'blog'], params: { blog: { entry_type: 'post' } } },
    })
  })

  it('applyMany without params sends only the slugs', async () => {
    await blueprints.applyMany(['post'])
    expect(call().body).toEqual({ slugs: ['post'] })
  })

  it('update posts to /{slug}/update', async () => {
    await blueprints.update('tag-posts')
    expect(call()).toMatchObject({ url: 'https://api.example.test/api/groups/blueprints/tag-posts/update', method: 'POST' })
  })

  it('is on the platform client', () => {
    const client = new PlatformClient({ apiUrl: 'https://api.example.test', userToken: 'test-token' })
    expect(client.blueprints).toBeInstanceOf(BlueprintsModule)
  })
})
