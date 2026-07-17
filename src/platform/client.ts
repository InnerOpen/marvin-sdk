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
import { AdminUsersModule, AdminSystemModule, AdminMaintenanceModule, AdminScheduledTasksModule, AdminBackupsModule, AdminWorkspacesModule } from './admin';
import { AppModule } from './app';
import { UserModule } from './user';
import { EventsModule } from './events';
import { EventLogModule } from './eventLog';
import { AuthModule } from './auth';
import { ThemeModule } from './theme';
import { EmailTemplatesClient } from './emailTemplates';
import { ScheduledTasksModule } from './scheduledTasks';
import { FormsModule } from './forms';
import { SecretsModule } from './secrets';
import { VariablesModule } from './variables';
import { EmailEventSubscriptionsModule } from './emailEventSubscriptions';
import { AIModule } from './ai';

export interface PlatformClientConfig {
  apiUrl?: string;
  userToken?: string;
  credentials?: RequestCredentials;
}

/**
 * Create Platform API config from environment
 */
function getEnv(key: string): string | undefined {
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key];
  }
  return undefined;
}

export function createPlatformConfigFromEnv(overrides?: Partial<PlatformClientConfig>): PlatformClientConfig {
  return {
    apiUrl: overrides?.apiUrl || getEnv('MARVIN_API_URL') || 'http://localhost:8080',
    userToken: overrides?.userToken || getEnv('MARVIN_USER_TOKEN'),
    credentials: overrides?.credentials || 'include',
  };
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
  public emailTemplates: EmailTemplatesClient;
  public scheduledTasks: ScheduledTasksModule;
  public forms: FormsModule;
  public secrets: SecretsModule;
  public variables: VariablesModule;
  public emailEventSubscriptions: EmailEventSubscriptionsModule;

  // AI (providers, models, operations, executions, settings)
  public ai: AIModule;

  // Admin modules
  public adminUsers: AdminUsersModule;
  public adminSystem: AdminSystemModule;
  public adminMaintenance: AdminMaintenanceModule;
  public adminScheduledTasks: AdminScheduledTasksModule;
  public adminBackups: AdminBackupsModule;
  public adminWorkspaces: AdminWorkspacesModule;

  // App module
  public app: AppModule;

  constructor(config: PlatformClientConfig) {
    const httpConfig: HttpClientConfig = {
      baseUrl: config.apiUrl || 'http://localhost:8080',
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
    this.emailTemplates = new EmailTemplatesClient(this);
    this.scheduledTasks = new ScheduledTasksModule(this);
    this.forms = new FormsModule(this);
    this.secrets = new SecretsModule(this);
    this.variables = new VariablesModule(this);
    this.emailEventSubscriptions = new EmailEventSubscriptionsModule(this);

    // AI module (composite: settings, providers+models, operations, executions)
    this.ai = new AIModule(this);

    // Admin modules
    this.adminUsers = new AdminUsersModule(this);
    this.adminSystem = new AdminSystemModule(this);
    this.adminMaintenance = new AdminMaintenanceModule(this);
    this.adminScheduledTasks = new AdminScheduledTasksModule(this);
    this.adminBackups = new AdminBackupsModule(this);
    this.adminWorkspaces = new AdminWorkspacesModule(this);

    // App module
    this.app = new AppModule(this);
  }
}

/**
 * Create a Platform API client
 *
 * @example
 * ```ts
 * // From environment (MARVIN_API_URL, MARVIN_USER_TOKEN)
 * const platform = createPlatformClient();
 *
 * // With explicit user token (for programmatic admin)
 * const platform = createPlatformClient({
 *   userToken: 'user-token-here'
 * });
 *
 * // Browser with session cookies (admin UI)
 * const platform = createPlatformClient({
 *   credentials: 'include'
 * });
 * ```
 */
export function createPlatformClient(config?: Partial<PlatformClientConfig>): PlatformClient {
  const finalConfig = createPlatformConfigFromEnv(config);
  return new PlatformClient(finalConfig);
}
