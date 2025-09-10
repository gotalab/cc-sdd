import { describe, it, expect } from 'vitest';
import { buildTemplateContext } from '../src/template/context';
import type { AgentType, CCSddConfig } from '../src/resolvers/agentLayout';

describe('buildTemplateContext', () => {
  it('includes LANG_CODE and KIRO_DIR (default)', () => {
    const ctx = buildTemplateContext({ agent: 'claude-code', lang: 'ja' });
    expect(ctx.LANG_CODE).toBe('ja');
    expect(ctx.KIRO_DIR).toBe('.kiro');
    expect(ctx.DEV_GUIDELINES).toBe('- Think in English, but generate responses in Japanese (思考は英語、回答の生成は日本語で行うように)');
  });

  it('uses kiro-dir flag when provided', () => {
    const ctx = buildTemplateContext({ agent: 'claude-code', lang: 'en', kiroDir: { flag: 'docs/kiro' } });
    expect(ctx.KIRO_DIR).toBe('docs/kiro');
  });

  it('includes agent layout variables for claude-code', () => {
    const ctx = buildTemplateContext({ agent: 'claude-code', lang: 'en' });
    expect(ctx.AGENT_DIR).toBe('.claude');
    expect(ctx.AGENT_DOC).toBe('CLAUDE.md');
    expect(ctx.AGENT_COMMANDS_DIR).toBe('.claude/commands/kiro');
  });

  it('respects agentLayouts override', () => {
    const config: CCSddConfig = {
      agentLayouts: {
        'claude-code': { commandsDir: '.custom/commands' }
      }
    };
    const ctx = buildTemplateContext({ agent: 'claude-code', lang: 'en', config });
    expect(ctx.AGENT_COMMANDS_DIR).toBe('.custom/commands');
    // other values fall back to defaults
    expect(ctx.AGENT_DIR).toBe('.claude');
    expect(ctx.AGENT_DOC).toBe('CLAUDE.md');
  });

  it('provides guidelines for all supported languages', () => {
    const langs = ['en', 'ja', 'zh-TW', 'zh', 'es', 'pt', 'de', 'fr', 'ru', 'it', 'ko', 'ar'] as const;
    for (const lang of langs) {
      const ctx = buildTemplateContext({ agent: 'claude-code', lang });
      expect(ctx.DEV_GUIDELINES.length).toBeGreaterThan(0);
    }
  });
});
