/**
 * Platform API Client
 *
 * Workspace management API for authenticated users
 */

import { HttpClient, SessionAuth } from '../core';
import type { HttpClientConfig } from '../core';
import { EntriesModule } from './entries';
import { CollectionsModule } from './collections';
import { ResourcesModule } from './resources';
import { AssetsModule } from './assets';
import { APIClientsModule } from './apiClients';
import { EntryTypesModule } from './entryTypes';
import { WorkspaceMembersModule } from './workspaceMembers';
import { WorkspacesModule } from './workspaces';
import { InvitesModule } from './invites';
import { NotificationsModule } from './notifications';
import { WebhooksModule } from './webhooks';
import { AdminUsersModule, AdminSystemModule, AdminMaintenanceModule } from './admin';
import { UserModule } from './user';
import { EventsModule } from './events';
import { EventLogModule } from './eventLog';
import { AuthModule } from './auth';
import { ThemeModule } from './theme';

export interface PlatformClientConfig {
  apiUrl: string;
  userToken?: string;
  credentials?: RequestCredentials;
}

export class PlatformClient extends HttpClient {
  public entries: EntriesModule;
  public collections: CollectionsModule;
  public resources: ResourcesModule;
  public assets: AssetsModule;
  public apiClients: APIClientsModule;
  public entryTypes: EntryTypesModule;
  public workspaceMembers: WorkspaceMembersModule;
  public workspaces: WorkspacesModule;
  public invites: InvitesModule;
  public notifications: NotificationsModule;
  public webhooks: WebhooksModule;
  public user: UserModule;
  public events: EventsModule;
  public eventLog: EventLogModule;
  public session: AuthModule;
  public theme: ThemeModule;

  // Admin modules
  public adminUsers: AdminUsersModule;
  public adminSystem: AdminSystemModule;
  public adminMaintenance: AdminMaintenanceModule;

  constructor(config: PlatformClientConfig) {
    const httpConfig: HttpClientConfig = {
      baseUrl: config.apiUrl,
      auth: new SessionAuth(config.userToken),
      credentials: config.credentials || 'include',
    };

    super(httpConfig);

    // Initialize modules
    this.entries = new EntriesModule(this);
    this.collections = new CollectionsModule(this);
    this.resources = new ResourcesModule(this);
    this.assets = new AssetsModule(this);
    this.apiClients = new APIClientsModule(this);
    this.entryTypes = new EntryTypesModule(this);
    this.workspaceMembers = new WorkspaceMembersModule(this);
    this.workspaces = new WorkspacesModule(this);
    this.invites = new InvitesModule(this);
    this.notifications = new NotificationsModule(this);
    this.webhooks = new WebhooksModule(this);
    this.user = new UserModule(this);
    this.events = new EventsModule(this);
    this.eventLog = new EventLogModule(this);
    this.session = new AuthModule(this);
    this.theme = new ThemeModule(this);

    // Admin modules
    this.adminUsers = new AdminUsersModule(this);
    this.adminSystem = new AdminSystemModule(this);
    this.adminMaintenance = new AdminMaintenanceModule(this);
  }
}

/**
 * Create a Platform API client
 */
export function createPlatformClient(config: PlatformClientConfig): PlatformClient {
  return new PlatformClient(config);
}
