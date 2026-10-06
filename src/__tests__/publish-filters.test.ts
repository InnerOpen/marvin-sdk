/**
 * Publishing reads added in SDK 4.3: the `tag`, `slug` and `updatedSince` entry filters, and
 * `assets.download` (a binary read of the asset file route). Real client, stubbed fetch.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { MarvinHttpClient } from '../client/http'
import { EntriesModule } from '../entries/entries'
import { AssetsModule } from '../assets/assets'

describe('publishing', () => {
  let fetchMock: ReturnType<typeof vi.fn>
  let http: MarvinHttpClient

  beforeEach(() => {
    fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    http = new MarvinHttpClient({ apiUrl: 'https://api.example.test', siteClientToken: 'test-token' } as any)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('entries.list sends tag, slug and updated_since', async () => {
    fetchMock.mockResolvedValueOnce(new Response('{"data":[]}', { status: 200, headers: { 'content-type': 'application/json' } }))
    await new EntriesModule(http, 'acme').list({
      tag: ['news', 'events'],
      slug: 'hello',
      updatedSince: new Date('2026-10-01T00:00:00Z'),
    })
    const url = new URL(fetchMock.mock.calls[0]![0] as string)
    expect(url.pathname).toBe('/api/publish/acme/entries')
    expect(url.searchParams.get('tag')).toBe('news,events')
    expect(url.searchParams.get('slug')).toBe('hello')
    expect(url.searchParams.get('updated_since')).toBe('2026-10-01T00:00:00.000Z')
  })

  it('entries.list leaves the new filters out when unset', async () => {
    fetchMock.mockResolvedValueOnce(new Response('{"data":[]}', { status: 200, headers: { 'content-type': 'application/json' } }))
    await new EntriesModule(http, 'acme').list({ tag: [] })
    expect(fetchMock.mock.calls[0]![0]).toBe('https://api.example.test/api/publish/acme/entries')
  })

  it('assets.download returns the bytes and content type', async () => {
    fetchMock.mockResolvedValueOnce(new Response(new Uint8Array([137, 80, 78, 71]), { status: 200, headers: { 'content-type': 'image/png' } }))
    const file = await new AssetsModule(http, 'acme').download('logo')
    expect(fetchMock.mock.calls[0]![0]).toBe('https://api.example.test/api/publish/acme/assets/logo/file')
    expect(file.contentType).toBe('image/png')
    expect(Array.from(file.data)).toEqual([137, 80, 78, 71])
  })
})
