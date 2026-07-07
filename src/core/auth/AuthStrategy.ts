/**
 * Authentication strategy interface
 *
 * Different API surfaces use different auth methods:
 * - Publishing API: Bearer token (site client token)
 * - Platform API: Session token or user token
 * - Admin API: Admin session token
 */
export interface AuthStrategy {
  /**
   * Inject authentication headers into the request
   */
  injectAuth(headers: Headers): void;

  /**
   * Handle unauthorized responses (401)
   * Optional - can be used for token refresh, redirect to login, etc.
   */
  handleUnauthorized?(): Promise<void>;

  /**
   * Get a description of the auth strategy (for debugging)
   */
  getDescription(): string;
}

/**
 * Bearer token authentication (Publishing API, User tokens)
 */
export class BearerTokenAuth implements AuthStrategy {
  constructor(private token: string) {}

  injectAuth(headers: Headers): void {
    headers.set('Authorization', `Bearer ${this.token}`);
  }

  getDescription(): string {
    return 'Bearer token authentication';
  }
}

/**
 * Session-based authentication (Platform/Admin APIs in browser)
 * Relies on HTTP-only cookies set by the server
 */
export class SessionAuth implements AuthStrategy {
  constructor(
    private sessionToken?: string,
    private onUnauthorized?: () => Promise<void>
  ) {}

  injectAuth(headers: Headers): void {
    // If we have an explicit session token, use it as Bearer
    if (this.sessionToken) {
      headers.set('Authorization', `Bearer ${this.sessionToken}`);
    }
    // Otherwise, rely on cookies (credentials: 'include' must be set on fetch)
  }

  async handleUnauthorized(): Promise<void> {
    if (this.onUnauthorized) {
      await this.onUnauthorized();
    }
  }

  getDescription(): string {
    return this.sessionToken
      ? 'Session authentication (explicit token)'
      : 'Session authentication (cookies)';
  }
}

/**
 * No authentication (for public endpoints)
 */
export class NoAuth implements AuthStrategy {
  injectAuth(_headers: Headers): void {
    // No authentication needed
  }

  getDescription(): string {
    return 'No authentication';
  }
}
