#!/usr/bin/env node
/**
 * cc-sdd-statusline
 *
 * Registered as the Claude Code `statusline` command via ~/.claude/settings.json:
 *   { "statusline": "cc-sdd-statusline" }
 *
 * Reads JSON from stdin (Claude Code statusline format), writes the full
 * JSON to `.claude/context-status.json` in the session's cwd, and outputs
 * a formatted status line to stdout for Claude Code to display.
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'node:url';

async function main(): Promise<void> {
  // Read raw JSON from stdin
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk as Buffer);
  }
  const input = Buffer.concat(chunks).toString('utf-8').trim();

  if (!input) {
    process.stdout.write('CTX: ?\n');
    return;
  }

  let data: Record<string, unknown>;
  try {
    data = JSON.parse(input) as Record<string, unknown>;
  } catch (err) {
    process.stderr.write(`[context-monitor] Failed to parse statusline input: ${err}\n`);
    process.stdout.write('CTX: ?\n');
    return;
  }

  // Write to .claude/context-status.json in CWD
  const outputDir = path.join(process.cwd(), '.claude');
  const outputPath = path.join(outputDir, 'context-status.json');

  try {
    fs.mkdirSync(outputDir, { recursive: true });
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2) + '\n', 'utf-8');
  } catch (err) {
    // Log but continue — statusline output must still be produced
    process.stderr.write(`[context-monitor] Failed to write context-status.json: ${err}\n`);
  }

  // Format and emit the status line.
  // Claude Code nests the percentage at context_window.used_percentage; fall back
  // to the top-level used_percentage for any older/alternate payload shapes.
  const contextWindow = data.context_window as Record<string, unknown> | undefined;
  const usedPercentage =
    typeof contextWindow?.used_percentage === 'number'
      ? contextWindow.used_percentage
      : typeof data.used_percentage === 'number'
        ? data.used_percentage
        : null;

  let statusLine: string;
  if (usedPercentage !== null) {
    const emoji = usedPercentage >= 70 ? '🔴' : usedPercentage >= 60 ? '⚠️' : '✅';
    statusLine = `CTX: ${usedPercentage.toFixed(1)}% ${emoji}`;
  } else {
    statusLine = 'CTX: ?';
  }

  process.stdout.write(statusLine + '\n');
}

export { main as runStatuslineWriter };

// Run when invoked directly as a binary.
// Using fileURLToPath + realpathSync on both sides makes the check stable across
// Windows path formats, paths containing spaces, and symlinked bin shims.
const _thisFile = fs.realpathSync(fileURLToPath(import.meta.url));
const _entryFile = fs.realpathSync(process.argv[1]);
if (_thisFile === _entryFile) {
  main().catch(err => {
    process.stderr.write(`[context-monitor] Unexpected error: ${err}\n`);
    process.exit(1);
  });
}
