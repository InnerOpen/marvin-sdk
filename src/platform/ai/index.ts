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
export { AIToolsModule } from './tools';
export { AIMcpServersModule } from './mcpServers';
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
  AIChatRequest,
  AIChatResult,
  AIToolInfo,
  AIToolInvokeRequest,
  AgentToolInfo,
  McpServer,
  McpServerCreate,
  McpServerUpdate,
  McpServerToolInfo,
  McpServerTestResult,
  McpTransport,
  AIComposeEntryRequest,
  AIComposeEntryResult,
  AIExecution,
  AIExecutionStatus,
  AIExecutionListParams,
} from './types';
