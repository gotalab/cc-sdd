/**
 * Context Monitor Configuration
 * 
 * Defines thresholds, budgets, and behavior for context window monitoring.
 */

import * as os from 'os';
import * as path from 'path';

/**
 * Default context window budgets for different models (in tokens)
 */
export const DEFAULT_MODEL_BUDGETS: Record<string, number> = {
  // Claude models — actual API IDs
  'claude-opus-4-6': 200000,
  'claude-sonnet-4-6': 200000,
  'claude-haiku-4-5': 200000,
  // Legacy / pattern-match fallbacks
  'claude-3-opus': 200000,
  'claude-3-sonnet': 200000,
  'claude-3-haiku': 200000,
  'claude-3.5-sonnet': 200000,
  'claude-3.5-haiku': 200000,
  'claude-4-opus': 200000,
  'claude-4-sonnet': 200000,
  
  // GPT models
  'gpt-4': 128000,
  'gpt-4-turbo': 128000,
  'gpt-4o': 128000,
  'gpt-4o-mini': 128000,
  'gpt-3.5-turbo': 16385,
  
  // Gemini models
  'gemini-1.5-pro': 1000000,
  'gemini-1.5-flash': 1000000,
  'gemini-2.0-flash': 1000000,
  
  // Default fallback
  'default': 200000,
};

/**
 * Threshold status levels
 */
export type ThresholdStatus = 'safe' | 'warning' | 'critical' | 'exceeded';

/**
 * Display mode options
 */
export type DisplayMode = 'always' | 'on-threshold' | 'never';

/**
 * Context Monitor Configuration Interface
 */
export interface ContextMonitorConfig {
  /** Percentage at which to trigger threshold exceeded (default: 70) */
  threshold_percentage: number;
  
  /** Percentage at which to show warning (default: 60) */
  warning_percentage: number;
  
  /** Enable automatic handoff when threshold exceeded (default: true) */
  handoff_enabled: boolean;
  
  /** Directory for handoff files */
  handoff_directory: string;
  
  /** When to display context information */
  display_mode: DisplayMode;
  
  /** Override token budget (null = auto-detect from model) */
  token_budget_override: number | null;
  
  /** Model name for budget detection */
  model_name: string | null;
  
  /** Session file path (null = auto-detect) */
  session_path: string | null;
}

/**
 * Get the default KIRO directory path
 */
export function getDefaultKiroDir(): string {
  const homeDir = os.homedir();
  return path.join(homeDir, '.kiro');
}

/**
 * Resolve path with template variables
 */
export function resolvePathWithTemplates(templatePath: string): string {
  const kiroDir = getDefaultKiroDir();
  return templatePath.replace(/\{\{\s*KIRO_DIR\s*\}\}/g, kiroDir);
}

/**
 * Default configuration values
 */
export const DEFAULT_CONFIG: ContextMonitorConfig = {
  threshold_percentage: 70,
  warning_percentage: 60,
  handoff_enabled: true,
  handoff_directory: '{{KIRO_DIR}}/handoffs',
  display_mode: 'always',
  token_budget_override: null,
  model_name: null,
  session_path: null,
};

/**
 * Create a configuration with defaults applied
 */
export function createContextMonitorConfig(
  partial?: Partial<ContextMonitorConfig>
): ContextMonitorConfig {
  const config = { ...DEFAULT_CONFIG, ...partial };
  
  // Resolve template variables in paths
  config.handoff_directory = resolvePathWithTemplates(config.handoff_directory);
  
  return config;
}

/**
 * Get token budget for a model
 */
export function getTokenBudget(modelName: string | null, override: number | null = null): number {
  if (override !== null) {
    return override;
  }
  
  if (!modelName) {
    return DEFAULT_MODEL_BUDGETS['default'];
  }
  
  // Try exact match first
  if (DEFAULT_MODEL_BUDGETS[modelName]) {
    return DEFAULT_MODEL_BUDGETS[modelName];
  }
  
  // Try partial match (e.g., "claude-3-5-sonnet-20241022" -> "claude-3.5-sonnet")
  const normalizedModelName = modelName.toLowerCase();
  for (const [key, budget] of Object.entries(DEFAULT_MODEL_BUDGETS)) {
    if (normalizedModelName.includes(key.toLowerCase()) || key.toLowerCase().includes(normalizedModelName)) {
      return budget;
    }
  }
  
  return DEFAULT_MODEL_BUDGETS['default'];
}

/**
 * Determine threshold status based on percentage
 */
export function getThresholdStatus(
  percentage: number,
  config: ContextMonitorConfig
): ThresholdStatus {
  if (percentage >= config.threshold_percentage) {
    return 'exceeded';
  }
  if (percentage >= config.threshold_percentage - 10) {
    return 'critical';
  }
  if (percentage >= config.warning_percentage) {
    return 'warning';
  }
  return 'safe';
}

/**
 * Get recommended action based on status
 */
export function getRecommendedAction(status: ThresholdStatus): string {
  switch (status) {
    case 'exceeded':
      return 'Initiate handoff to new session immediately. Context window is critically full.';
    case 'critical':
      return 'Prepare for handoff. Consider summarizing and archiving completed work.';
    case 'warning':
      return 'Monitor context usage. Start planning session handoff.';
    case 'safe':
      return 'Context usage is within safe limits.';
  }
}
