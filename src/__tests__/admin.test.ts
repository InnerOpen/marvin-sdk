/**
 * Admin module tests
 *
 * Tests the admin API modules by mocking HttpClient and verifying
 * correct URLs, HTTP methods, and parameter passing.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AdminUsersModule } from '../platform/admin/users'
import { AdminSystemModule } from '../platform/admin/system'
import { AdminScheduledTasksModule } from '../platform/admin/scheduledTasks'
import { AdminBackupsModule } from '../platform/admin/backups'
import { AdminWorkspacesModule } from '../platform/admin/workspaces'

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
// AdminUsersModule
// ---------------------------------------------------------------------------

describe('AdminUsersModule', () => {
  let http: ReturnType<typeof createMockHttp>
  let module: AdminUsersModule

  beforeEach(() => {
    http = createMockHttp()
    module = new AdminUsersModule(http as any)
  })

  it('list calls GET /api/admin/users with page and per_page params', async () => {
    http.get.mockResolvedValueOnce({ items: [], total: 0, page: 1, per_page: 50 })
    await module.list()
    expect(http.get).toHaveBeenCalledWith('/api/admin/users?page=1&per_page=50')
  })

  it('list accepts custom page and per_page values', async () => {
    http.get.mockResolvedValueOnce({ items: [], total: 0, page: 2, per_page: 10 })
    await module.list(2, 10)
    expect(http.get).toHaveBeenCalledWith('/api/admin/users?page=2&per_page=10')
  })

  it('get calls GET /api/admin/users/:id', async () => {
    http.get.mockResolvedValueOnce({ id: 'user-1', email: 'test@example.com' })
    const result = await module.get('user-1')
    expect(http.get).toHaveBeenCalledWith('/api/admin/users/user-1')
    expect((result as any).id).toBe('user-1')
  })

  it('update calls PUT /api/admin/users/:id with data', async () => {
    const data = { is_active: false }
    http.put.mockResolvedValueOnce({ id: 'user-1', ...data })
    await module.update('user-1', data as any)
    expect(http.put).toHaveBeenCalledWith('/api/admin/users/user-1', data)
  })

  it('delete calls DELETE /api/admin/users/:id', async () => {
    await module.delete('user-1')
    expect(http.delete).toHaveBeenCalledWith('/api/admin/users/user-1')
  })
})

// ---------------------------------------------------------------------------
// AdminSystemModule
// ---------------------------------------------------------------------------

describe('AdminSystemModule', () => {
  let http: ReturnType<typeof createMockHttp>
  let module: AdminSystemModule

  beforeEach(() => {
    http = createMockHttp()
    module = new AdminSystemModule(http as any)
  })

  it('listEmailTemplates calls GET /api/admin/email/templates', async () => {
    http.get.mockResolvedValueOnce([{ id: 'tmpl-1', name: 'Welcome' }])
    const result = await module.listEmailTemplates()
    expect(http.get).toHaveBeenCalledWith('/api/admin/email/templates')
    expect(result).toHaveLength(1)
  })

  it('getEmailTemplate calls GET /api/admin/email/templates/:id', async () => {
    http.get.mockResolvedValueOnce({ id: 'tmpl-1', name: 'Welcome', subject: 'Hi!', body: '' })
    const result = await module.getEmailTemplate('tmpl-1')
    expect(http.validatePathParam).toHaveBeenCalledWith('tmpl-1', 'template ID')
    expect(http.get).toHaveBeenCalledWith('/api/admin/email/templates/tmpl-1')
    expect((result as any).id).toBe('tmpl-1')
  })

  it('getAbout calls GET /api/admin/about', async () => {
    await module.getAbout()
    expect(http.get).toHaveBeenCalledWith('/api/admin/about')
  })

  it('getStatistics calls GET /api/admin/about/statistics', async () => {
    http.get.mockResolvedValueOnce({ users: 10, workspaces: 3 })
    const result = await module.getStatistics()
    expect(http.get).toHaveBeenCalledWith('/api/admin/about/statistics')
    expect(result.users).toBe(10)
  })

  it('getEmailSettings calls GET /api/admin/email', async () => {
    await module.getEmailSettings()
    expect(http.get).toHaveBeenCalledWith('/api/admin/email')
  })
})

// ---------------------------------------------------------------------------
// AdminScheduledTasksModule
// ---------------------------------------------------------------------------

describe('AdminScheduledTasksModule', () => {
  let http: ReturnType<typeof createMockHttp>
  let module: AdminScheduledTasksModule

  beforeEach(() => {
    http = createMockHttp()
    module = new AdminScheduledTasksModule(http as any)
  })

  it('list calls GET /api/admin/scheduled-tasks', async () => {
    http.get.mockResolvedValueOnce([])
    const result = await module.list()
    expect(http.get).toHaveBeenCalledWith('/api/admin/scheduled-tasks')
    expect(result).toEqual([])
  })

  it('get calls GET /api/admin/scheduled-tasks/:id', async () => {
    http.get.mockResolvedValueOnce({ id: 'task-1', name: 'Daily Backup' })
    const result = await module.get('task-1')
    expect(http.validatePathParam).toHaveBeenCalledWith('task-1', 'task ID')
    expect(http.get).toHaveBeenCalledWith('/api/admin/scheduled-tasks/task-1')
    expect((result as any).id).toBe('task-1')
  })

  it('execute calls POST /api/admin/scheduled-tasks/:id/execute', async () => {
    await module.execute('task-1')
    expect(http.validatePathParam).toHaveBeenCalledWith('task-1', 'task ID')
    expect(http.post).toHaveBeenCalledWith('/api/admin/scheduled-tasks/task-1/execute', {})
  })

  it('log calls GET /api/admin/scheduled-tasks/log', async () => {
    http.get.mockResolvedValueOnce([])
    await module.log()
    expect(http.get).toHaveBeenCalledWith('/api/admin/scheduled-tasks/log', undefined)
  })
})

// ---------------------------------------------------------------------------
// AdminBackupsModule
// ---------------------------------------------------------------------------

describe('AdminBackupsModule', () => {
  let http: ReturnType<typeof createMockHttp>
  let module: AdminBackupsModule

  beforeEach(() => {
    http = createMockHttp()
    module = new AdminBackupsModule(http as any)
  })

  it('list calls GET /api/admin/backups', async () => {
    http.get.mockResolvedValueOnce([{ filename: 'backup.zip' }])
    const result = await module.list()
    expect(http.get).toHaveBeenCalledWith('/api/admin/backups')
    expect(result).toHaveLength(1)
  })

  it('createForWorkspace calls POST /api/admin/backups/workspaces/:id', async () => {
    http.post.mockResolvedValueOnce({ filename: 'new-backup.zip' })
    const result = await module.createForWorkspace('ws-1')
    expect(http.validatePathParam).toHaveBeenCalledWith('ws-1', 'workspace ID')
    expect(http.post).toHaveBeenCalledWith('/api/admin/backups/workspaces/ws-1', {})
    expect((result as any).filename).toBe('new-backup.zip')
  })

  it('download calls GET /api/admin/backups/:filename', async () => {
    await module.download('backup-2024.zip')
    expect(http.validatePathParam).toHaveBeenCalledWith('backup-2024.zip', 'filename')
    expect(http.get).toHaveBeenCalledWith('/api/admin/backups/backup-2024.zip')
  })
})

// ---------------------------------------------------------------------------
// AdminWorkspacesModule
// ---------------------------------------------------------------------------

describe('AdminWorkspacesModule', () => {
  let http: ReturnType<typeof createMockHttp>
  let module: AdminWorkspacesModule

  beforeEach(() => {
    http = createMockHttp()
    module = new AdminWorkspacesModule(http as any)
  })

  it('listMembers calls GET /api/admin/workspaces/:id/members', async () => {
    http.get.mockResolvedValueOnce([{ user_id: 'u1', role: 'MEMBER' }])
    const result = await module.listMembers('ws-1')
    expect(http.validatePathParam).toHaveBeenCalledWith('ws-1', 'workspace ID')
    expect(http.get).toHaveBeenCalledWith('/api/admin/workspaces/ws-1/members')
    expect(result).toHaveLength(1)
  })

  it('removeMember calls DELETE /api/admin/workspaces/:wsId/members/:userId', async () => {
    await module.removeMember('ws-1', 'user-1')
    expect(http.validatePathParam).toHaveBeenCalledWith('ws-1', 'workspace ID')
    expect(http.validatePathParam).toHaveBeenCalledWith('user-1', 'user ID')
    expect(http.delete).toHaveBeenCalledWith('/api/admin/workspaces/ws-1/members/user-1')
  })
})
