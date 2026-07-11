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
      `Missing required config: 'apiUrl'\n\n` +
      `The API URL is the base URL of your Marvin server.\n\n` +
      `Examples:\n` +
      `  - Production: https://marvin.example.com\n` +
      `  - Development: http://localhost:8080\n\n` +
      `Solutions:\n` +
      `  1. Set environment variable: MARVIN_API_URL=https://marvin.example.com\n` +
      `  2. Pass directly: createMarvinClient({ apiUrl: 'https://marvin.example.com' })\n\n` +
      `Received config keys: ${receivedKeys || '(none)'}`
    );
  }

  if (!config.siteClientToken) {
    throw new Error(
      `Missing required config: 'siteClientToken'\n\n` +
      `The site client token provides read-only access to published content.\n\n` +
      `How to get it:\n` +
      `  1. Log into Marvin admin panel\n` +
      `  2. Navigate to: Settings → API Clients\n` +
      `  3. Copy the token for your workspace\n\n` +
      `Examples:\n` +
      `  - site_client_abc123xyz\n` +
      `  - sc_1234567890abcdef\n\n` +
      `Solutions:\n` +
      `  1. Set environment variable: MARVIN_SITE_CLIENT_TOKEN=site_client_abc123\n` +
      `  2. Pass directly: createMarvinClient({ siteClientToken: 'site_client_abc123' })\n\n` +
      `Received config keys: ${receivedKeys}`
    );
  }

  if (!config.workspaceSlug) {
    throw new Error(
      `Missing required config: 'workspaceSlug'\n\n` +
      `The workspace slug identifies which workspace to access.\n\n` +
      `Examples:\n` +
      `  - my-blog\n` +
      `  - company-website\n` +
      `  - acme-corp\n\n` +
      `How to find it:\n` +
      `  1. Check your workspace URL: https://marvin.example.com/workspace/[slug]\n` +
      `  2. Or find it in: Settings → General → Workspace Slug\n\n` +
      `Solutions:\n` +
      `  1. Set environment variable: MARVIN_WORKSPACE_SLUG=my-blog\n` +
      `  2. Pass directly: createMarvinClient({ workspaceSlug: 'my-blog' })\n\n` +
      `Received config keys: ${receivedKeys}`
    );
  }

  // Validate URL format
  if (config.apiUrl) {
    try {
      new URL(config.apiUrl);
    } catch {
      throw new Error(
        `Invalid 'apiUrl' format: "${config.apiUrl}"\n\n` +
        `The API URL must be a valid HTTP or HTTPS URL.\n\n` +
        `Valid examples:\n` +
        `  ✓ https://marvin.example.com\n` +
        `  ✓ http://localhost:8080\n` +
        `  ✓ https://api.marvin.io\n\n` +
        `Invalid examples:\n` +
        `  ✗ marvin.example.com (missing protocol)\n` +
        `  ✗ ftp://marvin.example.com (wrong protocol)\n` +
        `  ✗ /api (not a full URL)`
      );
    }

    const url = new URL(config.apiUrl);
    if (!['http:', 'https:'].includes(url.protocol)) {
      throw new Error(
        `Invalid 'apiUrl' protocol: "${url.protocol}"\n\n` +
        `Only HTTP and HTTPS protocols are supported.\n\n` +
        `Your URL: ${config.apiUrl}\n` +
        `Change to: ${config.apiUrl.replace(url.protocol, 'https:')}`
      );
    }
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
