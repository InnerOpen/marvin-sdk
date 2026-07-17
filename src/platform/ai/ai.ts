/**
 * AI Module — Platform API composite
 *
 * Groups the AI sub-modules under a single `platform.ai` namespace:
 *   platform.ai.settings     — workspace AI policy
 *   platform.ai.providers    — providers (+ .models nested)
 *   platform.ai.operations   — operation catalogue + execute
 *   platform.ai.executions   — execution audit log
 */

import type { HttpClient } from '../../core';
import { AISettingsModule } from './settings';
import { AIProvidersModule } from './providers';
import { AIOperationsModule } from './operations';
import { AIExecutionsModule } from './executions';

export class AIModule {
  public settings: AISettingsModule;
  public providers: AIProvidersModule;
  public operations: AIOperationsModule;
  public executions: AIExecutionsModule;

  constructor(http: HttpClient) {
    this.settings = new AISettingsModule(http);
    this.providers = new AIProvidersModule(http);
    this.operations = new AIOperationsModule(http);
    this.executions = new AIExecutionsModule(http);
  }
}
