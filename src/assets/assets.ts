/**
 * Assets Module - Manage assets
 */

import type { MarvinHttpClient } from '../client/http';
import type { BinaryResponse } from '../core';
import type { MarvinAsset } from '../types';

export interface GetAssetsOptions {
  type?: string;
  limit?: number;
  offset?: number;
}

export class AssetsModule {
  constructor(
    private http: MarvinHttpClient,
    private workspaceSlug: string
  ) {}

  /**
   * Get all published assets
   */
  async list(options: GetAssetsOptions = {}): Promise<MarvinAsset[]> {
    const queryString = this.http.buildQueryString({
      type: options.type,
      limit: options.limit,
      offset: options.offset,
    });

    const endpoint = `/api/publish/${this.workspaceSlug}/assets${queryString}`;
    const response = await this.http.fetch<{ data: MarvinAsset[] }>(endpoint);

    // Extract data from paginated response
    return response.data || [];
  }

  /**
   * Get a single published asset by slug or ID
   */
  async get(slugOrId: string): Promise<MarvinAsset> {
    const endpoint = `/api/publish/${this.workspaceSlug}/assets/${slugOrId}`;
    return this.http.fetch<MarvinAsset>(endpoint);
  }

  /**
   * Download a published asset's file by slug: its bytes and content type. The file route
   * redirects to storage; the redirect is followed. Needs the `read:assets` permission.
   */
  async download(slug: string): Promise<BinaryResponse> {
    const validSlug = this.http.validatePathParam(slug, 'asset slug');
    return this.http.getBinary(`/api/publish/${this.workspaceSlug}/assets/${validSlug}/file`);
  }

  /**
   * Convenience: Get all images
   */
  async images(options?: Omit<GetAssetsOptions, 'type'>): Promise<MarvinAsset[]> {
    return this.list({ ...options, type: 'image' });
  }

  /**
   * Convenience: Get all videos
   */
  async videos(options?: Omit<GetAssetsOptions, 'type'>): Promise<MarvinAsset[]> {
    return this.list({ ...options, type: 'video' });
  }

  /**
   * Convenience: Get all documents
   */
  async documents(options?: Omit<GetAssetsOptions, 'type'>): Promise<MarvinAsset[]> {
    return this.list({ ...options, type: 'document' });
  }
}
