/**
 * Theme Module - Platform API
 *
 * Application theme settings
 */

import type { HttpClient } from '../core';

export interface AppTheme {
  // Light theme - Background & Surface
  lightBg: string;
  lightPanel: string;
  lightPanelSecondary: string;

  // Light theme - Text & Borders
  lightText: string;
  lightTextMuted: string;
  lightBorder: string;

  // Light theme - Accent Colors
  lightPrimary: string;
  lightAccent: string;
  lightSecondary: string;
  lightSuccess: string;
  lightInfo: string;
  lightWarning: string;
  lightError: string;

  // Dark theme - Background & Surface
  darkBg: string;
  darkPanel: string;
  darkPanelSecondary: string;

  // Dark theme - Text & Borders
  darkText: string;
  darkTextMuted: string;
  darkBorder: string;

  // Dark theme - Accent Colors
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
    return this.http.get<AppTheme>('/api/app/about/theme');
  }
}
