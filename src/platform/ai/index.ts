/**
 * AI Modules — Platform API
 *
 * Provider-agnostic AI: providers/models config, operation catalogue,
 * execution history, and workspace AI policy.
 */

export { AIModule } from './ai';
export { AISettingsModule } from './settings';
export { AIProvidersModule, AIModelsModule } from './providers';
export { AIOperationsModule } from './operations';
export type { AIReindexRequest } from './operations';
export { AIExecutionsModule } from './executions';

export type {
  AIModel,
  AIModelCreate,
  AIModelUpdate,
  AIProvider,
  AIProviderCreate,
  AIProviderUpdate,
  AIProviderTestResult,
  AIProviderType,
  AISettings,
  AISettingsUpdate,
  AICredentialMode,
  AIApprovalMode,
  AIOperationInfo,
  AIOperationExecuteRequest,
  AIExecution,
  AIExecutionStatus,
  AIExecutionListParams,
} from './types';
