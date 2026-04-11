import { buildSharedRuleOperations, parseSharedRules } from '../src/plan/sharedRules';
import { describe, it, expect } from 'vitest';
import { mkdtemp, mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { parseArgs } from '../src/cli/args.js';
import { mergeConfigAndArgs } from '../src/cli/config.js';
const runtimeDarwin = { platform: 'darwin' } as const;
const mkTmp = async () => mkdtemp(join(tmpdir(), 'ccsdd-shared-rules-'));

describe('parseSharedRules', () => {
  it('parses comma-separated shared-rules from metadata', () => {
    const content = `---
name: kiro-spec-design
description: Some description
metadata:
  shared-rules: "design-principles.md, design-discovery-full.md, design-synthesis.md"
---

# Body`;
    expect(parseSharedRules(content)).toEqual([
      'design-principles.md',
      'design-discovery-full.md',
      'design-synthesis.md',
    ]);
  });

  it('returns empty array when no metadata block', () => {
    const content = `---
name: kiro-spec-init
description: Some description
---

# Body`;
    expect(parseSharedRules(content)).toEqual([]);
  });

  it('returns empty array when metadata has no shared-rules', () => {
    const content = `---
name: kiro-spec-init
description: Some description
metadata:
  other-key: "value"
---

# Body`;
    expect(parseSharedRules(content)).toEqual([]);
  });

  it('returns empty array when shared-rules value is empty', () => {
    const content = `---
name: kiro-spec-init
description: Some description
metadata:
  shared-rules: ""
---

# Body`;
    expect(parseSharedRules(content)).toEqual([]);
  });

  it('trims whitespace from rule names', () => {
    const content = `---
name: test
description: test
metadata:
  shared-rules: "  foo.md ,  bar.md  "
---`;
    expect(parseSharedRules(content)).toEqual(['foo.md', 'bar.md']);
  });

  it('handles single value without comma', () => {
    const content = `---
name: test
description: test
metadata:
  shared-rules: "design-review.md"
---`;
    expect(parseSharedRules(content)).toEqual(['design-review.md']);
  });

  it('returns empty array when no frontmatter', () => {
    const content = `# No frontmatter here`;
    expect(parseSharedRules(content)).toEqual([]);
  });

  it('handles unquoted shared-rules value', () => {
    const content = `---
name: test
description: test
metadata:
  shared-rules: steering-principles.md
---`;
    expect(parseSharedRules(content)).toEqual(['steering-principles.md']);
  });

  it('handles CRLF frontmatter line endings', () => {
    const content = '---\r\n'
      + 'name: test\r\n'
      + 'description: test\r\n'
      + 'metadata:\r\n'
      + '  shared-rules: "design-principles.md, design-synthesis.md"\r\n'
      + '---\r\n';
    expect(parseSharedRules(content)).toEqual(['design-principles.md', 'design-synthesis.md']);
  });
});

describe('buildSharedRuleOperations', () => {
  it('rejects path traversal in shared rule names', async () => {
    const templatesRoot = await mkTmp();
    const cwd = await mkTmp();
    await mkdir(join(templatesRoot, 'templates/shared/settings/rules'), { recursive: true });
    await writeFile(join(templatesRoot, 'templates/shared/settings/rules/design.md'), 'rule', 'utf8');

    const resolved = mergeConfigAndArgs(parseArgs([]), {}, runtimeDarwin);
    await expect(
      buildSharedRuleOperations(
        ['../escape.md'],
        join(cwd, '.agents/skills/kiro-test'),
        templatesRoot,
        'skill',
        cwd,
        resolved,
        {
          LANG_CODE: 'en',
          DEV_GUIDELINES: 'guidelines',
          KIRO_DIR: '.kiro',
          AGENT_DIR: '.agents',
          AGENT_DOC: 'AGENTS.md',
          AGENT_COMMANDS_DIR: '.agents/skills',
        },
      ),
    ).rejects.toThrow(/invalid shared rule name/i);
  });
});
