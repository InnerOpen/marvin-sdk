/**
 * Marvin SDK - Main client
 */

import type { MarvinConfig } from './config';
import { validateConfig } from './config';
import { MarvinHttpClient } from './http';
import { MarvinCache } from '../core';
import { Workspace } from '../workspaces/workspace';
import type {
  MarvinSite,
  MarvinEntry,
  MarvinCollection,
  MarvinAsset,
} from '../types';
import type { GetEntriesOptions } from '../entries/entries';
import type { GetAssetsOptions } from '../assets/assets';

export class MarvinClient {
  private http: MarvinHttpClient;
  private cache: MarvinCache;
  private workspace: Workspace;
  private initialized = false;

  constructor(private config: MarvinConfig) {
    validateConfig(config);
    this.http = new MarvinHttpClient(config);
    this.cache = new MarvinCache(config.cacheDuration);
    this.workspace = new Workspace(this.http, config.workspaceSlug);

    if (config.autoInitialize) {
      this.initialize();
    }
  }

  /**
   * Initialize the SDK
   * Preloads site configuration and metadata
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      await this.workspace.loadSite();
      this.initialized = true;
    } catch (error) {
      // Gracefully handle initialization errors
      console.warn('Marvin SDK initialization warning:', error);
    }
  }

  // ======================
  // Workspace-First API
  // ======================

  /**
   * Get the workspace object
   */
  async getWorkspace(): Promise<Workspace> {
    if (!this.initialized) {
      await this.initialize();
    }
    return this.workspace;
  }

  /**
   * Get site configuration (cached)
   */
  get site(): MarvinSite | null {
    return this.workspace.site;
  }

  /**
   * Get workspace info (name and slug)
   */
  async getWorkspaceInfo(): Promise<{ slug: string; name: string }> {
    return this.workspace.getInfo();
  }

  /**
   * Get entries module
   */
  get entries() {
    return this.workspace.entries;
  }

  /**
   * Get collections module
   */
  get collections() {
    return this.workspace.collections;
  }

  /**
   * Get assets module
   */
  get assets() {
    return this.workspace.assets;
  }

  /**
   * Get resources module
   */
  get resources() {
    return this.workspace.resources;
  }

  // ======================
  // Convenience Methods
  // ======================

  /**
   * Get a single entry by slug
   */
  async entry(slug: string) {
    return this.workspace.entries.get(slug);
  }

  /**
   * Get a single collection by slug
   */
  async collection(slug: string) {
    return this.workspace.collections.get(slug);
  }

  /**
   * Get all pages
   */
  async pages(options?: GetEntriesOptions) {
    return this.workspace.entries.pages(options);
  }

  /**
   * Get all blog posts
   */
  async posts(options?: GetEntriesOptions) {
    return this.workspace.entries.posts(options);
  }

  /**
   * Get all projects
   */
  async projects(options?: GetEntriesOptions) {
    return this.workspace.entries.projects(options);
  }

  /**
   * Get a single resource by slug
   */
  async resource(slug: string) {
    return this.workspace.resources.get(slug);
  }

  /**
   * Try multiple collection slugs in fallback order
   * Returns entries from the first collection that exists and has content
   *
   * @param slugs - Collection slugs to try in order
   * @param options - Options for fallback behavior
   * @returns Entries from the first matching collection, or empty array
   *
   * @example
   * ```ts
   * // Try bench-notes, then journal, then blog
   * const entries = await client.collectionFallback(['bench-notes', 'journal', 'blog']);
   * ```
   */
  async collectionFallback(
    slugs: string[],
    options?: { requireEntries?: boolean }
  ): Promise<MarvinEntry[]> {
    return this.workspace.collections.fallback(slugs, options);
  }

  // ======================
  // Backwards-Compatible Publishing API
  // ======================

  /**
   * @deprecated Use workspace.site or marvin.site instead
   * Get site configuration
   */
  async getSite(): Promise<MarvinSite> {
    return this.workspace.loadSite();
  }

  /**
   * @deprecated Use workspace.entries.list() instead
   * Get all published entries
   */
  async getEntries(options?: GetEntriesOptions): Promise<MarvinEntry[]> {
    return this.workspace.entries.list(options);
  }

  /**
   * @deprecated Use workspace.entries.get() instead
   * Get a single published entry by slug
   */
  async getEntry(slug: string): Promise<MarvinEntry | null> {
    const entry = await this.workspace.entries.get(slug);
    if (!entry) {
      return null;
    }
    return entry.toJSON();
  }

  /**
   * @deprecated Use workspace.collections.list() instead
   * Get all collections
   */
  async getCollections(): Promise<MarvinCollection[]> {
    return this.workspace.collections.list();
  }

  /**
   * @deprecated Use workspace.collections.get() instead
   * Get a single collection by slug
   */
  async getCollection(slug: string): Promise<MarvinCollection | null> {
    const collection = await this.workspace.collections.get(slug);
    if (!collection) {
      return null;
    }
    return collection.toJSON();
  }

  /**
   * @deprecated Use workspace.collections.entries() instead
   * Get all entries in a collection
   */
  async getCollectionEntries(slug: string): Promise<MarvinEntry[]> {
    return this.workspace.collections.entries(slug);
  }

  /**
   * @deprecated Use workspace.assets.list() instead
   * Get all published assets
   */
  async getAssets(options?: GetAssetsOptions): Promise<MarvinAsset[]> {
    return this.workspace.assets.list(options);
  }

  /**
   * @deprecated Use workspace.resources.list() instead
   * Get all published resources
   */
  async getResources(options?: import('../types').GetResourcesOptions): Promise<import('../types').MarvinResource[]> {
    return this.workspace.resources.list(options);
  }

  /**
   * @deprecated Use workspace.resources.get() instead
   * Get a single resource by slug
   */
  async getResource(slug: string): Promise<import('../types').MarvinResource> {
    const resource = await this.workspace.resources.get(slug);
    return resource.toJSON();
  }

  /**
   * @deprecated Use workspace.resources.entries() instead
   * Get entries that reference a resource
   */
  async getResourceEntries(slug: string): Promise<MarvinEntry[]> {
    return this.workspace.resources.entries(slug);
  }
}
