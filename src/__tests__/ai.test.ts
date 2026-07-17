/**
 * AI module tests
 *
 * Tests the platform AI modules (settings, providers, models, operations,
 * executions) by mocking HttpClient and verifying URLs, verbs, and params.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AISettingsModule } from '../platform/ai/settings'
import { AIProvidersModule } from '../platform/ai/providers'
import { AIOperationsModule } from '../platform/ai/operations'
import { AIExecutionsModule } from '../platform/ai/executions'
import { AIModule } from '../platform/ai/ai'

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
// AISettingsModule
// ---------------------------------------------------------------------------

describe('AISettingsModule', () => {
  let http: ReturnType<typeof createMockHttp>
  let module: AISettingsModule

  beforeEach(() => {
    http = createMockHttp()
    module = new AISettingsModule(http as any)
  })

  it('get calls GET /api/groups/ai-settings', async () => {
    await module.get()
    expect(http.get).toHaveBeenCalledWith('/api/groups/ai-settings')
  })

  it('update calls PATCH /api/groups/ai-settings with data', async () => {
    const data = { enabled: false }
    await module.update(data)
    expect(http.patch).toHaveBeenCalledWith('/api/groups/ai-settings', data)
  })
})

// ---------------------------------------------------------------------------
// AIProvidersModule (+ nested models)
// ---------------------------------------------------------------------------

describe('AIProvidersModule', () => {
  let http: ReturnType<typeof createMockHttp>
  let module: AIProvidersModule

  beforeEach(() => {
    http = createMockHttp()
    module = new AIProvidersModule(http as any)
  })

  it('list calls GET /api/ai/providers', async () => {
    http.get.mockResolvedValueOnce([])
    const result = await module.list()
    expect(http.get).toHaveBeenCalledWith('/api/ai/providers')
    expect(result).toEqual([])
  })

  it('get validates id and calls GET /api/ai/providers/:id', async () => {
    await module.get('p-1')
    expect(http.validatePathParam).toHaveBeenCalledWith('p-1', 'provider ID')
    expect(http.get).toHaveBeenCalledWith('/api/ai/providers/p-1')
  })

  it('create posts to /api/ai/providers with data', async () => {
    const data = { name: 'OpenAI', slug: 'openai', providerType: 'openai' }
    await module.create(data as any)
    expect(http.post).toHaveBeenCalledWith('/api/ai/providers', data)
  })

  it('update calls PATCH /api/ai/providers/:id with data', async () => {
    const data = { enabled: false }
    await module.update('p-1', data)
    expect(http.patch).toHaveBeenCalledWith('/api/ai/providers/p-1', data)
  })

  it('delete calls DELETE /api/ai/providers/:id', async () => {
    await module.delete('p-1')
    expect(http.delete).toHaveBeenCalledWith('/api/ai/providers/p-1')
  })

  it('test posts to /api/ai/providers/:id/test', async () => {
    await module.test('p-1')
    expect(http.validatePathParam).toHaveBeenCalledWith('p-1', 'provider ID')
    expect(http.post).toHaveBeenCalledWith('/api/ai/providers/p-1/test')
  })

  // nested models
  it('models.list calls GET /api/ai/providers/:pid/models', async () => {
    http.get.mockResolvedValueOnce([])
    await module.models.list('p-1')
    expect(http.get).toHaveBeenCalledWith('/api/ai/providers/p-1/models')
  })

  it('models.create posts to /api/ai/providers/:pid/models', async () => {
    const data = { name: 'GPT-4o', modelId: 'gpt-4o' }
    await module.models.create('p-1', data as any)
    expect(http.post).toHaveBeenCalledWith('/api/ai/providers/p-1/models', data)
  })

  it('models.update calls PATCH /api/ai/providers/:pid/models/:mid', async () => {
    const data = { isDefault: true }
    await module.models.update('p-1', 'm-1', data)
    expect(http.validatePathParam).toHaveBeenCalledWith('m-1', 'model ID')
    expect(http.patch).toHaveBeenCalledWith('/api/ai/providers/p-1/models/m-1', data)
  })

  it('models.delete calls DELETE /api/ai/providers/:pid/models/:mid', async () => {
    await module.models.delete('p-1', 'm-1')
    expect(http.delete).toHaveBeenCalledWith('/api/ai/providers/p-1/models/m-1')
  })
})

// ---------------------------------------------------------------------------
// AIOperationsModule
// ---------------------------------------------------------------------------

describe('AIOperationsModule', () => {
  let http: ReturnType<typeof createMockHttp>
  let module: AIOperationsModule

  beforeEach(() => {
    http = createMockHttp()
    module = new AIOperationsModule(http as any)
  })

  it('list calls GET /api/ai/operations', async () => {
    http.get.mockResolvedValueOnce([])
    await module.list()
    expect(http.get).toHaveBeenCalledWith('/api/ai/operations')
  })

  it('get validates slug and calls GET /api/ai/operations/:slug', async () => {
    await module.get('generate-summary')
    expect(http.validatePathParam).toHaveBeenCalledWith('generate-summary', 'operation slug')
    expect(http.get).toHaveBeenCalledWith('/api/ai/operations/generate-summary')
  })

  it('execute posts to /api/ai/operations/:slug/execute with body', async () => {
    const body = { entityType: 'entry', entityId: 'e-1', modelOverride: 'gpt-4o' }
    await module.execute('generate-summary', body)
    expect(http.post).toHaveBeenCalledWith('/api/ai/operations/generate-summary/execute', body)
  })

  it('execute defaults to an empty body', async () => {
    await module.execute('generate-summary')
    expect(http.post).toHaveBeenCalledWith('/api/ai/operations/generate-summary/execute', {})
  })
})

// ---------------------------------------------------------------------------
// AIExecutionsModule
// ---------------------------------------------------------------------------

describe('AIExecutionsModule', () => {
  let http: ReturnType<typeof createMockHttp>
  let module: AIExecutionsModule

  beforeEach(() => {
    http = createMockHttp()
    module = new AIExecutionsModule(http as any)
  })

  it('list maps camelCase params to snake_case query params', async () => {
    http.get.mockResolvedValueOnce([])
    await module.list({ operationSlug: 'generate-tags', status: 'completed', entityId: 'e-1', limit: 10, offset: 5 })
    expect(http.get).toHaveBeenCalledWith('/api/ai/executions', {
      operation_slug: 'generate-tags',
      status: 'completed',
      entity_id: 'e-1',
      limit: 10,
      offset: 5,
    })
  })

  it('list with no args passes an all-undefined param object', async () => {
    http.get.mockResolvedValueOnce([])
    await module.list()
    expect(http.get).toHaveBeenCalledWith('/api/ai/executions', {
      operation_slug: undefined,
      status: undefined,
      entity_id: undefined,
      limit: undefined,
      offset: undefined,
    })
  })

  it('get calls GET /api/ai/executions/:id', async () => {
    await module.get('x-1')
    expect(http.get).toHaveBeenCalledWith('/api/ai/executions/x-1')
  })

  it('delete calls DELETE /api/ai/executions/:id', async () => {
    await module.delete('x-1')
    expect(http.delete).toHaveBeenCalledWith('/api/ai/executions/x-1')
  })
})

// ---------------------------------------------------------------------------
// AIModule composite
// ---------------------------------------------------------------------------

describe('AIModule', () => {
  it('exposes settings, providers, operations, executions sub-modules', () => {
    const http = createMockHttp()
    const ai = new AIModule(http as any)
    expect(ai.settings).toBeInstanceOf(AISettingsModule)
    expect(ai.providers).toBeInstanceOf(AIProvidersModule)
    expect(ai.operations).toBeInstanceOf(AIOperationsModule)
    expect(ai.executions).toBeInstanceOf(AIExecutionsModule)
    expect(ai.providers.models).toBeDefined()
  })
})
