/**
 * Entry - Rich object representing a single entry
 */

import type { MarvinEntry, EntryCollectionContext, EntryAsset, EntryResource, CollectionEntryMetadata } from '../types';

export class Entry {
  constructor(private raw: MarvinEntry) {}

  get title() { return this.raw.title; }
  get slug() { return this.raw.slug; }
  get summary() { return this.raw.summary; }
  get entryType() { return this.raw.entryType; }
  get entryTypeInfo() { return this.raw.entryTypeInfo; }
  get data() { return this.raw.data; }
  get metadataJson() { return this.raw.metadataJson; }
  get publishedAt() { return this.raw.publishedAt; }
  get order() { return this.raw.order; }

  get assets(): EntryAsset[] {
    return (this.raw.assets ?? []).map(({ asset, role, position, metadataJson }) => ({
      ...asset,
      entryMetadata: { role: role ?? null, position, metadataJson: metadataJson ?? null } satisfies CollectionEntryMetadata,
    }));
  }

  get collections(): EntryCollectionContext[] {
    return (this.raw.collections ?? []).map(({ collection, role, position, metadataJson }) => ({
      collection,
      entryMetadata: { role: role ?? null, position, metadataJson: metadataJson ?? null } satisfies CollectionEntryMetadata,
    }));
  }

  get resources(): EntryResource[] {
    return (this.raw.resources ?? []).map(({ resource, role, position, metadataJson }) => ({
      ...resource,
      entryMetadata: { role: role ?? null, position, metadataJson: metadataJson ?? null } satisfies CollectionEntryMetadata,
    }));
  }

  field<T = unknown>(key: string): T | undefined {
    return this.raw.data[key] as T | undefined;
  }

  get fields(): Record<string, unknown> {
    return this.raw.data;
  }

  toJSON(): MarvinEntry {
    return this.raw;
  }
}
