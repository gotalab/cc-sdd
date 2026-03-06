/**
 * Claude Code Hooks Installer
 *
 * Registers cc-sdd context monitoring hooks in the project-level
 * .claude/settings.json so Claude Code calls them on every tool use,
 * session start, and subagent start.
 */

import { readFile, writeFile, mkdir, chmod } from 'node:fs/promises';
import * as path from 'node:path';
import { fileExists } from '../../utils/fs.js';

interface HookEntry {
  type: 'command';
  command: string;
}

interface HookMatcherGroup {
  matcher?: string;
  hooks: HookEntry[];
}

interface HooksConfig {
  PostToolUse?: HookMatcherGroup[];
  SessionStart?: HookMatcherGroup[];
  SubagentStart?: HookMatcherGroup[];
  SessionEnd?: HookMatcherGroup[];
}

const HOOK_COMMANDS = {
  postToolUse: '.claude/hooks/post-tool-use.sh',
  sessionStart: '.claude/hooks/session-start.sh',
  subagentStart: '.claude/hooks/subagent-start.sh',
  sessionEnd: '.claude/hooks/session-end.sh',
} as const;

function isAlreadyRegistered(groups: HookMatcherGroup[], command: string): boolean {
  return groups.some((g) => g.hooks.some((h) => h.command === command));
}

function addHookToGroups(
  groups: HookMatcherGroup[],
  entry: HookEntry,
  matcher?: string,
): HookMatcherGroup[] {
  if (isAlreadyRegistered(groups, entry.command)) return groups;
  const group: HookMatcherGroup = matcher !== undefined ? { matcher, hooks: [entry] } : { hooks: [entry] };
  return [...groups, group];
}

/**
 * Register cc-sdd hooks in the project-level .claude/settings.json.
 *
 * Reads existing settings (creating the file if absent), merges the hook
 * entries idempotently, then writes the result back.
 *
 * @param projectDir - Root directory of the project (where .claude/ lives).
 */
export async function installProjectHooks(projectDir: string): Promise<void> {
  const settingsPath = path.join(projectDir, '.claude', 'settings.json');
  const settingsDir = path.dirname(settingsPath);

  await mkdir(settingsDir, { recursive: true });

  let settings: Record<string, unknown> = {};
  if (await fileExists(settingsPath)) {
    try {
      const raw = await readFile(settingsPath, 'utf-8');
      settings = JSON.parse(raw) as Record<string, unknown>;
    } catch (err) {
      throw new Error(`Failed to parse ${settingsPath}: ${err}`);
    }
  }

  const hooks = ((settings.hooks ?? {}) as HooksConfig);

  // Register PostToolUse hook (no matcher = match all tools)
  hooks.PostToolUse = addHookToGroups(
    hooks.PostToolUse ?? [],
    { type: 'command', command: HOOK_COMMANDS.postToolUse },
  );

  // Register SessionStart hook (no matcher = match all session start sources)
  hooks.SessionStart = addHookToGroups(
    hooks.SessionStart ?? [],
    { type: 'command', command: HOOK_COMMANDS.sessionStart },
  );

  // Register SubagentStart hook — injects SUBAGENT_AGENT_ID into each spawned
  // agent's context via hookSpecificOutput.additionalContext so the agent can
  // look up its own context file rather than the inherited parent session file.
  hooks.SubagentStart = addHookToGroups(
    hooks.SubagentStart ?? [],
    { type: 'command', command: HOOK_COMMANDS.subagentStart },
  );

  // Register SessionEnd hook — deletes context files when session ends
  hooks.SessionEnd = addHookToGroups(
    hooks.SessionEnd ?? [],
    { type: 'command', command: HOOK_COMMANDS.sessionEnd },
  );

  settings.hooks = hooks;

  const json = JSON.stringify(settings, null, 2) + '\n';
  await writeFile(settingsPath, json, 'utf-8');

  // Ensure all hook scripts are executable (template files may be copied without
  // the execute bit set, which causes Claude Code to report a startup hook error).
  const hookScripts = Object.values(HOOK_COMMANDS).map((rel) => path.join(projectDir, rel));
  await Promise.all(
    hookScripts.map(async (scriptPath) => {
      if (await fileExists(scriptPath)) {
        await chmod(scriptPath, 0o755);
      }
    }),
  );
}
