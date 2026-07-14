import type { MarvinHttpClient } from '../client/http';
import type { PublishedEntryType } from '../types';

export class RenderersModule {
  constructor(
    private http: MarvinHttpClient,
    private workspaceSlug: string
  ) {}

  async list(): Promise<PublishedEntryType[]> {
    const endpoint = `/api/publish/${this.workspaceSlug}/entry-types`;
    const all = await this.http.fetch<PublishedEntryType[]>(endpoint);
    return all.filter((et) => et.isRendered);
  }
}
