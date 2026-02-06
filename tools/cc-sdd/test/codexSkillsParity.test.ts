import { describe, it, expect } from 'vitest';
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

const repoRoot = join(process.cwd(), '..', '..');
const codexCommandsDir = join(repoRoot, 'tools/cc-sdd/templates/agents/codex/commands');
const codexSkillsDir = join(repoRoot, 'tools/cc-sdd/templates/agents/codex-skills/skills');

const stripSkillFrontmatter = (content: string): string =>
  content.replace(/^---\n[\s\S]*?\n---\n\n?/, '');

describe('codex skills parity', () => {
  it('keeps SKILL.md body identical to codex command templates', async () => {
    const commandFiles = (await readdir(codexCommandsDir)).filter((name) => name.endsWith('.md'));
    const commandBaseNames = commandFiles.map((name) => name.replace(/\.md$/, '')).sort();
    const skillDirs = (await readdir(codexSkillsDir)).sort();

    expect(skillDirs).toEqual(commandBaseNames);

    for (const baseName of commandBaseNames) {
      const commandPath = join(codexCommandsDir, `${baseName}.md`);
      const skillPath = join(codexSkillsDir, baseName, 'SKILL.md');

      const [commandContent, skillContent] = await Promise.all([
        readFile(commandPath, 'utf8'),
        readFile(skillPath, 'utf8'),
      ]);

      expect(stripSkillFrontmatter(skillContent)).toEqual(commandContent);
    }
  });
});
