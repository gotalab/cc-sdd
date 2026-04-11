# Security Review Report

## Executive Summary

This project is primarily a local TypeScript/Node CLI, not an internet-facing server. The highest-value attacker paths are therefore supply-chain and workspace-trust attacks: getting a victim to run `cc-sdd` with a malicious manifest, or running it inside a repository that contains attacker-controlled symlinks or crafted template metadata.

I found one critical issue and two additional trust-boundary weaknesses:

1. `SBP-001` Critical: untrusted manifests can trigger arbitrary filesystem reads and writes outside the target repository.
2. `SBP-002` High: destination writes follow symlinks, so a malicious repository can redirect writes outside the repository even when using the built-in manifests.
3. `SBP-003` Medium: `shared-rules` metadata is not sanitized, allowing path traversal when template directories are attacker-controlled.

One positive note: [`tools/cc-sdd/src/resolvers/kiroDir.ts`](/Users/gota/Documents/projects/cc-sdd/tools/cc-sdd/src/resolvers/kiroDir.ts#L10) already validates `kiroDir` against absolute paths and `..` traversal. That same pattern is missing from other path-bearing inputs.

## Threat Model

This review assumes an external attacker cannot directly execute code on the victim machine, but can do one of the following:

- Convince a victim to run `cc-sdd` with an attacker-supplied manifest.
- Convince a victim to run `cc-sdd` inside an attacker-controlled repository.
- Publish or distribute a modified template tree consumed by the planning/execution APIs.

## Critical Findings

### SBP-001: Arbitrary filesystem read/write through untrusted manifests

**Severity:** Critical

**Impact:** An attacker who can supply a manifest can cause `cc-sdd` to read arbitrary local files and write outside the intended project directory.

**Evidence**

- `--manifest` is an advertised CLI feature and is passed through directly without restriction in [`tools/cc-sdd/src/index.ts`](/Users/gota/Documents/projects/cc-sdd/tools/cc-sdd/src/index.ts#L40) and [`tools/cc-sdd/src/index.ts`](/Users/gota/Documents/projects/cc-sdd/tools/cc-sdd/src/index.ts#L48).
- The manifest file is read verbatim in [`tools/cc-sdd/src/manifest/loader.ts`](/Users/gota/Documents/projects/cc-sdd/tools/cc-sdd/src/manifest/loader.ts#L4).
- Path-bearing manifest fields are accepted and propagated without validation in [`tools/cc-sdd/src/manifest/processor.ts`](/Users/gota/Documents/projects/cc-sdd/tools/cc-sdd/src/manifest/processor.ts#L68).
- Source paths are resolved with `path.resolve(templatesRoot, art.source.from|fromDir)` and destination paths are resolved with `path.resolve(cwd, art.source.toDir)` in [`tools/cc-sdd/src/plan/fileOperations.ts`](/Users/gota/Documents/projects/cc-sdd/tools/cc-sdd/src/plan/fileOperations.ts#L92), [`tools/cc-sdd/src/plan/fileOperations.ts`](/Users/gota/Documents/projects/cc-sdd/tools/cc-sdd/src/plan/fileOperations.ts#L114), and [`tools/cc-sdd/src/plan/fileOperations.ts`](/Users/gota/Documents/projects/cc-sdd/tools/cc-sdd/src/plan/fileOperations.ts#L153).
- The resolved destinations are then written without any repository-boundary check in [`tools/cc-sdd/src/plan/executor.ts`](/Users/gota/Documents/projects/cc-sdd/tools/cc-sdd/src/plan/executor.ts#L59).

**Why this matters**

Using `path.resolve()` here is not validation. Absolute paths and `../` segments are normalized into fully-qualified paths. That means a malicious manifest can point `from` or `fromDir` at arbitrary readable filesystem locations, and can point `toDir` outside the working tree.

**Attacker perspective**

If I were attacking users of this project, I would try to get them to run `cc-sdd --manifest attacker.json` from a gist, issue comment, example repo, or “custom setup” doc. That gives me a direct primitive for copying local files and overwriting arbitrary paths accessible to the user account.

**Recommended fix**

- Validate every manifest path field before planning:
  - Reject absolute paths unless an explicit unsafe mode is enabled.
  - Reject any normalized path containing parent traversal outside the allowed root.
- Enforce two separate allowlists:
  - `from` / `fromDir` must stay inside the package template root.
  - `toDir` and derived output files must stay inside `cwd`.
- Apply the same boundary check after placeholder expansion and after final path resolution.

## High Findings

### SBP-002: Symlink-following allows writes outside the repository

**Severity:** High

**Impact:** A malicious repository can redirect writes into arbitrary filesystem locations by placing symlinks where `cc-sdd` expects normal files or directories.

**Evidence**

- Existence checks use `stat()` in [`tools/cc-sdd/src/utils/fs.ts`](/Users/gota/Documents/projects/cc-sdd/tools/cc-sdd/src/utils/fs.ts#L7), which follows symlinks rather than detecting them.
- Writes and appends use `writeFile()` / `appendFile()` directly in [`tools/cc-sdd/src/plan/executor.ts`](/Users/gota/Documents/projects/cc-sdd/tools/cc-sdd/src/plan/executor.ts#L44) and [`tools/cc-sdd/src/plan/executor.ts`](/Users/gota/Documents/projects/cc-sdd/tools/cc-sdd/src/plan/executor.ts#L59).
- Parent directories are created with `mkdir(..., { recursive: true })` in [`tools/cc-sdd/src/utils/fs.ts`](/Users/gota/Documents/projects/cc-sdd/tools/cc-sdd/src/utils/fs.ts#L3), which does not protect against an existing symlinked path component.

**Why this matters**

Even if the built-in manifests are trusted, the repository being operated on is not necessarily trusted. If a target like `AGENTS.md`, `.kiro`, or `.agents` is a symlink, the tool will follow it and write through to the symlink target. This breaks the expected trust boundary of “only modify the current project.”

**Attacker perspective**

I would seed a repository with carefully placed symlinks and rely on normal installation commands such as `npx cc-sdd@latest --codex-skills`. That gives me a path redirection primitive without requiring a custom manifest.

**Recommended fix**

- Resolve the real path of `cwd` once and require every write target to remain under it.
- Use `lstat()` to detect symlinks on the final target and along parent path components before writing.
- Fail closed when the destination path or any existing ancestor is a symlink.

## Medium Findings

### SBP-003: `shared-rules` metadata allows path traversal when template trees are untrusted

**Severity:** Medium

**Impact:** A malicious template directory can use `shared-rules` metadata to read files outside the shared-rules directory and write them into the target workspace.

**Evidence**

- `parseSharedRules()` returns raw comma-separated filenames from `SKILL.md` frontmatter in [`tools/cc-sdd/src/plan/sharedRules.ts`](/Users/gota/Documents/projects/cc-sdd/tools/cc-sdd/src/plan/sharedRules.ts#L11).
- `buildSharedRuleOperations()` feeds each `ruleName` directly into both `path.resolve(templatesRoot, SHARED_RULES_DIR, ruleName)` and `path.join(skillDestDir, 'rules', ruleName)` in [`tools/cc-sdd/src/plan/sharedRules.ts`](/Users/gota/Documents/projects/cc-sdd/tools/cc-sdd/src/plan/sharedRules.ts#L35).

**Why this matters**

If `ruleName` contains `../` or path separators, the read escapes `templates/shared/settings/rules`, and the destination can also escape the intended `rules/` folder. This is a secondary trust-boundary issue compared with `SBP-001`, but it is still a real file traversal primitive when template content is attacker-controlled.

**Attacker perspective**

I would hide traversal payloads inside `SKILL.md` metadata because they look like content, not executable code, and are easy to miss in review.

**Recommended fix**

- Restrict `shared-rules` entries to a safe basename format such as `^[A-Za-z0-9._-]+\\.md$`.
- Reject any entry containing `/`, `\\`, or `..`.
- After resolution, verify the source remains under `templates/shared/settings/rules` and the destination remains under the skill’s `rules/` directory.

## Suggested Remediation Order

1. Fix `SBP-001` first by introducing a reusable safe-path helper for manifest source and destination validation.
2. Fix `SBP-002` next by rejecting symlinks on write targets and parent path components.
3. Fix `SBP-003` by treating `shared-rules` metadata as untrusted input and validating it strictly.

## Residual Risk

I did not find network-facing server code in the main implementation, so classic remote issues such as HTTP auth bypass, SSRF, or SQL injection do not appear to be the primary risk here. The dominant risk is unsafe handling of local filesystem trust boundaries in a tool that users are encouraged to run inside arbitrary repositories.
