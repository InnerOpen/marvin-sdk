/**
 * Forms Module - Platform API
 *
 * CRUD operations for forms and submissions
 */

import type { HttpClient } from '../core';
import type {
  PlatformForm,
  PlatformFormCreate,
  PlatformFormUpdate,
  PlatformFormSubmission,
} from './types';

export class FormsModule {
  constructor(private http: HttpClient) {}

  /**
   * List all forms
   */
  async list(): Promise<PlatformForm[]> {
    return this.http.get<PlatformForm[]>('/api/platform/forms');
  }

  /**
   * Get a single form by ID
   */
  async get(id: string): Promise<PlatformForm> {
    return this.http.get<PlatformForm>(`/api/platform/forms/${id}`);
  }

  /**
   * Create a new form
   */
  async create(data: PlatformFormCreate): Promise<PlatformForm> {
    return this.http.post<PlatformForm>('/api/platform/forms', data);
  }

  /**
   * Update a form
   */
  async update(id: string, data: PlatformFormUpdate): Promise<PlatformForm> {
    return this.http.patch<PlatformForm>(`/api/platform/forms/${id}`, data);
  }

  /**
   * Delete a form
   */
  async delete(id: string): Promise<void> {
    return this.http.delete(`/api/platform/forms/${id}`);
  }

  /**
   * Get submissions for a form
   */
  async getSubmissions(formId: string): Promise<PlatformFormSubmission[]> {
    return this.http.get<PlatformFormSubmission[]>(`/api/platform/forms/${formId}/submissions`);
  }

  /**
   * Get a published form by slug (Publishing API - public access)
   */
  async getPublishedForm(slug: string): Promise<PlatformForm> {
    return this.http.get<PlatformForm>(`/api/publish/forms/${slug}`);
  }

  /**
   * Submit data to a published form (Publishing API - public access)
   */
  async submitForm(slug: string, data: Record<string, unknown>): Promise<PlatformFormSubmission> {
    return this.http.post<PlatformFormSubmission>(`/api/publish/forms/${slug}/submit`, {
      dataJson: data,
    });
  }
}
