import { describe, it, expect } from 'vitest';
import { mkdtemp, readFile, readdir, rm } from 'node:fs/promises';
import { join, basename, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { runCli } from '../src/index';

const templatesRoot = process.cwd();
const agentsRoot = join(templatesRoot, 'templates/agents');
const manifests = (await readdir(join(templatesRoot, 'templates/manifests')))
  .filter(name => name.endsWith('.json') && name !== 'codex.json')
  .map(name => name.slice(0, -5));

async function filesUnder(root: string): Promise<string[]> {
  const files: string[] = [];
  for (const entry of await readdir(root, { withFileTypes: true })) {
    const path = join(root, entry.name);
    if (entry.isDirectory()) files.push(...await filesUnder(path));
    else files.push(path);
  }
  return files;
}

async function completionPrompts(root: string) {
  const prompts: { path: string; text: string; implementation: boolean }[] = [];
  for (const path of await filesUnder(root)) {
    const name = basename(path);
    const skill = basename(dirname(path));
    if (!(name.includes('impl') || (name === 'SKILL.md' && ['kiro-impl', 'kiro-validate-impl'].includes(skill)))) continue;
    const text = await readFile(path, 'utf8');
    // Wrapper commands delegate to an agent; inspect the actual executor/validator.
    if (!text.includes('## Execution Steps') && skill !== 'kiro-impl') continue;
    prompts.push({ path, text, implementation: !path.includes('validate-impl') });
  }
  return prompts;
}

function expectHierarchyContract(text: string) {
  expect(text).toContain('A major task with sub-tasks is a container');
  expect(text).toContain('A major task without sub-tasks is an executable task');
  expect(text).toContain('all of its sub-tasks are `[x]`');
  expect(text).toContain('including optional `*` sub-tasks');
  expect(text).toContain('unchecked or blocked');
}

// These are prompt/installation contract tests, not simulated LLM execution.
describe('Issue #202: task hierarchy completion contract', () => {
  it('keeps checkbox-based major-only and major + sub-task formats with explicit roll-up semantics', async () => {
    const template = await readFile(join(templatesRoot, 'templates/shared/settings/templates/specs/tasks.md'), 'utf8');
    expect(template).toContain('- [ ] {{NUMBER}}.{{PARALLEL_MARK}} {{TASK_DESCRIPTION}}');
    expect(template).toContain('- [ ] {{MAJOR_NUMBER}}. {{MAJOR_TASK_SUMMARY}}');
    expectHierarchyContract(template);
    const rules = await readFile(join(templatesRoot, 'templates/shared/settings/rules/tasks-generation.md'), 'utf8');
    expectHierarchyContract(rules);
  });

  it('reproduces the missing parent roll-up and standalone-major rules across every executor/validator', async () => {
    const prompts = await completionPrompts(agentsRoot);
    expect(prompts).toHaveLength(36);
    for (const { path, text, implementation } of prompts) {
      expect.soft(text, path).not.toContain('Major tasks (1., 2.) are grouping headers, not execution units');
      expectHierarchyContract(text);
      if (implementation) {
        expect(text).toContain('After each task checkbox update');
        expect(text).toContain('Selecting a container task number expands to its executable sub-tasks');
      } else {
        expect(text).toContain('A stale parent checkbox alone must not cause NO-GO');
        expect(text).toContain('Do not modify tasks.md during validation');
        expect(text).toContain('For explicit sub-task validation, unchecked siblings outside the selected scope do not fail that sub-task');
      }
    }
  });

  it.each(manifests)('installs consistent completion instructions for %s', async (agent) => {
    const cwd = await mkdtemp(join(tmpdir(), 'ccsdd-task-completion-'));
    try {
      const errors: string[] = [];
      const code = await runCli(
        ['--agent', agent, '--lang', 'en', '--kiro-dir', 'specs-config', '--overwrite=force'],
        { platform: 'darwin' },
        { log: () => {}, error: message => errors.push(message), exit: () => {} },
        {}, { cwd, templatesRoot },
      );
      expect(code, errors.join('\n')).toBe(0);
      const prompts = await completionPrompts(cwd);
      expect(prompts.filter(p => p.implementation)).toHaveLength(1);
      expect(prompts.filter(p => !p.implementation)).toHaveLength(1);
      for (const { text } of prompts) expectHierarchyContract(text);
      const taskTemplate = await readFile(join(cwd, 'specs-config/settings/templates/specs/tasks.md'), 'utf8');
      expectHierarchyContract(taskTemplate);
    } finally {
      await rm(cwd, { recursive: true, force: true });
    }
  });
});
