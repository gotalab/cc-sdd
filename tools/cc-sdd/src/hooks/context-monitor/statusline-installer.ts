/**
 * Statusline Hook Installer
 *
 * Utility to install the context-monitor statusline hook into
 * ~/.claude/settings.json so Claude Code calls the writer on each turn.
 */

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import * as path from 'node:path';
import * as os from 'node:os';
import { fileExists } from '../../utils/fs.js';

const CLAUDE_SETTINGS_PATH = path.join(os.homedir(), '.claude', 'settings.json');
const STATUSLINE_COMMAND = 'cc-sdd-statusline';

/**
 * The statusLine value written to settings.json.
 * Claude Code requires an object with type + command (camelCase key).
 */
const STATUSLINE_VALUE = { type: 'command', command: STATUSLINE_COMMAND };

/**
 * Install the statusline hook into ~/.claude/settings.json.
 *
 * Reads the existing settings (creating the file if absent), merges the
 * `statusline` key, and writes the result back atomically via a temp file.
 *
 * @param _projectDir - reserved for future per-project installation; unused.
 */
export async function installStatuslineHook(_projectDir?: string): Promise<void> {
  const settingsDir = path.dirname(CLAUDE_SETTINGS_PATH);

  // Ensure ~/.claude/ directory exists
  await mkdir(settingsDir, { recursive: true });

  // Read existing settings or start from an empty object
  let settings: Record<string, unknown> = {};
  if (await fileExists(CLAUDE_SETTINGS_PATH)) {
    try {
      const raw = await readFile(CLAUDE_SETTINGS_PATH, 'utf-8');
      settings = JSON.parse(raw) as Record<string, unknown>;
    } catch (err) {
      throw new Error(`Failed to parse ${CLAUDE_SETTINGS_PATH}: ${err}`);
    }
  }

  // Merge the statusLine key (camelCase, object format required by Claude Code)
  settings.statusLine = STATUSLINE_VALUE;

  // Write back atomically via a sibling temp file
  const tmpPath = CLAUDE_SETTINGS_PATH + '.tmp';
  const json = JSON.stringify(settings, null, 2) + '\n';
  try {
    await writeFile(tmpPath, json, 'utf-8');
    // Rename is atomic on POSIX; on Windows it falls back to a copy+delete
    const { rename } = await import('node:fs/promises');
    await rename(tmpPath, CLAUDE_SETTINGS_PATH);
  } catch (err) {
    throw new Error(`Failed to write ${CLAUDE_SETTINGS_PATH}: ${err}`);
  }
}
