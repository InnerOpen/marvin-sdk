/**
 * Admin Maintenance Module - Platform API
 *
 * System maintenance operations for administrators
 */

import type { HttpClient } from '../../core';
import type { components } from '../../generated/schema';

// Type aliases from OpenAPI schema
export type MaintenanceSummary = components['schemas']['MaintenanceSummary'];
export type MaintenanceStorageDetails = components['schemas']['MaintenanceStorageDetails'];

export class AdminMaintenanceModule {
  constructor(private http: HttpClient) {}

  /**
   * Get the maintenance summary (system overview)
   */
  async getSummary(): Promise<MaintenanceSummary> {
    return this.http.get<MaintenanceSummary>('/api/admin/maintenance');
  }

  /**
   * Clean temporary files
   */
  async cleanTemp(): Promise<{ message: string }> {
    return this.http.post<{ message: string }>('/api/admin/maintenance/clean/temp', {});
  }

  /**
   * Clean up old events
   */
  async cleanupEvents(): Promise<{ message: string; deleted: number }> {
    return this.http.post<{ message: string; deleted: number }>('/api/admin/maintenance/cleanup-events', {});
  }

  /**
   * Clean up expired tokens
   */
  async cleanupTokens(): Promise<{ message: string; deleted: number }> {
    return this.http.post<{ message: string; deleted: number }>('/api/admin/maintenance/cleanup-tokens', {});
  }

  /**
   * Clear application cache
   */
  async clearCache(): Promise<{ message: string }> {
    return this.http.post<{ message: string }>('/api/admin/maintenance/clear-cache', {});
  }

  /**
   * Optimize database
   */
  async optimizeDatabase(): Promise<{ message: string }> {
    return this.http.post<{ message: string }>('/api/admin/maintenance/optimize-db', {});
  }

  /**
   * Get maintenance statistics
   */
  async getStats(): Promise<MaintenanceSummary> {
    return this.http.get<MaintenanceSummary>('/api/admin/maintenance/stats');
  }

  /**
   * Get storage information
   */
  async getStorage(): Promise<MaintenanceStorageDetails> {
    return this.http.get<MaintenanceStorageDetails>('/api/admin/maintenance/storage');
  }
}
