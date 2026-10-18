/**
 * Assets Module - Download published asset files
 */

import type { MarvinHttpClient } from '../client/http';
import type { BinaryResponse } from '../core';

export class AssetsModule {
  constructor(
    private http: MarvinHttpClient,
    private workspaceSlug: string
  ) {}

  /**
   * Download a published asset's file by slug: its bytes and content type. The file route
   * redirects to storage; the redirect is followed. Needs the `read:assets` permission.
   */
  async download(slug: string): Promise<BinaryResponse> {
    const validSlug = this.http.validatePathParam(slug, 'asset slug');
    return this.http.getBinary(`/api/publish/${this.workspaceSlug}/assets/${validSlug}/file`);
  }
}
