/**
 * Platform API Types
 *
 * Re-exports types from the auto-generated OpenAPI schema
 * with better naming for public API consumption
 */

import type { components } from '../generated/schema';

/**
 * Entry (Platform API - full CRUD)
 */
export type PlatformEntry = components['schemas']['EntryRead'];
export type PlatformEntryCreate = components['schemas']['EntryCreate'];
export type PlatformEntryUpdate = components['schemas']['EntryUpdate'];

/**
 * Entry counts by status (`GET /api/platform/entries/counts`): every known status, zero-filled,
 * plus `total` — e.g. `{ inbox: 2, draft: 5, needs_review: 1, published: 40, …, total: 48 }`.
 */
export type PlatformEntryCounts = Record<string, number>;

/**
 * The dashboard (`GET /api/platform/stats/dashboard`): recent activity and the "needs attention"
 * counts — inbox, drafts, entries needing review, pending AI suggestions, failures in the last 7 days.
 */
export type PlatformDashboard = components['schemas']['DashboardData'];
export type PlatformAttentionCounts = components['schemas']['AttentionCounts'];
export type PlatformRecentEvent = components['schemas']['RecentEvent'];

/**
 * Tag (Platform API) — the shared, group-scoped label vocabulary.
 */
export type PlatformTag = components['schemas']['TagRead'];
export type PlatformTagCreate = components['schemas']['TagCreate'];
export type PlatformTagUpdate = components['schemas']['TagUpdate'];

/**
 * Entry Type
 */
export type PlatformEntryType = components['schemas']['EntryTypeRead'];

/**
 * Collection (Platform API - full CRUD)
 */
export type PlatformCollection = components['schemas']['CollectionRead'];
export type PlatformCollectionCreate = components['schemas']['CollectionCreate'];
export type PlatformCollectionUpdate = components['schemas']['CollectionUpdate'];

/**
 * Rules for a **smart collection** (`isSmart: true`). Membership is derived from these rules
 * and materialized server-side on entry changes — do not manually add/reorder entries on a
 * smart collection, its membership is rule-managed.
 *
 * Every dimension is optional; an empty ruleset matches **nothing** (so a misconfigured smart
 * collection can't swallow the whole workspace). Dimensions are combined per `match`.
 *
 * NOTE: keys are snake_case — `smartRules` is stored as opaque JSON and the server evaluates
 * these exact keys.
 */
export interface SmartCollectionRules {
  /** entry-type slugs to include */
  entry_types?: string[];
  /** entry statuses to include (e.g. "published") */
  statuses?: string[];
  /** tags to include — reserved; active once entries carry tags */
  tags?: string[];
  /** how to combine the dimensions above (default "all") */
  match?: 'all' | 'any';
}

/**
 * Smart-collection rule preview: what unsaved rules would select, without saving anything.
 */
export interface SmartRulesPreviewRequest {
  /** Which kind of item the rules select (default 'entry'). */
  targetType?: 'entry' | 'asset' | 'resource';
  /** The rules, in the same shape as a collection's `smartRules`. */
  smartRules?: SmartCollectionRules | Record<string, unknown> | null;
  /** How many matches to list (default 10, at most 50); `total` counts them all. */
  limit?: number;
}
export type SmartRulesPreview = components['schemas']['SmartRulesPreview'];

/**
 * One member of a collection of any target type (`GET /api/platform/collections/{id}/members`).
 */
export interface CollectionMember {
  id: string;
  /** The entry's title, or the asset's / resource's name. */
  label: string;
  slug: string | null;
  type: 'entry' | 'asset' | 'resource';
}

/**
 * Resource (Platform API - full CRUD)
 */
export type PlatformResource = components['schemas']['ResourceRead'];
export type PlatformResourceCreate = components['schemas']['ResourceCreate'];
export type PlatformResourceUpdate = components['schemas']['ResourceUpdate'];

/**
 * Asset (Platform API - full CRUD with file upload)
 */
export type PlatformAsset = components['schemas']['AssetRead'];
export type PlatformAssetUpdate = components['schemas']['AssetUpdate'];
// AssetUploadRequest not in OpenAPI (used as Form parameters)
export type PlatformAssetUpload = {
  slug: string;
  name: string;
  altText?: string;
  description?: string;
  metadata?: Record<string, unknown>;
};

/**
 * API Client (Platform API - manage publishing tokens)
 */
export type PlatformAPIClient = components['schemas']['APIClientRead'];
export type PlatformAPIClientCreate = components['schemas']['APIClientCreate'];
export type PlatformAPIClientUpdate = components['schemas']['APIClientUpdate'];
export type PlatformAPIClientWithToken = components['schemas']['APIClientWithToken'];

/**
 * Workspace Member (Platform API - member management)
 */
export type PlatformWorkspaceMember = components['schemas']['WorkspaceMembershipRead'];
export type PlatformWorkspaceMemberCreate = components['schemas']['WorkspaceMemberCreate'];
export type PlatformWorkspaceMemberUpdate = components['schemas']['WorkspaceMemberUpdate'];

/**
 * Event Log (Platform API - audit trail and event history)
 */
export type EventLogEntry = components['schemas']['EventLogRead'];
export type EventLogSummary = components['schemas']['EventLogSummary'];

/**
 * Forms (Platform API - full CRUD)
 */
export type PlatformForm = components['schemas']['FormRead'];
export type PlatformFormCreate = components['schemas']['FormCreate'];
export type PlatformFormUpdate = components['schemas']['FormUpdate'];

/**
 * Form Submissions (Platform API - read access)
 */
export type PlatformFormSubmission = components['schemas']['FormSubmissionRead'];
