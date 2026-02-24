/**
 * Session Readers Index
 *
 * Exports the two official session readers:
 *  - claudeCodeStatuslineReader: reads .claude/context-status.json written by the CC statusline hook
 *  - openCodeStatusReader: reads .opencode/context-status.json written by the OpenCode plugin
 */

import { claudeCodeStatuslineReader } from './claude-code-statusline.js';
import { openCodeStatusReader } from './opencode-status.js';

/**
 * Context information extracted from a session
 */
export interface ContextInfo {
  /** Number of tokens used in the session */
  usedTokens: number;

  /** Model name if available */
  model: string | null;

  /** Source of the token count information */
  source: 'statusline' | 'usage-metadata';
}

/**
 * Result from a session reader
 */
export interface SessionReaderResult {
  /** Whether the read was successful */
  success: boolean;

  /** Context info if successful */
  data?: ContextInfo;

  /** Error message if unsuccessful */
  error?: string;

  /** Name of the reader that produced this result */
  reader: string;
}

/**
 * Session reader interface
 */
export interface SessionReader {
  /** Name of the reader */
  name: string;

  /** Check if this reader is available for the current environment */
  isAvailable(): Promise<boolean>;

  /** Get context info from the session */
  getContextInfo(sessionPath?: string): Promise<SessionReaderResult>;
}

// Re-export individual readers
export { claudeCodeStatuslineReader } from './claude-code-statusline.js';
export { openCodeStatusReader } from './opencode-status.js';
