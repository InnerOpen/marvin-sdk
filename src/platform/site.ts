/**
 * Site Module - Platform API
 *
 * Rebuild the workspace's static site. A request joins the workspace's pending rebuild, which is sent
 * to the deploy target (an outgoing webhook or integration action on `webhook_triggered`) once
 * requests have been quiet for the server's SITE_REBUILD_QUIET_SECONDS — so repeat calls cost one
 * build. EDITOR and above.
 *
 * Routes: /api/platform/site/rebuild (POST to request, GET for status).
 */

import type { HttpClient } from '../core';
import type { components } from '../generated/schema';

/** `requestRebuild` result: the rebuild was queued (202). */
export type SiteRebuildRequested = components['schemas']['SiteRebuildRequested'];
/** `rebuildStatus` result: what builds the site, the pending rebuild, the last sent, the newest build event. */
export type SiteRebuildStatus = components['schemas']['SiteRebuildStatus'];
/** What builds the site: `kind` "webhook" (deploy hook) or "integration" (with `provider` and `action`). */
export type SiteRebuildTarget = components['schemas']['SiteRebuildTarget'];
export type SiteRebuildPending = components['schemas']['SiteRebuildPending'];
export type SiteRebuildSent = components['schemas']['SiteRebuildSent'];
export type SiteBuildStatus = components['schemas']['SiteBuildStatus'];

const REBUILD = '/api/platform/site/rebuild';

export class SiteModule {
  constructor(private http: HttpClient) {}

  /**
   * Queue a rebuild of the workspace's site, optionally saying why (at most 200 characters; the
   * server defaults to "Rebuild requested by <your name>"). Joins the pending rebuild if there is one
   * (`requestCount` goes up, `queuedAt` stays). Throws a 409 `MarvinApiError` when nothing is set up
   * to build the site, and `MarvinAuthError` (403) below EDITOR.
   */
  async requestRebuild(reason?: string): Promise<SiteRebuildRequested> {
    return this.http.post<SiteRebuildRequested>(REBUILD, reason === undefined ? {} : { reason });
  }

  /** Where the rebuild stands: `configured`, `target(s)`, `pending`, `lastSent` and `lastBuild`. */
  async rebuildStatus(): Promise<SiteRebuildStatus> {
    return this.http.get<SiteRebuildStatus>(REBUILD);
  }
}
