/**
 * Resources Module - Manage resources
 */

import type { MarvinHttpClient } from '../client/http';
import type { MarvinResource } from '../types';
import { Resource } from './resource';

export interface GetResourcesOptions {
  resourceType?: string;
  limit?: number;
  offset?: number;
}

export class ResourcesModule {
  constructor(
    private http: MarvinHttpClient,
    private workspaceSlug: string
  ) {}

  /**
   * Get all published resources
   */
  async list(options: GetResourcesOptions = {}): Promise<MarvinResource[]> {
    const queryString = this.http.buildQueryString({
      resource_type: options.resourceType,
      limit: options.limit,
      offset: options.offset,
    });

    const endpoint = `/api/publish/${this.workspaceSlug}/resources${queryString}`;
    const response = await this.http.fetch<{ data: MarvinResource[] }>(endpoint);

    return response.data || [];
  }

  /**
   * Get a single resource by slug
   */
  async get(slug: string): Promise<Resource> {
    const endpoint = `/api/publish/${this.workspaceSlug}/resources/${slug}`;
    const data = await this.http.fetch<MarvinResource>(endpoint);
    return new Resource(data);
  }

  /**
   * Get entry slugs that reference this resource
   */
  async entries(slug: string): Promise<string[]> {
    const resource = await this.get(slug);
    return resource.entries;
  }
}
