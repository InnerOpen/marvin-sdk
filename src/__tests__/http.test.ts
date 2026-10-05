/**
 * HttpClient response handling and retry policy, against a stubbed fetch.
 *
 * Some core DELETE routes answer 204 with `content-type: application/json` and no body. Parsing that
 * threw, the error was taken for a network failure and the DELETE was retried — the retry got a 404,
 * so a delete that worked was reported as "Resource not found". Now an empty body is `undefined`,
 * invalid JSON is an API error, a request that got no response is retried only for idempotent
 * methods, and a retryable status (429/502/503/504) is retried only for safe reads (GET/HEAD/OPTIONS).
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { HttpClient, NoAuth, MarvinApiError, MarvinNetworkError, MarvinServerError } from '../core'

const JSON_TYPE = { 'content-type': 'application/json' }
let fetchMock: ReturnType<typeof vi.fn>

function client(maxRetries = 2, retry: { initialDelay?: number; maxDelay?: number; retryableStatuses?: number[] } = {}) {
  return new HttpClient({
    baseUrl: 'https://api.example.test',
    auth: new NoAuth(),
    retry: { maxRetries, initialDelay: 0, maxDelay: 0, ...retry },
  })
}

const ok = () => new Response('{"ok":true}', { status: 200, headers: JSON_TYPE })

/** The error a call rejects with (fails the test if it resolves). */
async function failure(call: Promise<unknown>): Promise<any> {
  try {
    await call
  } catch (error) {
    return error
  }
  throw new Error('expected the call to fail')
}

function networkError() {
  return new TypeError('fetch failed')
}

function timeoutError() {
  return Object.assign(new Error('This operation was aborted'), { name: 'AbortError' })
}

beforeEach(() => {
  fetchMock = vi.fn()
  vi.stubGlobal('fetch', fetchMock)
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('HttpClient response bodies', () => {
  it('a 204 with a JSON content type and no body is undefined, sent once', async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 204, headers: JSON_TYPE }))
    await expect(client().delete('/api/automations/a1')).resolves.toBeUndefined()
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('an empty 200 with a JSON content type is undefined', async () => {
    fetchMock.mockResolvedValueOnce(new Response('', { status: 200, headers: JSON_TYPE }))
    await expect(client().delete('/api/groups/secrets/s1')).resolves.toBeUndefined()
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('a whitespace-only JSON body is undefined', async () => {
    fetchMock.mockResolvedValueOnce(new Response('  \n', { status: 200, headers: JSON_TYPE }))
    await expect(client().get('/x')).resolves.toBeUndefined()
  })

  it('content-length: 0 is undefined without reading the body', async () => {
    const response = new Response('', { status: 200, headers: { ...JSON_TYPE, 'content-length': '0' } })
    const text = vi.spyOn(response, 'text')
    fetchMock.mockResolvedValueOnce(response)
    await expect(client().get('/x')).resolves.toBeUndefined()
    expect(text).not.toHaveBeenCalled()
  })

  it('a JSON body is parsed', async () => {
    fetchMock.mockResolvedValueOnce(new Response('{"id":"e1"}', { status: 200, headers: JSON_TYPE }))
    await expect(client().get('/x')).resolves.toEqual({ id: 'e1' })
  })

  it('invalid JSON in a 200 is a clear API error, not a network error, and is not retried', async () => {
    fetchMock.mockResolvedValue(new Response('{"id": ', { status: 200, headers: JSON_TYPE }))
    const error = await failure(client().get('/api/platform/entries'))
    expect(error).toBeInstanceOf(MarvinApiError)
    expect(error).not.toBeInstanceOf(MarvinNetworkError)
    expect(error.message).toMatch(/^Invalid JSON in the 200 response to GET \/api\/platform\/entries/)
    expect(error.statusCode).toBe(200)
    expect(error.responseBody).toBe('{"id": ')
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
})

describe('HttpClient retry policy', () => {
  it('retries a GET after a network error', async () => {
    fetchMock.mockRejectedValueOnce(networkError()).mockResolvedValueOnce(new Response('{"ok":true}', { status: 200, headers: JSON_TYPE }))
    await expect(client().get('/x')).resolves.toEqual({ ok: true })
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('retries a DELETE up to maxRetries, then reports the network error', async () => {
    fetchMock.mockRejectedValue(networkError())
    const error = await failure(client(2).delete('/x'))
    expect(error).toBeInstanceOf(MarvinNetworkError)
    expect(error.message).toBe('Network error: fetch failed')
    expect(fetchMock).toHaveBeenCalledTimes(3)
  })

  it('retries a GET after a timeout', async () => {
    fetchMock.mockRejectedValueOnce(timeoutError()).mockResolvedValueOnce(new Response(null, { status: 204 }))
    await expect(client().get('/x')).resolves.toBeUndefined()
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it.each(['POST', 'PATCH'])('never retries a %s after a network error', async (method) => {
    fetchMock.mockRejectedValue(networkError())
    const error = await failure(client().request(method, '/x', { body: { a: 1 } }))
    expect(error).toBeInstanceOf(MarvinNetworkError)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('never retries a POST after a timeout', async () => {
    fetchMock.mockRejectedValue(timeoutError())
    const error = await failure(client().post('/x', {}))
    expect(error).toBeInstanceOf(MarvinNetworkError)
    expect(error.message).toBe('Request timeout after 30000ms')
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('a GET answered 503 is retried and then succeeds', async () => {
    fetchMock.mockResolvedValueOnce(new Response('busy', { status: 503 })).mockResolvedValueOnce(ok())
    await expect(client().get('/x')).resolves.toEqual({ ok: true })
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it.each([429, 502, 504])('HEAD and OPTIONS are retried on %i too', async (status) => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status })).mockResolvedValueOnce(new Response(null, { status: 200 }))
    await client().request('HEAD', '/x')
    fetchMock.mockResolvedValueOnce(new Response(null, { status })).mockResolvedValueOnce(new Response(null, { status: 200 }))
    await client().request('OPTIONS', '/x')
    expect(fetchMock).toHaveBeenCalledTimes(4)
  })

  it('a GET stops after maxRetries and throws the last status', async () => {
    fetchMock.mockImplementation(async () => new Response('busy', { status: 503 }))
    await expect(client(2).get('/x')).rejects.toBeInstanceOf(MarvinServerError)
    expect(fetchMock).toHaveBeenCalledTimes(3)
  })

  it.each([408, 500])('a GET answered %i is not retried (not a retryable status by default)', async (status) => {
    fetchMock.mockResolvedValue(new Response('no', { status }))
    await expect(client().get('/x')).rejects.toBeInstanceOf(status >= 500 ? MarvinServerError : MarvinApiError)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('retryableStatuses is honoured for reads', async () => {
    fetchMock.mockResolvedValueOnce(new Response('no', { status: 500 })).mockResolvedValueOnce(ok())
    await expect(client(2, { retryableStatuses: [500] }).get('/x')).resolves.toEqual({ ok: true })
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it.each([
    ['DELETE', 502],
    ['PUT', 503],
    ['POST', 503],
    ['PATCH', 429],
  ])('a %s answered %i is not retried', async (method, status) => {
    fetchMock.mockImplementation(async () => new Response('busy', { status }))
    await expect(client().request(method, '/x', { body: { a: 1 } })).rejects.toBeDefined()
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('a DELETE answered 204 is not sent again (the old false 404)', async () => {
    fetchMock
      .mockResolvedValueOnce(new Response(null, { status: 204, headers: JSON_TYPE }))
      .mockResolvedValueOnce(new Response('{"detail":"Not found"}', { status: 404, headers: JSON_TYPE }))
    await expect(client().delete('/api/groups/integrations/i1')).resolves.toBeUndefined()
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
})

describe('HttpClient Retry-After', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-10-05T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  /** Start a GET and report whether it has made its second fetch after `ms` of fake time. */
  async function retriedAfter(retryAfter: string, ms: number, initialDelay = 1000) {
    fetchMock
      .mockResolvedValueOnce(new Response('slow down', { status: 429, headers: { 'retry-after': retryAfter } }))
      .mockResolvedValueOnce(ok())
    const call = client(2, { initialDelay, maxDelay: 10000 }).get('/x')
    await vi.advanceTimersByTimeAsync(ms - 1)
    const early = fetchMock.mock.calls.length
    await vi.advanceTimersByTimeAsync(1)
    await expect(call).resolves.toEqual({ ok: true })
    return { early, total: fetchMock.mock.calls.length }
  }

  it('a GET answered 429 waits the Retry-After seconds', async () => {
    expect(await retriedAfter('5', 5000)).toEqual({ early: 1, total: 2 })
  })

  it('accepts Retry-After as an HTTP date', async () => {
    expect(await retriedAfter('Mon, 05 Oct 2026 12:00:03 GMT', 3000)).toEqual({ early: 1, total: 2 })
  })

  it('caps a long Retry-After at 60 s', async () => {
    expect(await retriedAfter('3600', 60000)).toEqual({ early: 1, total: 2 })
  })

  it('falls back to the backoff when Retry-After is unreadable', async () => {
    expect(await retriedAfter('soon', 1000)).toEqual({ early: 1, total: 2 })
  })
})
