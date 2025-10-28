import { describe, it, expect } from 'vitest';
import { runCli } from '../src/index';
import { join } from 'node:path';
import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { makeIO, getRepoRoot } from './helpers/testUtils.js';

const runtime = { platform: 'darwin' } as const;
const repoRoot = getRepoRoot();
const manifestPath = join(repoRoot, 'tools/cc-sdd/templates/manifests/cursor.json');

describe('real cursor manifest', () => {
  it('dry-run prints plan for cursor.json with placeholders applied (mac)', async () => {
    const ctx = makeIO();
    const code = await runCli(['--dry-run', '--lang', 'en', '--agent', 'cursor', '--manifest', manifestPath], runtime, ctx.io, {});
    expect(code).toBe(0);
    const out = ctx.logs.join('\n');
    expect(out).toMatch(/Plan \(dry-run\)/);
    expect(out).toContain('[templateDir] commands: templates/agents/cursor/commands -> .cursor/commands/kiro');
    expect(out).toContain('[templateFile] doc_main: templates/agents/cursor/docs/AGENTS.md -> ./AGENTS.md');
    expect(out).toContain('[templateDir] settings_common: templates/shared/settings -> .kiro/settings');
  });
  it('dry-run prints plan including commands for linux via mac template', async () => {
    const ctx = makeIO();
    const runtimeLinux = { platform: 'linux' } as const;
    const code = await runCli(['--dry-run', '--lang', 'en', '--agent', 'cursor', '--manifest', manifestPath], runtimeLinux, ctx.io, {});
    expect(code).toBe(0);
    const out = ctx.logs.join('\n');
    expect(out).toMatch(/Plan \(dry-run\)/);
    expect(out).toContain('[templateDir] commands: templates/agents/cursor/commands -> .cursor/commands/kiro');
    expect(out).toContain('[templateFile] doc_main: templates/agents/cursor/docs/AGENTS.md -> ./AGENTS.md');
    expect(out).toContain('[templateDir] settings_common: templates/shared/settings -> .kiro/settings');
  });
  
  it('shows cursor recommendation message after applying plan', async () => {
    const ctx = makeIO();
    
    // Create a temporary directory for execution 
    const tmpDir = await mkdtemp(join(tmpdir(), 'ccsdd-cursor-test-'));
    
    // Use the actual templates directory from the project
    const templatesRoot = join(repoRoot, 'tools/cc-sdd');
    
    const code = await runCli(['--lang', 'en', '--agent', 'cursor', '--manifest', manifestPath, '--yes'], runtime, ctx.io, {}, { cwd: tmpDir, templatesRoot });
    
    expect(code).toBe(0);
    const out = ctx.logs.join('\n');
    
    // Check that the setup completion message is present (new format)
    expect(out).toMatch(/Setup completed: written=\d+, skipped=\d+/);
    
    // Check that the Cursor-specific recommended models are shown
    expect(out).toContain('Recommended models');
    expect(out).toContain('Claude 4.5 Sonnet');
    expect(out).toContain('GPT-5-Codex');

    // Check that the unified next steps are present
    expect(out).toContain("Launch Cursor IDE and run `/kiro/spec-init <what-to-build>` to create a new specification.");
    expect(out).toMatch(
      /Tip: Steering holds persistent project knowledge—patterns, standards, and org-wide policies\. Kick off `\/kiro\/steering` \(essential for existing projects\) and\s+`\/kiro\/steering-custom(?: <what-to-create-custom-steering-document>)?`\. Maintain Regularly/,
    );
    expect(out).toContain(
      'Tip: Update `{{KIRO_DIR}}/settings/templates/` like `requirements.md`, `design.md`, and `tasks.md` so the generated steering and specs follow your team\'s and project\'s development process.',
    );
  });
});
