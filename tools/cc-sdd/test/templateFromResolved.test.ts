import { describe, it, expect } from 'vitest';
import { contextFromResolved } from '../src/template/fromResolved';
import { mergeConfigAndArgs } from '../src/cli/config';
import { parseArgs } from '../src/cli/args';

const runtimeDarwin = { platform: 'darwin' } as const;

describe('contextFromResolved', () => {
  it('creates template context from resolved config with default values', () => {
    const args = parseArgs([]);
    const resolved = mergeConfigAndArgs(args, {}, runtimeDarwin);
    const ctx = contextFromResolved(resolved);

    expect(ctx.LANG_CODE).toBe('en');
    expect(ctx.KIRO_DIR).toBe('.kiro');
    expect(ctx.AGENT_DIR).toBe('.claude');
    expect(ctx.AGENT_DOC).toBe('CLAUDE.md');
    expect(ctx.AGENT_COMMANDS_DIR).toBe('.claude/commands/kiro');
    expect(ctx.DEV_GUIDELINES).toBe(
      '- Think in English, generate responses in English. All Markdown content written to project files (e.g., requirements.md, design.md, tasks.md, research.md, validation reports) MUST be written in the target language configured for this specification (see spec.json.language).',
    );
  });

  it('creates template context with custom configuration', () => {
    const args = parseArgs(['--lang', 'ja', '--kiro-dir', 'docs/kiro', '--agent', 'gemini-cli']);
    const config = {
      agentLayouts: {
        'gemini-cli': { commandsDir: '.custom/commands' }
      }
    };
    const resolved = mergeConfigAndArgs(args, config, runtimeDarwin);
    const ctx = contextFromResolved(resolved);

    expect(ctx.LANG_CODE).toBe('ja');
    expect(ctx.KIRO_DIR).toBe('docs/kiro');
    expect(ctx.AGENT_DIR).toBe('.gemini');
    expect(ctx.AGENT_DOC).toBe('GEMINI.md');
    expect(ctx.AGENT_COMMANDS_DIR).toBe('.custom/commands');
    expect(ctx.DEV_GUIDELINES).toBe(
      '- Think in English, generate responses in Japanese. All Markdown content written to project files (e.g., requirements.md, design.md, tasks.md, research.md, validation reports) MUST be written in the target language configured for this specification (see spec.json.language).',
    );
  });

  it('creates template context for qwen-code agent', () => {
    const args = parseArgs(['--agent', 'qwen-code', '--lang', 'zh-TW']);
    const resolved = mergeConfigAndArgs(args, {}, runtimeDarwin);
    const ctx = contextFromResolved(resolved);

    expect(ctx.LANG_CODE).toBe('zh-TW');
    expect(ctx.KIRO_DIR).toBe('.kiro');
    expect(ctx.AGENT_DIR).toBe('.qwen');
    expect(ctx.AGENT_DOC).toBe('QWEN.md');
    expect(ctx.AGENT_COMMANDS_DIR).toBe('.qwen/commands/kiro');
    expect(ctx.DEV_GUIDELINES).toBe(
      '- Think in English, generate responses in Traditional Chinese. All Markdown content written to project files (e.g., requirements.md, design.md, tasks.md, research.md, validation reports) MUST be written in the target language configured for this specification (see spec.json.language).',
    );
  });

  it('preserves all layout properties correctly', () => {
    const args = parseArgs(['--kiro-dir', 'custom-kiro']);
    const config = {
      agentLayouts: {
        'claude-code': { 
          commandsDir: '.custom/commands/path',
          agentDir: '.custom-agent',
          docFile: 'CUSTOM-DOC.md'
        }
      }
    };
    const resolved = mergeConfigAndArgs(args, config, runtimeDarwin);
    const ctx = contextFromResolved(resolved);

    expect(ctx.LANG_CODE).toBe('en');
    expect(ctx.KIRO_DIR).toBe('custom-kiro');
    expect(ctx.AGENT_DIR).toBe('.custom-agent');
    expect(ctx.AGENT_DOC).toBe('CUSTOM-DOC.md');
    expect(ctx.AGENT_COMMANDS_DIR).toBe('.custom/commands/path');
    expect(ctx.DEV_GUIDELINES).toBe(
      '- Think in English, generate responses in English. All Markdown content written to project files (e.g., requirements.md, design.md, tasks.md, research.md, validation reports) MUST be written in the target language configured for this specification (see spec.json.language).',
    );
  });
});
