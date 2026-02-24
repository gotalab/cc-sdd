/**
 * OpenCode Status File Reader
 *
 * Primary reader for OpenCode. Reads `.opencode/context-status.json` written
 * by the `context-monitor` OpenCode plugin (installed via `cc-sdd --agent opencode-agent`).
 *
 * The plugin calls `client.session.messages()` inside OpenCode's runtime and
 * extracts exact token counts from `message.info.tokens`, then writes them here.
 * This gives the same accuracy as querying OpenCode's internal API directly.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import type { SessionReader, SessionReaderResult } from './index.js';

interface OpenCodeStatusData {
  session_id?: string;
  model?: string;
  total_tokens?: number;
  input_tokens?: number;
  output_tokens?: number;
  reasoning_tokens?: number;
  cache_read_tokens?: number;
  cache_write_tokens?: number;
  timestamp?: string;
  [key: string]: unknown;
}

/**
 * Candidate paths for the OpenCode context status file, in priority order.
 */
function getStatusFilePaths(): string[] {
  return [
    path.join(process.cwd(), '.opencode', 'context-status.json'),
    path.join(os.homedir(), '.opencode', 'context-status.json'),
  ];
}

function findStatusFile(): string | null {
  for (const p of getStatusFilePaths()) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

function parseStatusFile(filePath: string): OpenCodeStatusData | null {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content) as OpenCodeStatusData;
  } catch (err) {
    console.error('[context-monitor] Failed to parse OpenCode context-status.json:', err);
    return null;
  }
}

export const openCodeStatusReader: SessionReader = {
  name: 'opencode-status',

  async isAvailable(): Promise<boolean> {
    return findStatusFile() !== null;
  },

  async getContextInfo(): Promise<SessionReaderResult> {
    const filePath = findStatusFile();

    if (!filePath) {
      return {
        success: false,
        error: 'No OpenCode context-status.json found. Install the context-monitor plugin via cc-sdd --agent opencode-agent.',
        reader: this.name,
      };
    }

    const data = parseStatusFile(filePath);
    if (!data) {
      return {
        success: false,
        error: `Failed to parse OpenCode context status file: ${filePath}`,
        reader: this.name,
      };
    }

    // Prefer the pre-computed total; fall back to summing individual fields
    const totalTokens =
      typeof data.total_tokens === 'number'
        ? data.total_tokens
        : (Number(data.input_tokens) || 0) +
          (Number(data.output_tokens) || 0) +
          (Number(data.reasoning_tokens) || 0) +
          (Number(data.cache_read_tokens) || 0) +
          (Number(data.cache_write_tokens) || 0);

    if (totalTokens === 0) {
      return {
        success: false,
        error: 'OpenCode context-status.json contains no token data yet.',
        reader: this.name,
      };
    }

    return {
      success: true,
      data: {
        usedTokens: totalTokens,
        model: typeof data.model === 'string' ? data.model : null,
        source: 'usage-metadata',
      },
      reader: this.name,
    };
  },
};

export default openCodeStatusReader;
