/**
 * Claude Code Statusline Reader
 *
 * Primary reader for Claude Code. Reads `.claude/context-status.json`
 * written by Claude Code's statusline hook (registered via context-monitor --statusline).
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import type { SessionReader, SessionReaderResult } from './index.js';

/**
 * Statusline data written by the statusline hook
 */
interface StatuslineData {
  used_percentage?: number;
  context_window_size?: number;
  total_input_tokens?: number;
  session_id?: string;
  [key: string]: unknown;
}

/**
 * Return candidate paths for the statusline context file, in priority order.
 * CWD-local takes precedence over the global home-dir fallback.
 */
function getStatuslineFilePaths(): string[] {
  return [
    path.join(process.cwd(), '.claude', 'context-status.json'),
    path.join(os.homedir(), '.claude', 'context-status.json'),
  ];
}

/**
 * Return the first statusline file that exists, or null.
 */
function findStatuslineFile(): string | null {
  for (const filePath of getStatuslineFilePaths()) {
    if (fs.existsSync(filePath)) {
      return filePath;
    }
  }
  return null;
}

/**
 * Parse the statusline JSON file. Returns null on error.
 */
function parseStatuslineFile(filePath: string): StatuslineData | null {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content) as StatuslineData;
  } catch (err) {
    console.error('[context-monitor] Failed to parse statusline file:', err);
    return null;
  }
}

/**
 * Claude Code statusline-based session reader.
 * Uses the official statusline hook API — most accurate source available.
 */
export const claudeCodeStatuslineReader: SessionReader = {
  name: 'claude-code-statusline',

  async isAvailable(): Promise<boolean> {
    return findStatuslineFile() !== null;
  },

  async getContextInfo(): Promise<SessionReaderResult> {
    const filePath = findStatuslineFile();

    if (!filePath) {
      return {
        success: false,
        error: 'No statusline context file found (.claude/context-status.json)',
        reader: this.name,
      };
    }

    const data = parseStatuslineFile(filePath);

    if (!data) {
      return {
        success: false,
        error: `Failed to parse statusline file: ${filePath}`,
        reader: this.name,
      };
    }

    const usedPercentage = typeof data.used_percentage === 'number' ? data.used_percentage : undefined;
    const contextWindowSize = typeof data.context_window_size === 'number' ? data.context_window_size : undefined;
    const totalInputTokens = typeof data.total_input_tokens === 'number' ? data.total_input_tokens : undefined;

    // Prefer percentage + window-size pair (most accurate)
    if (usedPercentage !== undefined && contextWindowSize !== undefined) {
      const usedTokens = Math.round((usedPercentage / 100) * contextWindowSize);
      return {
        success: true,
        data: {
          usedTokens,
          model: null,
          source: 'statusline',
        },
        reader: this.name,
      };
    }

    // Fall back to raw token count
    if (totalInputTokens !== undefined) {
      return {
        success: true,
        data: {
          usedTokens: totalInputTokens,
          model: null,
          source: 'statusline',
        },
        reader: this.name,
      };
    }

    return {
      success: false,
      error: 'Statusline file does not contain usable context information',
      reader: this.name,
    };
  },
};

export default claudeCodeStatuslineReader;
