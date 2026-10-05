/**
 * HttpClient response handling and retry policy, against a stubbed fetch.
 *
 * Some core DELETE routes answer 204 with `content-type: application/json` and no body. Parsing that
 * threw, the error was taken for a network failure and the DELETE was retried — the retry got a 404,
 * so a delete that worked was reported as "Resource not found". Now an empty body is `undefined`,
 * invalid JSON is an API error, and only a request that got no response is retried (idempotent
 * methods only).
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { HttpClient, NoAuth, MarvinApiError, MarvinNetworkError, MarvinServerError } from '../core'

const JSON_TYPE = { 'content-type': 'application/json' }
let fetchMock: ReturnType<typeof vi.fn>

function client(maxRetries = 2) {
  return new HttpClient({ baseUrl: 'https://api.example.test', auth: new NoAuth(), retry: { maxRetries, initialDelay: 0, maxDelay: 0 } })
}

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

  it.each([408, 429, 502, 503])('does not retry once the server answered %i', async (status) => {
    fetchMock.mockResolvedValue(new Response('busy', { status }))
    await expect(client().get('/x')).rejects.toBeInstanceOf(status >= 500 ? MarvinServerError : MarvinApiError)
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
