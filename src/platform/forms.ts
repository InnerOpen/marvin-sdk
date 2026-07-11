/**
 * Forms Module - Platform API
 *
 * CRUD operations for forms and submissions
 */

import { HttpClient, MarvinValidationError } from '../core';
import type {
  PlatformForm,
  PlatformFormCreate,
  PlatformFormUpdate,
  PlatformFormSubmission,
} from './types';

export class FormsModule {
  constructor(private http: HttpClient) {}

  /**
   * Validate form submission data
   * - Prevents XSS by checking for script tags
   * - Validates data is a proper object
   * - Checks for reasonable size limits
   */
  private validateFormData(data: Record<string, unknown>): void {
    if (!data || typeof data !== 'object') {
      throw new MarvinValidationError('Form data must be a valid object');
    }

    // Check for reasonable payload size (1MB limit)
    const jsonString = JSON.stringify(data);
    const sizeInBytes = new Blob([jsonString]).size;
    if (sizeInBytes > 1024 * 1024) {
      throw new MarvinValidationError('Form data exceeds maximum size of 1MB');
    }

    // Basic XSS prevention - check for script tags in string values
    const checkForScripts = (value: unknown): void => {
      if (typeof value === 'string') {
        if (/<script[\s\S]*?>[\s\S]*?<\/script>/gi.test(value)) {
          throw new MarvinValidationError('Form data contains potentially malicious content');
        }
      } else if (Array.isArray(value)) {
        value.forEach(checkForScripts);
      } else if (value && typeof value === 'object') {
        Object.values(value).forEach(checkForScripts);
      }
    };

    Object.values(data).forEach(checkForScripts);
  }

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
    const validId = this.http.validatePathParam(id, 'id');
    return this.http.get<PlatformForm>(`/api/platform/forms/${validId}`);
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
    const validId = this.http.validatePathParam(id, 'id');
    return this.http.patch<PlatformForm>(`/api/platform/forms/${validId}`, data);
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
   * Validates data before submission to prevent XSS and malicious content
   */
  async submitForm(slug: string, data: Record<string, unknown>): Promise<PlatformFormSubmission> {
    // Validate slug
    const validSlug = this.http.validatePathParam(slug, 'form slug');

    // Validate form data
    this.validateFormData(data);

    return this.http.post<PlatformFormSubmission>(`/api/publish/forms/${validSlug}/submit`, {
      dataJson: data,
    });
  }
}
