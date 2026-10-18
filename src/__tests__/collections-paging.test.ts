/**
 * collections.list() paging: `limit` and `offset` go to the publishing endpoint as query params
 * (the server returns 20 by default, at most 100). Real client, stubbed fetch.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { MarvinHttpClient } from '../client/http'
import { CollectionsModule } from '../collections/collections'

const ok = (body: unknown) =>
  new Response(JSON.stringify(body), { status: 200, headers: { 'content-type': 'application/json' } })

describe('collections.list paging', () => {
  let fetchMock: ReturnType<typeof vi.fn>
  let collections: CollectionsModule

  beforeEach(() => {
    fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    const http = new MarvinHttpClient({ apiUrl: 'https://api.example.test', siteClientToken: 'test-token' } as any)
    collections = new CollectionsModule(http, 'acme')
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('sends limit and offset', async () => {
    fetchMock.mockResolvedValueOnce(ok({ data: [{ slug: 'a' }] }))
    const result = await collections.list({ limit: 50, offset: 100 })
    const url = new URL(fetchMock.mock.calls[0]![0] as string)
    expect(url.pathname).toBe('/api/publish/acme/collections')
    expect(url.searchParams.get('limit')).toBe('50')
    expect(url.searchParams.get('offset')).toBe('100')
    expect(result).toEqual([{ slug: 'a' }])
  })

  it('sends offset 0 and leaves unset options out', async () => {
    fetchMock.mockResolvedValueOnce(ok({ data: [] }))
    await collections.list({ offset: 0 })
    expect(new URL(fetchMock.mock.calls[0]![0] as string).search).toBe('?offset=0')

    fetchMock.mockResolvedValueOnce(ok({ data: [] }))
    await collections.list()
    expect(fetchMock.mock.calls[1]![0]).toBe('https://api.example.test/api/publish/acme/collections')
  })
})
