/**
 * Collection - Rich object representing a single collection
 */

import type { MarvinCollection, MarvinEntryListItem } from '../types';

export class Collection {
  constructor(private data: MarvinCollection) {}

  get name() { return this.data.name; }
  get slug() { return this.data.slug; }
  get description() { return this.data.description; }
  get isSmart() { return this.data.isSmart; }
  get smartRules() { return this.data.smartRules; }
  get metadataJson() { return this.data.metadataJson; }
  get entryCount() { return this.data.entryCount; }

  get entries(): MarvinEntryListItem[] {
    return this.data.entries;
  }

  toJSON(): MarvinCollection {
    return this.data;
  }
}
