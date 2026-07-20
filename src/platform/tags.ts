/**
 * Tags Module - Platform API
 *
 * CRUD over the workspace's shared tag vocabulary, plus entry attach/detach.
 * `create` is find-or-create by slug server-side, so calling it with a name that already
 * resolves to a tag returns that tag — the intended "create-on-type" primitive.
 */

import type { HttpClient } from '../core';
import type { PlatformTag, PlatformTagCreate, PlatformTagUpdate } from './types';

export class TagsModule {
  constructor(private http: HttpClient) {}

  /** List all tags (each carries an `entryCount`). */
  async list(): Promise<PlatformTag[]> {
    return this.http.get<PlatformTag[]>('/api/platform/tags');
  }

  /** Get a single tag by ID. */
  async get(id: string): Promise<PlatformTag> {
    const validId = this.http.validatePathParam(id, 'id');
    return this.http.get<PlatformTag>(`/api/platform/tags/${validId}`);
  }

  /**
   * Find-or-create a tag by slug. Posting a name that already resolves to an existing tag
   * returns that tag (idempotent) — use this to resolve a freshly typed name to a stable id.
   */
  async create(data: PlatformTagCreate): Promise<PlatformTag> {
    return this.http.post<PlatformTag>('/api/platform/tags', data);
  }

  /** Rename/recolor a tag. The slug is stable and not changed here. */
  async update(id: string, data: PlatformTagUpdate): Promise<PlatformTag> {
    const validId = this.http.validatePathParam(id, 'id');
    return this.http.patch<PlatformTag>(`/api/platform/tags/${validId}`, data);
  }

  /** Delete a tag (unlabels every entry carrying it via the FK cascade). */
  async delete(id: string): Promise<void> {
    const validId = this.http.validatePathParam(id, 'tag ID');
    return this.http.delete(`/api/platform/tags/${validId}`);
  }

  /** Apply a tag to an entry (idempotent). */
  async attach(tagId: string, entryId: string): Promise<void> {
    const t = this.http.validatePathParam(tagId, 'tag ID');
    const e = this.http.validatePathParam(entryId, 'entry ID');
    return this.http.post(`/api/platform/tags/${t}/entries/${e}`, {});
  }

  /** Remove a tag from an entry. */
  async detach(tagId: string, entryId: string): Promise<void> {
    const t = this.http.validatePathParam(tagId, 'tag ID');
    const e = this.http.validatePathParam(entryId, 'entry ID');
    return this.http.delete(`/api/platform/tags/${t}/entries/${e}`);
  }

  /** Apply a tag to an asset (idempotent). */
  async attachAsset(tagId: string, assetId: string): Promise<void> {
    const t = this.http.validatePathParam(tagId, 'tag ID');
    const a = this.http.validatePathParam(assetId, 'asset ID');
    return this.http.post(`/api/platform/tags/${t}/assets/${a}`, {});
  }

  /** Remove a tag from an asset. */
  async detachAsset(tagId: string, assetId: string): Promise<void> {
    const t = this.http.validatePathParam(tagId, 'tag ID');
    const a = this.http.validatePathParam(assetId, 'asset ID');
    return this.http.delete(`/api/platform/tags/${t}/assets/${a}`);
  }

  /** Apply a tag to a resource (idempotent). */
  async attachResource(tagId: string, resourceId: string): Promise<void> {
    const t = this.http.validatePathParam(tagId, 'tag ID');
    const r = this.http.validatePathParam(resourceId, 'resource ID');
    return this.http.post(`/api/platform/tags/${t}/resources/${r}`, {});
  }

  /** Remove a tag from a resource. */
  async detachResource(tagId: string, resourceId: string): Promise<void> {
    const t = this.http.validatePathParam(tagId, 'tag ID');
    const r = this.http.validatePathParam(resourceId, 'resource ID');
    return this.http.delete(`/api/platform/tags/${t}/resources/${r}`);
  }
}
