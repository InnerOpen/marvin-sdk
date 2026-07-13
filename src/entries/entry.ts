/**
 * Entry - Rich object representing a single entry
 */

import type { MarvinEntry, PublishedCollectionSummary, PublishedEntryAsset, PublishedEntryResource } from '../types';

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

  get assets(): PublishedEntryAsset[] {
    return this.raw.assets;
  }

  get collections(): PublishedCollectionSummary[] {
    return this.raw.collections;
  }

  get resources(): PublishedEntryResource[] {
    return this.raw.resources;
  }

  asset(role: string): PublishedEntryAsset | undefined {
    return this.raw.assets.find((a) => a.role === role);
  }

  assetsByRole(role: string): PublishedEntryAsset[] {
    return this.raw.assets.filter((a) => a.role === role);
  }

  resource(role: string): PublishedEntryResource | undefined {
    return this.raw.resources.find((r) => r.role === role);
  }

  resourcesByRole(role: string): PublishedEntryResource[] {
    return this.raw.resources.filter((r) => r.role === role);
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
