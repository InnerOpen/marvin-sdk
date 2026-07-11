/**
 * Platform API Module
 *
 * Workspace content management (CRUD operations)
 */

export { PlatformClient, createPlatformClient, createPlatformConfigFromEnv } from './client';
export type { PlatformClientConfig } from './client';

// Re-export Platform-specific types
export type {
  // Entries
  PlatformEntry,
  PlatformEntryCreate,
  PlatformEntryUpdate,

  // Collections
  PlatformCollection,
  PlatformCollectionCreate,
  PlatformCollectionUpdate,

  // Resources
  PlatformResource,
  PlatformResourceCreate,
  PlatformResourceUpdate,

  // Assets
  PlatformAsset,
  PlatformAssetUpdate,

  // API Clients
  PlatformAPIClient,
  PlatformAPIClientCreate,
  PlatformAPIClientUpdate,
  PlatformAPIClientWithToken,

  // Entry Types
  PlatformEntryType,

  // Workspace Members
  PlatformWorkspaceMember,
  PlatformWorkspaceMemberCreate,
  PlatformWorkspaceMemberUpdate,

  // Event Log
  EventLogEntry,
  EventLogSummary,

  // Forms
  PlatformForm,
  PlatformFormCreate,
  PlatformFormUpdate,
  PlatformFormSubmission,
} from './types';

export { EntriesModule } from './entries';
export { CollectionsModule } from './collections';
export { ResourcesModule } from './resources';
export { AssetsModule } from './assets';
export { APIClientsModule } from './apiClients';
export { EntryTypesModule } from './entryTypes';
export { WorkspaceMembersModule } from './workspaceMembers';
export { WorkspacesModule } from './workspaces';
export type { Workspace, WorkspaceWithMembership, WorkspaceActivationRequest, WorkspaceCreate, WorkspaceUpdate, WorkspacePreferences, WorkspacePreferencesUpdate } from './workspaces';
export { InvitesModule } from './invites';
export type { InviteTokenCreate, InviteTokenSummary, InviteTokenPagination, EmailInvitationRequest } from './invites';
export { NotificationsModule } from './notifications';
export type { Notification, NotificationCreate, NotificationUpdate } from './notifications';
export { WebhooksModule } from './webhooks';
export type { Webhook, WebhookCreate, WebhookUpdate, WebhookPagination, WebhookMethod } from './webhooks';

// Email Templates
export { EmailTemplatesClient } from './emailTemplates';
export type { EmailTemplateSummary, EmailTemplateRead, EmailTemplateCreate, EmailTemplateUpdate, TestEmailRequest, TestEmailResponse } from './emailTemplates';

// Scheduled Tasks
export { ScheduledTasksModule } from './scheduledTasks';
export type { ScheduledTask, ScheduledTaskCreate, ScheduledTaskUpdate, ScheduledTaskExecutionLog, TaskTypeInfo } from './scheduledTasks';

// Forms
export { FormsModule } from './forms';

// User self-service
export { UserModule } from './user';
export type { UserProfile, UserProfileUpdate, ApiToken, ApiTokenCreate, ApiTokenWithToken, PasswordChange } from './user';

// Events
export { EventsModule } from './events';
export type { EventOption } from './events';

// Event Log (audit trail)
export { EventLogModule } from './eventLog';
export type { EventLogQueryParams } from './eventLog';

// Auth (authenticated session management)
export { AuthModule } from './auth';
export type { AuthToken } from './auth';

// Theme
export { ThemeModule } from './theme';
export type { AppTheme } from './theme';

// Admin modules
export * from './admin';
