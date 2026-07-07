/**
 * HTTP Client for Marvin Publishing API
 *
 * Wrapper around core HttpClient for Publishing API specifics
 */

import type { MarvinConfig } from './config';
import { HttpClient, BearerTokenAuth } from '../core';

export class MarvinHttpClient extends HttpClient {
  constructor(config: MarvinConfig) {
    super({
      baseUrl: config.apiUrl,
      auth: new BearerTokenAuth(config.siteClientToken),
      credentials: 'same-origin',
    });
  }

  /**
   * Fetch endpoint (backward compatibility)
   */
  async fetch<T>(endpoint: string): Promise<T> {
    return this.get<T>(endpoint);
  }
}
