/**
 * Admin Maintenance Module - Platform API
 *
 * System maintenance information for administrators. Cleanup actions (temp files, revoked tokens,
 * VACUUM) are system scheduled tasks: run one with `adminScheduledTasks.execute(id)`.
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
