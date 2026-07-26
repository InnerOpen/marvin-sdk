/**
 * Collection - Rich object representing a single collection
 */

import type { MarvinCollection, CollectionEntry, CollectionContext, CollectionEntryMetadata } from '../types';

export class Collection {
  constructor(private data: MarvinCollection) {}

  get name() { return this.data.name; }
  get slug() { return this.data.slug; }
  get description() { return this.data.description; }
  get isSmart() { return this.data.isSmart; }
  get smartRules() { return this.data.smartRules; }
  get metadataJson() { return this.data.metadataJson; }
  get entryCount() { return this.data.entryCount; }

  /**
   * Entries with junction context for this collection surfaced directly.
   * - role, position, junctionMetadata: from this collection's junction record
   * - collections: slugs of other collections the entry belongs to
   */
  get entries(): CollectionEntry[] {
    return this.data.entries.map(entry => {
      const { collections, ...rest } = entry;
      const junction = collections.find(ec => ec.collection.slug === this.data.slug);
      const entryMetadata: CollectionEntryMetadata = {
        role: junction?.role ?? null,
        position: junction?.position ?? 0,
        metadataJson: junction?.metadataJson ?? null,
      };
      const collection: CollectionContext = {
        slug: this.data.slug,
        name: this.data.name,
        description: this.data.description,
        metadataJson: this.data.metadataJson,
        entryMetadata,
      };
      return {
        ...rest,
        collection,
        collectionSlugs: collections.map(ec => ec.collection.slug),
      };
    });
  }

  toJSON(): MarvinCollection {
    return this.data;
  }
}
