/**
 * Theme Module - Platform API
 *
 * Application theme settings
 */

import type { HttpClient } from '../core';

export interface AppTheme {
  // Light theme colors
  lightPrimary: string;
  lightAccent: string;
  lightSecondary: string;
  lightSuccess: string;
  lightInfo: string;
  lightWarning: string;
  lightError: string;

  // Dark theme colors
  darkPrimary: string;
  darkAccent: string;
  darkSecondary: string;
  darkSuccess: string;
  darkInfo: string;
  darkWarning: string;
  darkError: string;
}

export class ThemeModule {
  constructor(private http: HttpClient) {}

  /**
   * Get application theme colors
   */
  async getTheme(): Promise<AppTheme> {
    return this.http.get<AppTheme>('/api/about/theme');
  }
}
