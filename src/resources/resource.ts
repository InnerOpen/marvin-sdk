/**
 * Resource - Rich object representing a single resource
 */

import type { MarvinResource } from '../types';

export class Resource {
  constructor(private data: MarvinResource) {}

  get name() { return this.data.name; }
  get slug() { return this.data.slug; }
  get resourceType() { return this.data.resourceType; }
  get description() { return this.data.description; }
  get externalId() { return this.data.externalId; }
  get url() { return this.data.url; }
  get metadataJson() { return this.data.metadataJson; }

  get entries(): string[] {
    return this.data.entries;
  }

  toJSON(): MarvinResource {
    return this.data;
  }
}
