/**
 * IntegrationsModule (rc.197 error handling, options, alert routing, logos) and SiteModule (rebuild).
 *
 * Mocks HttpClient and checks URLs, methods and bodies; the logo URL helper runs on a real client,
 * since it builds a URL without a request.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { HttpClient, NoAuth, MarvinValidationError } from '../core'
import { IntegrationsModule } from '../platform/integrations'
import { SiteModule } from '../platform/site'
import { PlatformClient } from '../platform/client'

function createMockHttp() {
  return {
    get: vi.fn().mockResolvedValue({}),
    post: vi.fn().mockResolvedValue({}),
    put: vi.fn().mockResolvedValue({}),
    patch: vi.fn().mockResolvedValue({}),
    delete: vi.fn().mockResolvedValue(undefined),
    validatePathParam: vi.fn((v: string) => v),
    buildUrl: vi.fn((p: string) => `https://api.example.test${p}`),
  }
}

const ID = '7f2c1d3e-0000-4000-8000-000000000001'

describe('IntegrationsModule', () => {
  let http: ReturnType<typeof createMockHttp>
  let module: IntegrationsModule

  beforeEach(() => {
    http = createMockHttp()
    module = new IntegrationsModule(http as any)
  })

  it('listOptions posts the action and input to /{id}/options', async () => {
    http.post.mockResolvedValueOnce([{ value: 'C1', label: '#general' }])
    const options = await module.listOptions(ID, 'post_message', 'channel')
    expect(http.post).toHaveBeenCalledWith(`/api/groups/integrations/${ID}/options`, { actionKey: 'post_message', input: 'channel' })
    expect(options).toEqual([{ value: 'C1', label: '#general' }])
  })

  it('resolveAttention without an alert resolves every open alert', async () => {
    http.post.mockResolvedValueOnce({ resolved: 3 })
    expect(await module.resolveAttention(ID)).toEqual({ resolved: 3 })
    expect(http.post).toHaveBeenCalledWith(`/api/groups/integrations/${ID}/resolve`, {})
  })

  it('resolveAttention with an alert id passes it as alert_id', async () => {
    await module.resolveAttention(ID, 'alert-9')
    expect(http.post).toHaveBeenCalledWith(`/api/groups/integrations/${ID}/resolve?alert_id=alert-9`, {})
    expect(http.validatePathParam).toHaveBeenCalledWith('alert-9', 'alert ID')
  })

  it('setErrorOverrides PUTs the overrides map', async () => {
    const overrides = { rate_limited: { review: false }, '*': { notify: false } }
    await module.setErrorOverrides(ID, overrides)
    expect(http.put).toHaveBeenCalledWith(`/api/groups/integrations/${ID}/error-overrides`, { overrides })
  })

  it('setErrorOverrides with {} resets to the provider defaults', async () => {
    await module.setErrorOverrides(ID, {})
    expect(http.put).toHaveBeenCalledWith(`/api/groups/integrations/${ID}/error-overrides`, { overrides: {} })
  })

  it('getAlertRouting GETs /alert-routing', async () => {
    await module.getAlertRouting()
    expect(http.get).toHaveBeenCalledWith('/api/groups/integrations/alert-routing')
  })

  it('setAlertRouting PUTs the routing as given', async () => {
    const body = { emailAdmins: true, integrationIds: [ID], reminderHours: 0 }
    await module.setAlertRouting(body)
    expect(http.put).toHaveBeenCalledWith('/api/groups/integrations/alert-routing', body)
  })

  it('listPlugins (workspace admin) GETs /plugins', async () => {
    await module.listPlugins()
    expect(http.get).toHaveBeenCalledWith('/api/groups/integrations/plugins')
  })

  it('validates the integration id on every per-connection call', async () => {
    await module.listOptions(ID, 'a', 'b')
    await module.resolveAttention(ID)
    await module.setErrorOverrides(ID, {})
    expect(http.validatePathParam).toHaveBeenCalledTimes(3)
    expect(http.validatePathParam).toHaveBeenCalledWith(ID, 'integration ID')
  })
})

describe('IntegrationsModule.providerLogoUrl', () => {
  const real = (baseUrl: string) => new IntegrationsModule(new HttpClient({ baseUrl, auth: new NoAuth() }))

  it('builds the public logo URL on the client base URL without a request', () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch')
    expect(real('https://api.example.test/').providerLogoUrl('cloudflare_pages')).toBe(
      'https://api.example.test/api/groups/integrations/providers/cloudflare_pages/logo',
    )
    expect(fetchSpy).not.toHaveBeenCalled()
    fetchSpy.mockRestore()
  })

  it('encodes the slug', () => {
    expect(real('https://api.example.test').providerLogoUrl('a b')).toBe('https://api.example.test/api/groups/integrations/providers/a%20b/logo')
  })

  it('rejects a slug that would leave the logo path', () => {
    expect(() => real('https://api.example.test').providerLogoUrl('../admin')).toThrow(MarvinValidationError)
    expect(() => real('https://api.example.test').providerLogoUrl('')).toThrow(MarvinValidationError)
  })
})

describe('SiteModule', () => {
  let http: ReturnType<typeof createMockHttp>
  let module: SiteModule

  beforeEach(() => {
    http = createMockHttp()
    module = new SiteModule(http as any)
  })

  it('requestRebuild without a reason posts an empty body', async () => {
    await module.requestRebuild()
    expect(http.post).toHaveBeenCalledWith('/api/platform/site/rebuild', {})
  })

  it('requestRebuild with a reason posts it', async () => {
    const queued = { requested: true, queuedAt: '2026-10-05T12:00:00Z', requestCount: 1, reason: 'menu', target: null, targets: [] }
    http.post.mockResolvedValueOnce(queued)
    expect(await module.requestRebuild('menu')).toEqual(queued)
    expect(http.post).toHaveBeenCalledWith('/api/platform/site/rebuild', { reason: 'menu' })
  })

  it('requestRebuild keeps an empty reason (the server falls back to who asked)', async () => {
    await module.requestRebuild('')
    expect(http.post).toHaveBeenCalledWith('/api/platform/site/rebuild', { reason: '' })
  })

  it('rebuildStatus GETs the same path', async () => {
    await module.rebuildStatus()
    expect(http.get).toHaveBeenCalledWith('/api/platform/site/rebuild')
  })

  it('is wired on the platform client as `site`', () => {
    const platform = new PlatformClient({ apiUrl: 'https://api.example.test' })
    expect(platform.site).toBeInstanceOf(SiteModule)
  })
})
