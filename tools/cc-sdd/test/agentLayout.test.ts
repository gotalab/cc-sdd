import { describe, it, expect } from 'vitest';
import { resolveAgentLayout, type AgentType } from '../src/resolvers/agentLayout';

describe('resolveAgentLayout', () => {
  it('returns claude-code defaults', () => {
    const res = resolveAgentLayout('claude-code');
    expect(res).toEqual({
      commandsDir: '.claude/commands/kiro',
      agentDir: '.claude',
      docFile: 'CLAUDE.md',
    });
  });

  it('applies config override for commandsDir', () => {
    const res = resolveAgentLayout('claude-code', {
      agentLayouts: {
        'claude-code': { commandsDir: '.custom/commands' },
      },
    });
    expect(res).toEqual({
      commandsDir: '.custom/commands',
      agentDir: '.claude',
      docFile: 'CLAUDE.md',
    });
  });

  it('returns provisional defaults for gemini-cli', () => {
    const res = resolveAgentLayout('gemini-cli');
    expect(res).toEqual({
      commandsDir: '.gemini/commands/kiro',
      agentDir: '.gemini',
      docFile: 'GEMINI.md',
    });
  });
  it('returns defaults for cursor', () => {
    const res = resolveAgentLayout('cursor');
    expect(res).toEqual({
      commandsDir: '.cursor/commands/kiro',
      agentDir: '.cursor',
      docFile: 'AGENTS.md',
    });
  });

  it('returns claude-code-agent defaults', () => {
    const res = resolveAgentLayout('claude-code-agent');
    expect(res).toEqual({
      commandsDir: '.claude/commands/kiro',
      agentDir: '.claude',
      docFile: 'CLAUDE.md',
    });
  });

  it('returns codex-skills defaults', () => {
    const res = resolveAgentLayout('codex-skills');
    expect(res).toEqual({
      commandsDir: '.codex/skills',
      agentDir: '.codex',
      docFile: 'AGENTS.md',
    });
  });

  it('returns opencode defaults', () => {
    const res = resolveAgentLayout('opencode');
    expect(res).toEqual({
      commandsDir: '.opencode/commands',
      agentDir: '.opencode',
      docFile: 'AGENTS.md',
    });
  });

  it('returns opencode-agent defaults', () => {
    const res = resolveAgentLayout('opencode-agent');
    expect(res).toEqual({
      commandsDir: '.opencode/commands',
      agentDir: '.opencode',
      docFile: 'AGENTS.md',
    });
  });

});
