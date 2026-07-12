/**
 * Entry Types Module - List entry types with rendering info
 */

import type { MarvinHttpClient } from '../client/http';
import type { PublishedEntryType } from '../types';

export class EntryTypesModule {
  constructor(
    private http: MarvinHttpClient,
    private workspaceSlug: string
  ) {}

  /**
   * List all entry types with rendering and capabilities info
   */
  async list(): Promise<PublishedEntryType[]> {
    const endpoint = `/api/publish/${this.workspaceSlug}/entry-types`;
    return this.http.fetch<PublishedEntryType[]>(endpoint);
  }
}
