# cc-sdd Release Checklist

## Pre-Release Tasks

### 1. Configuration Updates
- [ ] Update `package.json` language default from `ja` to `en` ✅ 
- [ ] Update README.md default language examples to `en`
- [ ] Set appropriate version in `package.json` (e.g., `0.1.0`)
- [ ] Remove `"private": true` from `package.json`
- [ ] Add proper package metadata (description, keywords, repository, etc.)

### 2. Cross-Platform Testing

#### Manual Testing
- [ ] Test on Windows (VM/WSL/real machine)
  - [ ] Basic: `npx cc-sdd --dry-run`
  - [ ] Windows-specific: `npx cc-sdd --os windows --dry-run`
  - [ ] English docs: `npx cc-sdd --os windows --lang en --dry-run`
  - [ ] File path handling (backslashes)
  - [ ] Japanese file names support
  - [ ] Permission handling

#### Automated Testing (Recommended)
- [ ] Set up GitHub Actions for Windows testing
- [ ] Create `.github/workflows/test-windows.yml`
- [ ] Test matrix: Windows/macOS/Linux × Node 18/20
- [ ] Integration tests with actual file generation

### 3. Template Validation
- [ ] Verify all OS templates exist:
  - [ ] `os-mac/` templates
  - [ ] `os-windows/` templates  
  - [ ] `os-linux/` templates (if different from mac)
- [ ] Test template variable substitution
- [ ] Validate generated slash commands work in Claude Code
- [ ] Check CLAUDE.md templates for all languages

### 4. Documentation Review
- [ ] Review and finalize README.md
- [ ] Add proper installation instructions
- [ ] Include troubleshooting section
- [ ] Add contribution guidelines
- [ ] Create CHANGELOG.md

### 5. Package Preparation
- [ ] Run `npm run build` and verify dist/ output
- [ ] Test package locally: `npm pack && npm install -g cc-sdd-*.tgz`
- [ ] Verify CLI works: `cc-sdd --help`
- [ ] Check `files` array in package.json includes all necessary files

## Release Process

### Step 1: Pre-Release Testing
```bash
# 1. Build and test locally
npm run build
npm pack
npm install -g cc-sdd-*.tgz
cc-sdd --dry-run --os windows
cc-sdd --dry-run --os mac  
cc-sdd --dry-run --os linux

# 2. Test in clean directory
mkdir test-project && cd test-project
cc-sdd --dry-run
```

### Step 2: Beta Release
```bash
# 1. Update version for beta
npm version prerelease --preid=beta  # e.g., 0.1.0-beta.0

# 2. Publish beta
npm publish --tag beta

# 3. Test beta version
npx cc-sdd@beta --dry-run
```

### Step 3: Production Release
```bash
# 1. Update to stable version
npm version patch  # or minor/major

# 2. Create git tag
git add .
git commit -m "Release v$(npm pkg get version | tr -d '"')"
git tag "v$(npm pkg get version | tr -d '"')"

# 3. Publish to npm
npm publish

# 4. Push to git
git push origin main --tags
```

### Step 4: Post-Release
- [ ] Update GitHub release notes
- [ ] Announce on relevant channels
- [ ] Monitor for issues in first 24 hours
- [ ] Update documentation if needed

## Quality Gates

### Must Pass Before Release
- [ ] All tests pass on Windows/macOS/Linux
- [ ] CLI generates expected files structure
- [ ] Templates render correctly with variables
- [ ] No broken links in documentation
- [ ] Package size is reasonable (<10MB)

### Nice to Have
- [ ] Performance benchmarks
- [ ] User feedback from beta testing
- [ ] Documentation screenshots/examples

## Risk Assessment

### High Risk Items
- **Windows compatibility**: File paths, permissions, encoding
- **Template rendering**: Variable substitution, edge cases
- **NPM package structure**: Missing files, incorrect bin path

### Mitigation Strategies
- Automated testing on all platforms
- Manual verification on real Windows machine
- Beta release for early feedback
- Rollback plan (npm unpublish within 24h if critical issues)

## Rollback Plan

If critical issues found after release:

1. **Within 24 hours**: `npm unpublish cc-sdd@version`
2. **After 24 hours**: 
   - Release hotfix version
   - Deprecate broken version: `npm deprecate cc-sdd@broken-version "Critical bug, use @latest"`

## Contact & Support

- **Issues**: Report to main repository
- **Documentation**: Update README.md and this checklist
- **Emergency contact**: Repository maintainers

---

## Current Status

- [ ] Configuration ready
- [ ] Windows testing complete
- [ ] Templates validated
- [ ] Documentation finalized
- [ ] Package tested locally
- [ ] Ready for beta release
- [ ] Ready for production release

**Next Action**: Complete Windows testing and update package.json metadata.
