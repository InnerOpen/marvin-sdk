/**
 * Marvin SDK Configuration
 */

export interface MarvinConfig {
  apiUrl: string;
  siteClientToken: string;
  workspaceSlug: string;
  /** Enable automatic initialization on client creation */
  autoInitialize?: boolean;
  /** Cache duration in milliseconds (default: 5 minutes) */
  cacheDuration?: number;
  /** Enable debug logging for HTTP requests and responses */
  debug?: boolean;
  /** Custom logger function (defaults to console) */
  logger?: {
    log: (message: string, ...args: unknown[]) => void;
    warn: (message: string, ...args: unknown[]) => void;
    error: (message: string, ...args: unknown[]) => void;
  };
}

export function validateConfig(config: Partial<MarvinConfig>): void {
  const receivedKeys = Object.keys(config).join(', ');

  if (!config.apiUrl) {
    throw new Error(
      `Missing required config parameter 'apiUrl'. ` +
      `Received config keys: ${receivedKeys || '(none)'}. ` +
      `Set this to your MARVIN_API_URL environment variable value.`
    );
  }
  if (!config.siteClientToken) {
    throw new Error(
      `Missing required config parameter 'siteClientToken'. ` +
      `Received config keys: ${receivedKeys}. ` +
      `Set this to your MARVIN_SITE_CLIENT_TOKEN environment variable value.`
    );
  }
  if (!config.workspaceSlug) {
    throw new Error(
      `Missing required config parameter 'workspaceSlug'. ` +
      `Received config keys: ${receivedKeys}. ` +
      `Set this to your MARVIN_WORKSPACE_SLUG environment variable value.`
    );
  }
}

export function createConfigFromEnv(overrides?: Partial<MarvinConfig>): MarvinConfig {
  return {
    apiUrl: overrides?.apiUrl || process.env.MARVIN_API_URL || '',
    siteClientToken: overrides?.siteClientToken || process.env.MARVIN_SITE_CLIENT_TOKEN || '',
    workspaceSlug: overrides?.workspaceSlug || process.env.MARVIN_WORKSPACE_SLUG || '',
    autoInitialize: overrides?.autoInitialize ?? false,
    cacheDuration: overrides?.cacheDuration ?? 5 * 60 * 1000, // 5 minutes
    debug: overrides?.debug ?? (process.env.MARVIN_DEBUG === 'true'),
    logger: overrides?.logger ?? console,
  };
}
