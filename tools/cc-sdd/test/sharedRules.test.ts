import { describe, it, expect } from 'vitest';
import { parseSharedRules } from '../src/plan/sharedRules';

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
});
