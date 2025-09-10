import { describe, it, expect } from 'vitest';
import { renderTemplateString, renderJsonTemplate } from '../src/template/renderer';
import { buildTemplateContext } from '../src/template/context';
import type { AgentType } from '../src/resolvers/agentLayout';

describe('template renderer edge cases', () => {
  const agent: AgentType = 'claude-code';
  const ctx = buildTemplateContext({ agent, lang: 'en' });

  describe('renderTemplateString', () => {
    it('handles empty string', () => {
      const result = renderTemplateString('', agent, ctx);
      expect(result).toBe('');
    });

    it('handles string with no placeholders', () => {
      const input = 'Hello world without any placeholders';
      const result = renderTemplateString(input, agent, ctx);
      expect(result).toBe(input);
    });

    it('handles multiple instances of same placeholder', () => {
      const input = '{{AGENT}} loves {{AGENT}} and {{AGENT}} again';
      const result = renderTemplateString(input, agent, ctx);
      expect(result).toBe('claude-code loves claude-code and claude-code again');
    });

    it('handles adjacent placeholders', () => {
      const input = '{{AGENT}}{{AGENT_DIR}}{{LANG_CODE}}';
      const result = renderTemplateString(input, agent, ctx);
      expect(result).toBe('claude-code.claudeen');
    });

    it('replaces development guidelines', () => {
      const input = 'Guidelines: {{DEV_GUIDELINES}}';
      const result = renderTemplateString(input, agent, ctx);
      expect(result).toBe(`Guidelines: ${ctx.DEV_GUIDELINES}`);
    });

    it('preserves whitespace around placeholders', () => {
      const input = '  {{AGENT}}  \n  {{AGENT_DIR}}  ';
      const result = renderTemplateString(input, agent, ctx);
      expect(result).toBe('  claude-code  \n  .claude  ');
    });

    it('handles malformed placeholder syntax gracefully', () => {
      const input = '{AGENT} {{AGENT} {{AGENT}} {{{AGENT}}}';
      const result = renderTemplateString(input, agent, ctx);
      expect(result).toBe('{AGENT} {{AGENT} claude-code {claude-code}');
    });

    it('handles nested braces', () => {
      const input = '{{{AGENT}}} should become {{AGENT}}';
      const result = renderTemplateString(input, agent, ctx);
      expect(result).toBe('{claude-code} should become claude-code');
    });

    it('handles unknown placeholder', () => {
      const input = 'Hello {{UNKNOWN_PLACEHOLDER}}';
      const result = renderTemplateString(input, agent, ctx);
      expect(result).toBe('Hello {{UNKNOWN_PLACEHOLDER}}');
    });
  });

  describe('renderJsonTemplate', () => {
    it('handles empty JSON object', () => {
      const result = renderJsonTemplate('{}', agent, ctx);
      expect(result).toEqual({});
    });

    it('handles empty JSON array', () => {
      const result = renderJsonTemplate('[]', agent, ctx);
      expect(result).toEqual([]);
    });

    it('handles nested JSON with placeholders', () => {
      const input = JSON.stringify({
        config: {
          agent: '{{AGENT}}',
          nested: {
            dir: '{{AGENT_DIR}}',
            file: '{{AGENT_DOC}}'
          }
        },
        array: ['{{LANG_CODE}}', '{{KIRO_DIR}}', '{{DEV_GUIDELINES}}']
      });

      const result = renderJsonTemplate(input, agent, ctx) as any;
      expect(result.config.agent).toBe('claude-code');
      expect(result.config.nested.dir).toBe('.claude');
      expect(result.config.nested.file).toBe('CLAUDE.md');
      expect(result.array).toEqual(['en', '.kiro', ctx.DEV_GUIDELINES]);
    });

    it('handles JSON with numbers and booleans', () => {
      const input = '{"agent":"{{AGENT}}","version":1,"enabled":true,"ratio":3.14}';
      const result = renderJsonTemplate(input, agent, ctx) as any;
      expect(result.agent).toBe('claude-code');
      expect(result.version).toBe(1);
      expect(result.enabled).toBe(true);
      expect(result.ratio).toBe(3.14);
    });

    it('throws on JSON with unquoted placeholder that results in invalid JSON', () => {
      const input = '{"agent": {{AGENT}} }'; // unquoted placeholder
      expect(() => renderJsonTemplate(input, agent, ctx)).toThrow();
    });

    it('handles JSON string with escaped quotes', () => {
      const input = '{"message": "Agent \\"{{AGENT}}\\" is ready"}';
      const result = renderJsonTemplate(input, agent, ctx) as any;
      expect(result.message).toBe('Agent "claude-code" is ready');
    });

    it('handles JSON with null values', () => {
      const input = '{"agent":"{{AGENT}}","optional":null}';
      const result = renderJsonTemplate(input, agent, ctx) as any;
      expect(result.agent).toBe('claude-code');
      expect(result.optional).toBe(null);
    });

    it('preserves exact JSON formatting for complex structures', () => {
      const complexCtx = buildTemplateContext({ 
        agent: 'gemini-cli', 
        lang: 'ja',
        kiroDir: { flag: 'custom-kiro' }
      });
      
      const input = JSON.stringify({
        manifest: {
          version: 2,
          agent: '{{AGENT}}',
          config: {
            lang: '{{LANG_CODE}}',
            paths: {
              kiro: '{{KIRO_DIR}}',
              agent: '{{AGENT_DIR}}',
              commands: '{{AGENT_COMMANDS_DIR}}'
            }
          }
        }
      });
      
      const result = renderJsonTemplate(input, 'gemini-cli', complexCtx) as any;
      expect(result.manifest.version).toBe(2);
      expect(result.manifest.agent).toBe('gemini-cli');
      expect(result.manifest.config.lang).toBe('ja');
      expect(result.manifest.config.paths.kiro).toBe('custom-kiro');
      expect(result.manifest.config.paths.agent).toBe('.gemini');
      expect(result.manifest.config.paths.commands).toBe('.gemini/commands/kiro');
    });
  });
});