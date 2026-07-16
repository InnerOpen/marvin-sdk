/**
 * Platform module tests
 *
 * Tests the core platform API modules by mocking HttpClient and verifying
 * correct URLs, HTTP methods, and parameter passing.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { EventsModule } from '../platform/events'
import { EmailEventSubscriptionsModule } from '../platform/emailEventSubscriptions'
import { WebhooksModule } from '../platform/webhooks'
import { NotificationsModule } from '../platform/notifications'
import { SecretsModule } from '../platform/secrets'
import { VariablesModule } from '../platform/variables'
import { WorkspacesModule } from '../platform/workspaces'
import { AppModule } from '../platform/app'

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
// EventsModule
// ---------------------------------------------------------------------------

describe('EventsModule', () => {
  let http: ReturnType<typeof createMockHttp>
  let module: EventsModule

  beforeEach(() => {
    http = createMockHttp()
    module = new EventsModule(http as any)
  })

  it('getOptions calls GET /api/event/types', async () => {
    http.get.mockResolvedValueOnce([{ value: 'entry.created', label: 'Entry Created' }])
    const result = await module.getOptions()
    expect(http.get).toHaveBeenCalledWith('/api/event/types')
    expect(result).toEqual([{ value: 'entry.created', label: 'Entry Created' }])
  })

  it('getOptionsLegacy calls GET /api/event/options', async () => {
    http.get.mockResolvedValueOnce([])
    await module.getOptionsLegacy()
    expect(http.get).toHaveBeenCalledWith('/api/event/options')
  })
})

// ---------------------------------------------------------------------------
// EmailEventSubscriptionsModule
// ---------------------------------------------------------------------------

describe('EmailEventSubscriptionsModule', () => {
  let http: ReturnType<typeof createMockHttp>
  let module: EmailEventSubscriptionsModule

  beforeEach(() => {
    http = createMockHttp()
    module = new EmailEventSubscriptionsModule(http as any)
  })

  it('list calls GET /api/groups/email-event-subscriptions', async () => {
    http.get.mockResolvedValueOnce([])
    const result = await module.list()
    expect(http.get).toHaveBeenCalledWith('/api/groups/email-event-subscriptions')
    expect(result).toEqual([])
  })

  it('create posts to /api/groups/email-event-subscriptions with data', async () => {
    const data = { template_id: 'tmpl-1', event_type: 'entry.created' }
    const created = { id: 'sub-1', ...data, group_id: 'g1', recipient_type: 'admins' as const, recipient_field: null, recipient_email: null, enabled: true, created_at: '', update_at: '' }
    http.post.mockResolvedValueOnce(created)
    const result = await module.create(data)
    expect(http.post).toHaveBeenCalledWith('/api/groups/email-event-subscriptions', data)
    expect(result.id).toBe('sub-1')
  })

  it('delete calls DELETE /api/groups/email-event-subscriptions/:id', async () => {
    await module.delete('sub-123')
    expect(http.validatePathParam).toHaveBeenCalledWith('sub-123', 'subscription ID')
    expect(http.delete).toHaveBeenCalledWith('/api/groups/email-event-subscriptions/sub-123')
  })
})

// ---------------------------------------------------------------------------
// WebhooksModule
// ---------------------------------------------------------------------------

describe('WebhooksModule', () => {
  let http: ReturnType<typeof createMockHttp>
  let module: WebhooksModule

  beforeEach(() => {
    http = createMockHttp()
    module = new WebhooksModule(http as any)
  })

  it('list calls GET /api/groups/webhooks and returns items array', async () => {
    http.get.mockResolvedValueOnce({ items: [{ id: 'wh-1' }], total: 1 })
    const result = await module.list()
    expect(http.get).toHaveBeenCalledWith('/api/groups/webhooks')
    expect(result).toEqual([{ id: 'wh-1' }])
  })

  it('list returns empty array when response has no items', async () => {
    http.get.mockResolvedValueOnce({})
    const result = await module.list()
    expect(result).toEqual([])
  })

  it('create posts to /api/groups/webhooks with data', async () => {
    const data = { url: 'https://example.com/hook', event_types: ['entry.created'], method: 'POST' as const, enabled: true, name: 'Test Hook' }
    http.post.mockResolvedValueOnce({ id: 'wh-1', ...data })
    await module.create(data as any)
    expect(http.post).toHaveBeenCalledWith('/api/groups/webhooks', data)
  })

  it('delete calls DELETE /api/groups/webhooks/:id', async () => {
    await module.delete('wh-123')
    expect(http.validatePathParam).toHaveBeenCalledWith('wh-123', 'webhook ID')
    expect(http.delete).toHaveBeenCalledWith('/api/groups/webhooks/wh-123')
  })

  it('test calls GET /api/groups/webhooks/:id/test', async () => {
    http.get.mockResolvedValueOnce({ message: 'Test sent' })
    const result = await module.test('wh-123')
    expect(http.get).toHaveBeenCalledWith('/api/groups/webhooks/wh-123/test')
    expect(result.message).toBe('Test sent')
  })
})

// ---------------------------------------------------------------------------
// NotificationsModule
// ---------------------------------------------------------------------------

describe('NotificationsModule', () => {
  let http: ReturnType<typeof createMockHttp>
  let module: NotificationsModule

  beforeEach(() => {
    http = createMockHttp()
    module = new NotificationsModule(http as any)
  })

  it('list calls GET /api/group/notifications', async () => {
    http.get.mockResolvedValueOnce([])
    const result = await module.list()
    expect(http.get).toHaveBeenCalledWith('/api/group/notifications')
    expect(result).toEqual([])
  })

  it('create posts to /api/group/notifications with data', async () => {
    const data = { name: 'My Notification', event_type: 'entry.created', channel: 'slack' }
    http.post.mockResolvedValueOnce({ id: 'notif-1', ...data })
    const result = await module.create(data as any)
    expect(http.post).toHaveBeenCalledWith('/api/group/notifications', data)
    expect((result as any).id).toBe('notif-1')
  })
})

// ---------------------------------------------------------------------------
// SecretsModule
// ---------------------------------------------------------------------------

describe('SecretsModule', () => {
  let http: ReturnType<typeof createMockHttp>
  let module: SecretsModule

  beforeEach(() => {
    http = createMockHttp()
    module = new SecretsModule(http as any)
  })

  it('list calls GET /api/groups/secrets', async () => {
    http.get.mockResolvedValueOnce([{ id: 's1', name: 'API Key', slug: 'api-key', groupId: 'g1', description: null }])
    const result = await module.list()
    expect(http.get).toHaveBeenCalledWith('/api/groups/secrets')
    expect(result).toHaveLength(1)
  })

  it('reveal calls GET /api/groups/secrets/:id/reveal', async () => {
    http.get.mockResolvedValueOnce({ value: 'super-secret' })
    const result = await module.reveal('sec-123')
    expect(http.validatePathParam).toHaveBeenCalledWith('sec-123', 'secret ID')
    expect(http.get).toHaveBeenCalledWith('/api/groups/secrets/sec-123/reveal')
    expect(result.value).toBe('super-secret')
  })

  it('create posts to /api/groups/secrets with data', async () => {
    const data = { name: 'DB Password', slug: 'db-password', value: 'hunter2' }
    await module.create(data)
    expect(http.post).toHaveBeenCalledWith('/api/groups/secrets', data)
  })
})

// ---------------------------------------------------------------------------
// VariablesModule
// ---------------------------------------------------------------------------

describe('VariablesModule', () => {
  let http: ReturnType<typeof createMockHttp>
  let module: VariablesModule

  beforeEach(() => {
    http = createMockHttp()
    module = new VariablesModule(http as any)
  })

  it('list calls GET /api/groups/variables', async () => {
    http.get.mockResolvedValueOnce([])
    const result = await module.list()
    expect(http.get).toHaveBeenCalledWith('/api/groups/variables')
    expect(result).toEqual([])
  })

  it('create posts to /api/groups/variables with data', async () => {
    const data = { name: 'Site URL', slug: 'site-url', value: 'https://example.com' }
    http.post.mockResolvedValueOnce({ id: 'var-1', groupId: 'g1', description: null, ...data })
    const result = await module.create(data)
    expect(http.post).toHaveBeenCalledWith('/api/groups/variables', data)
    expect((result as any).id).toBe('var-1')
  })
})

// ---------------------------------------------------------------------------
// WorkspacesModule
// ---------------------------------------------------------------------------

describe('WorkspacesModule', () => {
  let http: ReturnType<typeof createMockHttp>
  let module: WorkspacesModule

  beforeEach(() => {
    http = createMockHttp()
    module = new WorkspacesModule(http as any)
  })

  it('getStats calls GET /api/platform/stats', async () => {
    const stats = { entries: 42, collections: 5 }
    http.get.mockResolvedValueOnce(stats)
    const result = await module.getStats()
    expect(http.get).toHaveBeenCalledWith('/api/platform/stats')
    expect(result).toEqual(stats)
  })

  it('listBackups calls GET /api/platform/workspace/backups', async () => {
    http.get.mockResolvedValueOnce([{ filename: 'backup-2024.zip' }])
    const result = await module.listBackups()
    expect(http.get).toHaveBeenCalledWith('/api/platform/workspace/backups')
    expect(result).toHaveLength(1)
  })

  it('getCurrent calls GET /api/self/workspaces/current', async () => {
    await module.getCurrent()
    expect(http.get).toHaveBeenCalledWith('/api/self/workspaces/current')
  })
})

// ---------------------------------------------------------------------------
// AppModule
// ---------------------------------------------------------------------------

describe('AppModule', () => {
  let http: ReturnType<typeof createMockHttp>
  let module: AppModule

  beforeEach(() => {
    http = createMockHttp()
    module = new AppModule(http as any)
  })

  it('health calls GET /api/app/health', async () => {
    http.get.mockResolvedValueOnce({ status: 'ok' })
    const result = await module.health()
    expect(http.get).toHaveBeenCalledWith('/api/app/health')
    expect((result as any).status).toBe('ok')
  })

  it('getAbout calls GET /api/app/about', async () => {
    http.get.mockResolvedValueOnce({ version: '3.0.0' })
    const result = await module.getAbout()
    expect(http.get).toHaveBeenCalledWith('/api/app/about')
    expect((result as any).version).toBe('3.0.0')
  })

  it('getLoginInfo calls GET /api/app/about/login-info', async () => {
    await module.getLoginInfo()
    expect(http.get).toHaveBeenCalledWith('/api/app/about/login-info')
  })
})
