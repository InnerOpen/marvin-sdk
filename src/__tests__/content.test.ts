/**
 * Content module tests
 *
 * Tests the content API modules (entries, collections, assets, resources, forms)
 * by mocking HttpClient and verifying correct URLs, HTTP methods, and parameters.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { EntriesModule } from '../platform/entries'
import { CollectionsModule } from '../platform/collections'
import { AssetsModule } from '../platform/assets'
import { ResourcesModule } from '../platform/resources'
import { FormsModule } from '../platform/forms'

function createMockHttp() {
  return {
    get: vi.fn().mockResolvedValue({}),
    post: vi.fn().mockResolvedValue({}),
    put: vi.fn().mockResolvedValue({}),
    patch: vi.fn().mockResolvedValue({}),
    delete: vi.fn().mockResolvedValue(undefined),
    request: vi.fn().mockResolvedValue({}),
    validatePathParam: vi.fn((v: string) => v),
  }
}

// ---------------------------------------------------------------------------
// EntriesModule
// ---------------------------------------------------------------------------

describe('EntriesModule', () => {
  let http: ReturnType<typeof createMockHttp>
  let module: EntriesModule

  beforeEach(() => {
    http = createMockHttp()
    module = new EntriesModule(http as any)
  })

  it('list calls GET /api/platform/entries', async () => {
    http.get.mockResolvedValueOnce([])
    const result = await module.list()
    expect(http.get).toHaveBeenCalledWith('/api/platform/entries')
    expect(result).toEqual([])
  })

  it('get calls GET /api/platform/entries/:id', async () => {
    http.get.mockResolvedValueOnce({ id: 'entry-1', slug: 'hello-world' })
    const result = await module.get('entry-1')
    expect(http.validatePathParam).toHaveBeenCalledWith('entry-1', 'entry ID')
    expect(http.get).toHaveBeenCalledWith('/api/platform/entries/entry-1')
    expect((result as any).id).toBe('entry-1')
  })

  it('create posts to /api/platform/entries with data', async () => {
    const data = { slug: 'new-entry', entry_type_id: 'et-1', title: 'New Entry' }
    http.post.mockResolvedValueOnce({ id: 'entry-2', ...data })
    const result = await module.create(data as any)
    expect(http.post).toHaveBeenCalledWith('/api/platform/entries', data)
    expect((result as any).id).toBe('entry-2')
  })

  it('update calls PATCH /api/platform/entries/:id with data', async () => {
    const data = { title: 'Updated Title' }
    http.patch.mockResolvedValueOnce({ id: 'entry-1', ...data })
    await module.update('entry-1', data as any)
    expect(http.validatePathParam).toHaveBeenCalledWith('entry-1', 'entry ID')
    expect(http.patch).toHaveBeenCalledWith('/api/platform/entries/entry-1', data)
  })

  it('delete calls DELETE /api/platform/entries/:id', async () => {
    await module.delete('entry-1')
    expect(http.validatePathParam).toHaveBeenCalledWith('entry-1', 'entry ID')
    expect(http.delete).toHaveBeenCalledWith('/api/platform/entries/entry-1')
  })
})

// ---------------------------------------------------------------------------
// CollectionsModule
// ---------------------------------------------------------------------------

describe('CollectionsModule', () => {
  let http: ReturnType<typeof createMockHttp>
  let module: CollectionsModule

  beforeEach(() => {
    http = createMockHttp()
    module = new CollectionsModule(http as any)
  })

  it('list calls GET /api/platform/collections', async () => {
    http.get.mockResolvedValueOnce([{ id: 'col-1', slug: 'blog' }])
    const result = await module.list()
    expect(http.get).toHaveBeenCalledWith('/api/platform/collections')
    expect(result).toHaveLength(1)
  })

  it('get calls GET /api/platform/collections/:id', async () => {
    http.get.mockResolvedValueOnce({ id: 'col-1', slug: 'blog' })
    await module.get('col-1')
    expect(http.validatePathParam).toHaveBeenCalledWith('col-1', 'id')
    expect(http.get).toHaveBeenCalledWith('/api/platform/collections/col-1')
  })

  it('getEntries calls GET /api/platform/collections/:id/entries', async () => {
    http.get.mockResolvedValueOnce([{ id: 'entry-1' }])
    const result = await module.getEntries('col-1')
    expect(http.validatePathParam).toHaveBeenCalledWith('col-1', 'collection ID')
    expect(http.get).toHaveBeenCalledWith('/api/platform/collections/col-1/entries')
    expect(result).toHaveLength(1)
  })

  it('getEntry calls GET /api/platform/collections/:colId/entries/:entryId', async () => {
    http.get.mockResolvedValueOnce({ id: 'entry-1' })
    await module.getEntry('col-1', 'entry-1')
    expect(http.validatePathParam).toHaveBeenCalledWith('col-1', 'collection ID')
    expect(http.validatePathParam).toHaveBeenCalledWith('entry-1', 'entry ID')
    expect(http.get).toHaveBeenCalledWith('/api/platform/collections/col-1/entries/entry-1')
  })

  it('create posts to /api/platform/collections with data', async () => {
    const data = { slug: 'new-col', name: 'New Collection', entry_type_id: 'et-1' }
    await module.create(data as any)
    expect(http.post).toHaveBeenCalledWith('/api/platform/collections', data)
  })
})

// ---------------------------------------------------------------------------
// AssetsModule
// ---------------------------------------------------------------------------

describe('AssetsModule', () => {
  let http: ReturnType<typeof createMockHttp>
  let module: AssetsModule

  beforeEach(() => {
    http = createMockHttp()
    module = new AssetsModule(http as any)
  })

  it('list calls GET /api/platform/assets', async () => {
    http.get.mockResolvedValueOnce([{ id: 'asset-1', slug: 'logo' }])
    const result = await module.list()
    expect(http.get).toHaveBeenCalledWith('/api/platform/assets')
    expect(result).toHaveLength(1)
  })

  it('get calls GET /api/platform/assets/:id', async () => {
    http.get.mockResolvedValueOnce({ id: 'asset-1', slug: 'logo' })
    const result = await module.get('asset-1')
    expect(http.validatePathParam).toHaveBeenCalledWith('asset-1', 'id')
    expect(http.get).toHaveBeenCalledWith('/api/platform/assets/asset-1')
    expect((result as any).id).toBe('asset-1')
  })

  it('getFile calls GET /api/platform/assets/:id/file', async () => {
    await module.getFile('asset-1')
    expect(http.validatePathParam).toHaveBeenCalledWith('asset-1', 'asset ID')
    expect(http.get).toHaveBeenCalledWith('/api/platform/assets/asset-1/file')
  })

  it('delete calls DELETE /api/platform/assets/:id', async () => {
    await module.delete('asset-1')
    expect(http.validatePathParam).toHaveBeenCalledWith('asset-1', 'asset ID')
    expect(http.delete).toHaveBeenCalledWith('/api/platform/assets/asset-1')
  })

  it('update calls PATCH /api/platform/assets/:id with data', async () => {
    const data = { name: 'Updated Logo', alt_text: 'Company logo' }
    await module.update('asset-1', data as any)
    expect(http.validatePathParam).toHaveBeenCalledWith('asset-1', 'id')
    expect(http.patch).toHaveBeenCalledWith('/api/platform/assets/asset-1', data)
  })
})

// ---------------------------------------------------------------------------
// ResourcesModule
// ---------------------------------------------------------------------------

describe('ResourcesModule', () => {
  let http: ReturnType<typeof createMockHttp>
  let module: ResourcesModule

  beforeEach(() => {
    http = createMockHttp()
    module = new ResourcesModule(http as any)
  })

  it('list calls GET /api/platform/resources', async () => {
    http.get.mockResolvedValueOnce([{ id: 'res-1', slug: 'authors' }])
    const result = await module.list()
    expect(http.get).toHaveBeenCalledWith('/api/platform/resources')
    expect(result).toHaveLength(1)
  })

  it('get calls GET /api/platform/resources/:id', async () => {
    http.get.mockResolvedValueOnce({ id: 'res-1', slug: 'authors' })
    await module.get('res-1')
    expect(http.validatePathParam).toHaveBeenCalledWith('res-1', 'id')
    expect(http.get).toHaveBeenCalledWith('/api/platform/resources/res-1')
  })

  it('create posts to /api/platform/resources with data', async () => {
    const data = { slug: 'authors', name: 'Authors', entry_type_id: 'et-1' }
    await module.create(data as any)
    expect(http.post).toHaveBeenCalledWith('/api/platform/resources', data)
  })
})

// ---------------------------------------------------------------------------
// FormsModule
// ---------------------------------------------------------------------------

describe('FormsModule', () => {
  let http: ReturnType<typeof createMockHttp>
  let module: FormsModule

  beforeEach(() => {
    http = createMockHttp()
    module = new FormsModule(http as any)
  })

  it('list calls GET /api/platform/forms', async () => {
    http.get.mockResolvedValueOnce([])
    const result = await module.list()
    expect(http.get).toHaveBeenCalledWith('/api/platform/forms')
    expect(result).toEqual([])
  })

  it('getPublishedForm includes workspace slug in URL', async () => {
    http.get.mockResolvedValueOnce({ id: 'form-1', slug: 'contact' })
    await module.getPublishedForm('my-workspace', 'contact')
    // workspace slug must be in the URL
    expect(http.validatePathParam).toHaveBeenCalledWith('my-workspace', 'workspace slug')
    expect(http.validatePathParam).toHaveBeenCalledWith('contact', 'form slug')
    const calledUrl: string = http.get.mock.calls[0]![0]
    expect(calledUrl).toContain('my-workspace')
    expect(calledUrl).toBe('/api/publish/my-workspace/forms/contact')
  })

  it('submitForm includes workspace slug in URL and posts data', async () => {
    const formData = { name: 'John', email: 'john@example.com' }
    http.post.mockResolvedValueOnce({ id: 'sub-1', data_json: formData })
    await module.submitForm('my-workspace', 'contact', formData)
    expect(http.validatePathParam).toHaveBeenCalledWith('my-workspace', 'workspace slug')
    expect(http.validatePathParam).toHaveBeenCalledWith('contact', 'form slug')
    const calledUrl: string = http.post.mock.calls[0]![0]
    expect(calledUrl).toContain('my-workspace')
    expect(calledUrl).toBe('/api/publish/my-workspace/forms/contact/submit')
    expect(http.post).toHaveBeenCalledWith(
      '/api/publish/my-workspace/forms/contact/submit',
      { dataJson: formData }
    )
  })

  it('get calls GET /api/platform/forms/:id', async () => {
    await module.get('form-1')
    expect(http.validatePathParam).toHaveBeenCalledWith('form-1', 'id')
    expect(http.get).toHaveBeenCalledWith('/api/platform/forms/form-1')
  })

  it('create posts to /api/platform/forms with data', async () => {
    const data = { slug: 'contact', name: 'Contact Form' }
    await module.create(data as any)
    expect(http.post).toHaveBeenCalledWith('/api/platform/forms', data)
  })
})
