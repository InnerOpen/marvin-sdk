/**
 * Platform API Module
 *
 * Workspace content management (CRUD operations)
 */

export { PlatformClient, createPlatformClient } from './client';
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
  PlatformAssetCreate,
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

// Admin modules
export * from './admin';
