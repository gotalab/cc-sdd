# Command Reference

> 📖 **日本語ガイドはこちら:** [コマンドリファレンス (日本語)](ja/command-reference.md)

Complete reference for all cc-sdd commands with detailed usage, examples, and troubleshooting.

> **Note**: This reference is based on Claude Code command templates. While the core functionality is consistent across all supported agents (Cursor, Gemini CLI, Codex CLI, GitHub Copilot, Qwen Code, Windsurf), command syntax and features may vary slightly depending on your agent. Refer to your agent's specific documentation for platform-specific details.

> For installation, CLI setup, and workspace prerequisites, see the [Project README](../../README.md). For an overview of additional docs and guides, start with the [Docs README](../README.md).

## Quick Index

### Steering Commands
- [`/kiro:steering`](#kirosteering) - Create/update project memory
- [`/kiro:steering-custom`](#kirosteering-custom) - Add domain-specific steering

### Spec Workflow Commands
- [`/kiro:spec-init`](#kirospec-init) - Initialize new feature spec
- [`/kiro:spec-requirements`](#kirospec-requirements) - Generate requirements
- [`/kiro:spec-design`](#kirospec-design) - Create technical design
- [`/kiro:spec-tasks`](#kirospec-tasks) - Break down into tasks
- [`/kiro:spec-impl`](#kirospec-impl) - Execute implementation

### Validation Commands
- [`/kiro:validate-gap`](#kirovalidate-gap) - Analyze existing vs requirements
- [`/kiro:validate-design`](#kirovalidate-design) - Review design quality
- [`/kiro:validate-impl`](#kirovalidate-impl) - Validate implementation

### Status & Utility
- [`/kiro:spec-status`](#kirospec-status) - Check feature progress

---

### Command Matrix

| Command | Parameters | Primary Purpose | Typical Next Step |
|---------|------------|-----------------|-------------------|
| `/kiro:steering` | – | Bootstrap or sync project memory | `/kiro:spec-init` |
| `/kiro:steering-custom` | – (interactive) | Capture domain-specific patterns | `/kiro:spec-init` or rerun steering |
| `/kiro:spec-init` | `<project-description>` | Create new spec folder & metadata | `/kiro:spec-requirements <feature>` |
| `/kiro:spec-requirements` | `<feature-name>` | Generate EARS requirements | `/kiro:spec-design <feature>` |
| `/kiro:validate-gap` | `<feature-name>` | (Optional) Analyze existing code gaps | `/kiro:spec-design <feature>` |
| `/kiro:spec-design` | `<feature-name> [-y]` | Produce `research.md` (when needed) + technical design | `/kiro:spec-tasks <feature>` |
| `/kiro:validate-design` | `<feature-name>` | (Optional) Review design quality | `/kiro:spec-tasks <feature>` |
| `/kiro:spec-tasks` | `<feature-name> [-y]` | Break design into implementation tasks w/ parallel-safe blocks (P#) | `/kiro:spec-impl <feature> [tasks]` |
| `/kiro:spec-impl` | `<feature-name> [task-numbers]` | Execute tasks with TDD | `/kiro:validate-impl [feature] [tasks]` |
| `/kiro:validate-impl` | `[feature-name] [task-numbers]` | Verify implementation quality | `/kiro:spec-status <feature>` |
| `/kiro:spec-status` | `<feature-name>` | Summarize workflow progress | Resume with suggested command |

---

## Steering Commands

### `/kiro:steering`

**Purpose**: Create or update project memory (steering) so every command can reference shared rules, architecture guardrails, and product-wide guidelines. It is *not* for feature-specific implementation notes.

**Parameters**: None

**Usage**:
```bash
/kiro:steering
```

**What it does**:
Analyzes your codebase and generates/updates three core steering documents that capture evergreen guidance (not per-feature minutiae):
- `{{KIRO_DIR}}/steering/structure.md` - Architecture patterns, directory organization, naming conventions
- `{{KIRO_DIR}}/steering/tech.md` - Technology stack, framework decisions, technical constraints
- `{{KIRO_DIR}}/steering/product.md` - Business context, product purpose, core capabilities

<details>
<summary><strong>Sample Output (Bootstrap)</strong></summary>

```
✅ Steering Created

## Generated:
- product.md: Next.js SaaS platform for team collaboration
- tech.md: Next.js 14, TypeScript, Prisma, PostgreSQL
- structure.md: Feature-first organization under src/features/

Review and approve as Source of Truth.
```

</details>

<details>
<summary><strong>Sample Output (Sync)</strong></summary>

```
✅ Steering Updated

## Changes:
- tech.md: React 18 → 19
- structure.md: Added API route pattern

## Code Drift:
- Components not following import conventions

## Recommendations:
- Consider creating api-standards.md for consistent API patterns
```

</details>

**Common Issues**:

| Issue | Cause | Solution |
|-------|-------|----------|
| ❌ "No codebase found" | Running in empty directory | Run from project root with actual code |
| ❌ "Permission denied" | Insufficient file permissions | Check write permissions on `.kiro/` directory |
| ⚠️ Steering too generic | Small/new codebase | Add custom steering with `/kiro:steering-custom` |
| ⚠️ Updates overwrite my edits | User customizations lost | Steering preserves user content - report if not working |

**Pro Tips**:
- 💡 Run steering **before** creating specs for best results
- 💡 Keep the content high-level: architecture rules, naming, UX principles. Store feature-specific details in spec/research/design instead.
- 💡 Steering captures **patterns**, not file lists - keeps it maintainable
- 💡 Review generated steering files and customize as needed
- 💡 Re-run periodically to keep AI context fresh

**Related Commands**:
- [`/kiro:steering-custom`](#kirosteering-custom) - Add specialized domain knowledge
- [`/kiro:spec-init`](#kirospec-init) - Next step after steering

---

### `/kiro:steering-custom`

**Purpose**: Create specialized steering documents for domain-specific patterns (API standards, testing initiatives, UI/UX playbooks, etc.).

**Parameters**: None (interactive)

**Usage**:
```bash
/kiro:steering-custom
```

**What it does**:
Interactive command that helps you create custom steering files in `{{KIRO_DIR}}/steering/` for specialized areas beyond the core three files (structure/tech/product).

**Available Templates**:
1. **api-standards.md** - REST/GraphQL conventions, error handling, versioning, company-wide contract formats
2. **testing.md** - Test organization, mocking strategies, coverage requirements, “what to automate vs. what to verify manually” guidance
3. **security.md** - Authentication patterns, input validation, secrets management
4. **database.md** - Schema design, migrations, query patterns
5. **error-handling.md** - Error types, logging, retry strategies
6. **authentication.md** - Auth flows, permissions, session management
7. **deployment.md** - CI/CD, environments, rollback procedures
8. **ui-ux.md** (custom) - Component libraries, copy tone, accessibility rules, reviewer checklists
9. **product-tests.md** (custom) - End-to-end validation scenarios specific to your QA org

**When to use**:
- ✅ Your project has **specific standards** not covered by core steering (API contracts, company-mandated test plans, UI copy tone)
- ✅ Multiple features or sub-teams need **consistent domain knowledge** (QA playbooks, design audit checklists)
- ✅ You want to **enforce conventions** across the entire product (design tokens, telemetry fields, accessibility heuristics)
- ✅ Complex systems need **specialized context** (microservices, event-driven, regulated industries)

**Workflow**:
1. Command asks what domain you want to document
2. Shows available templates or lets you describe your own (e.g., “UI review checklist”, “API error contract”, “product test plan”)
3. Analyzes codebase for existing patterns in that domain
4. Generates custom steering file with project-/company-specific examples and TODO markers for missing decisions

<details>
<summary><strong>Example Interaction</strong></summary>

```
AI: What domain-specific steering would you like to create?
  Available templates: api-standards, testing, security, database, error-handling, authentication, deployment
  Or describe your own domain.

You: api-standards

AI: Analyzing existing API patterns...
  ✓ Found REST endpoints in src/api/
  ✓ Detected error handling pattern
  ✓ Created .kiro/steering/api-standards.md

  Summary:
  - REST with /api/v1 prefix
  - Standard error responses: { error: string, code: number }
  - Bearer token authentication
  - Rate limiting: 100 req/min
```

</details>

<details>
<summary><strong>Example Output Files</strong></summary>

```
.kiro/steering/
├── structure.md          # Core steering
├── tech.md              # Core steering
├── product.md           # Core steering
├── api-standards.md     # Custom steering
├── testing.md           # Custom steering
└── database.md          # Custom steering
```

</details>

**Common Issues**:

| Issue | Cause | Solution |
|-------|-------|----------|
| ❌ "No pattern found" | New domain without code | Provide your standards manually, AI will document them |
| ⚠️ Too generic | Template doesn't fit | Describe specific domain, AI will create custom structure |
| 💡 Which domains to create? | Unsure what's useful | Start with domains causing inconsistencies across features |

**Pro Tips**:
- 💡 Create custom steering when you notice **repeated clarifications** across features
- 💡 Keep each domain focused - one file per concern (100-200 lines typical)
- 💡 Custom steering is **loaded automatically** - no need to reference it manually
- 💡 Update custom steering as standards evolve

**Related Commands**:
- [`/kiro:steering`](#kirosteering) - Core project memory

---

## Spec Workflow Commands

### `/kiro:spec-init`

**Purpose**: Initialize a new feature specification with directory structure and metadata.

**Parameters**: `<project-description>`

**Usage**:
```bash
/kiro:spec-init <project-description>
```

**Arguments**:
- `<project-description>` (required): Detailed description of the feature to build

**What it does**:
1. Generates a unique feature name from your description
2. Creates spec directory: `{{KIRO_DIR}}/specs/<feature-name>/`
3. Initializes metadata file: `spec.json`
4. Creates initial requirements stub: `requirements.md`

**Example**:
```bash
/kiro:spec-init User authentication with OAuth 2.0 and JWT tokens for a Next.js app
```

**Output**:
```
## Generated Feature Name
`user-auth-oauth`

Rationale: Captures core capability (user authentication) and implementation approach (OAuth).

## Project Summary
OAuth 2.0 authentication system with JWT token management for Next.js application.

## Created Files
- ✓ .kiro/specs/user-auth-oauth/spec.json
- ✓ .kiro/specs/user-auth-oauth/requirements.md

## Next Step
Run this command to generate comprehensive requirements:
```bash
/kiro:spec-requirements user-auth-oauth
```

## Notes
This command only initializes the specification structure. Following the stage-by-stage 
development principle, requirements generation happens in the next phase to maintain 
proper separation of concerns and allow for focused, high-quality requirement analysis.
```

**When to use**:
- ✅ Starting a **new feature** or enhancement
- ✅ After running `/kiro:steering` (recommended for existing projects)
- ✅ When you have a **clear feature description** to provide

**Feature Naming**:
- AI generates names in `kebab-case` format (e.g., `user-auth-oauth`, `pdf-export`)
- Names are **unique** - appends `-2`, `-3` if conflicts exist
- Ambiguous descriptions → AI proposes 2-3 options for you to choose

**Common Issues**:

| Issue | Cause | Solution |
|-------|-------|----------|
| ❌ "Ambiguous feature name" | Vague description | Provide more specific description or choose from AI's suggestions |
| ❌ "Feature already exists" | Name conflict | AI auto-appends number (e.g., `-2`), or choose different name |
| ❌ "Template missing" | Corrupted installation | Reinstall cc-sdd: `npx cc-sdd@latest` |
| ⚠️ Generated name unclear | Short description | Provide longer, more detailed feature description |

**Pro Tips**:
- 💡 Be **specific** in your description - includes tech stack, constraints, key requirements
- 💡 This command is **quick** - only creates structure, not full requirements
- 💡 Review `spec.json` after creation to verify language and metadata
- 💡 You can rename the directory later if needed (update `spec.json` accordingly)

**Related Commands**:
- [`/kiro:spec-requirements`](#kirospec-requirements) - Next step: generate requirements
- [`/kiro:spec-status`](#kirospec-status) - Check initialization status

---

### `/kiro:spec-requirements`

**Purpose**: Generate comprehensive, testable requirements in EARS format based on feature description.

**Parameters**: `<feature-name>`

**Usage**:
```bash
/kiro:spec-requirements <feature-name>
```

**Arguments**:
- `<feature-name>` (required): Feature directory name from `/kiro:spec-init`

**What it does**:
1. Loads project context from ALL steering files
2. Reads feature description from initial `requirements.md`
3. Generates structured requirements using EARS format
4. Updates `requirements.md` and marks phase as complete in `spec.json`

**EARS Format** (Easy Approach to Requirements Syntax):
```
WHEN <trigger> THE <system> SHALL <action>
IF <condition> THEN THE <system> SHALL <action>
WHERE <feature> THE <system> SHALL <action>
THE <system> SHALL <action>
```

**Example**:
```bash
/kiro:spec-requirements user-auth-oauth
```

<details>
<summary><strong>Sample Output</strong></summary>

```
## Generated Requirements Summary
- User Authentication: Login, logout, session management
- OAuth 2.0 Integration: Google and GitHub providers
- JWT Token Management: Generation, validation, refresh
- Security: HTTPS enforcement, CSRF protection, rate limiting
- Error Handling: Clear error messages for auth failures

## Document Status
✓ Updated .kiro/specs/user-auth-oauth/requirements.md (87 acceptance criteria)
✓ Updated spec.json metadata (phase: requirements-generated)

## Next Steps
1. Review requirements.md and verify all expected functionality is covered
2. Approve by running: /kiro:spec-design user-auth-oauth
  Or refine requirements and run this command again
```

</details>

<details>
<summary><strong>Generated Requirements Structure</strong></summary>

```markdown
# Requirements: User Auth OAuth

## 1. Functional Requirements

### 1.1 User Authentication
**FR-1.1.1**: Login with OAuth
- WHEN user clicks "Login with Google" THE system SHALL redirect to Google OAuth consent screen
- WHEN OAuth callback received THE system SHALL validate authorization code
- IF validation succeeds THEN THE system SHALL create user session with JWT token

### 1.2 Session Management
...

## 2. Non-Functional Requirements

### 2.1 Security
- THE system SHALL enforce HTTPS for all authentication endpoints
...
```

</details>

**When to use**:
- ✅ After `/kiro:spec-init` completes
- ✅ When you need to **clarify requirements** before design
- ✅ To **iterate** on requirements (run multiple times to refine)

**Common Issues**:

| Issue | Cause | Solution |
|-------|-------|----------|
| ❌ "Missing project description" | Empty requirements.md | Provide feature details when prompted |
| ❌ "Spec not found" | Wrong feature name | Check `.kiro/specs/` for correct name |
| ⚠️ Requirements too generic | No steering context | Run `/kiro:steering` first for better context |
| ⚠️ Missing some requirements | Incomplete description | Review and run again, or manually add to requirements.md |
| ⚠️ Not using EARS format | Template issue | Check `{{KIRO_DIR}}/settings/rules/ears-format.md` |

**Pro Tips**:
- 💡 **Iterative process** - Run multiple times to refine requirements
- 💡 Review EARS statements for clarity - should be testable and verifiable
- 💡 AI generates initial version then asks for feedback - respond with needed changes
- 💡 Edit `requirements.md` directly if needed - AI preserves your edits

**Related Commands**:
- [`/kiro:validate-gap`](#kirovalidate-gap) - Optional: analyze existing code gaps
- [`/kiro:spec-design`](#kirospec-design) - Next: create technical design
- [`/kiro:spec-status`](#kirospec-status) - Check requirements progress

---

### `/kiro:spec-design`

**Purpose**: Create comprehensive technical design that translates requirements (WHAT) into architectural design (HOW).

**Parameters**: `<feature-name> [-y]`

**Usage**:
```bash
/kiro:spec-design <feature-name> [-y]
```

**Arguments**:
- `<feature-name>` (required): Feature directory name
- `[-y]` (optional): Auto-approve requirements without confirmation

**What it does**:
1. **Validates** requirements are approved (or auto-approves with `-y`)
2. **Discovers** appropriate architecture through research and analysis
3. **Captures** findings in `research.md` (skipped automatically when no investigation is needed)
4. **Generates** technical design with components, interfaces, data models
5. **Creates** Mermaid diagrams for complex architectures
6. **Updates** `design.md` and metadata

**Discovery Process**:
The command automatically determines research depth based on feature complexity (and only writes `research.md` when the phase produces new findings):
- **Complex/New Features** → Full discovery (WebSearch for patterns, APIs, libraries)
- **Extensions** → Light discovery (integration points, existing patterns)
- **Simple Additions** → Minimal discovery (quick pattern check)

**Example**:
```bash
# Standard flow with approval prompt
/kiro:spec-design user-auth-oauth

# Fast-track with auto-approval
/kiro:spec-design user-auth-oauth -y
```

<details>
<summary><strong>Sample Output</strong></summary>

```
## Discovery Phase
Analyzing feature type: Complex Integration (OAuth + JWT)
Executing full discovery process...

✓ Researched OAuth 2.0 best practices and security considerations
✓ Verified JWT library compatibility (jsonwebtoken@9.0.2)
✓ Analyzed existing authentication patterns in codebase
✓ Identified integration points: API routes, middleware, database

## Design Generated
✓ Updated .kiro/specs/user-auth-oauth/research.md with discovery notes
✓ Created .kiro/specs/user-auth-oauth/design.md

Summary:
- Architecture: NextAuth.js integration with custom JWT provider
- Components: 7 core components (AuthProvider, TokenManager, OAuthHandler...)
- Data Models: User, Session, RefreshToken (PostgreSQL schema)
- Integration: 3 existing API routes modified
- Security: HTTPS, CSRF tokens, rate limiting, secure cookies

## Next Steps
Review design.md and approve to continue:
```bash
/kiro:spec-tasks user-auth-oauth
```
```

</details>

<details>
<summary><strong>Generated Design Structure</strong></summary>

```markdown
# Design: User Auth OAuth

## 1. Architecture Overview
[Mermaid diagram showing component relationships]

## 2. Component Specifications

### 2.1 AuthProvider
**Purpose**: React context provider for auth state
**Interfaces**:
- Props: { children: ReactNode }
- Returns: AuthContext with user, login(), logout()
**Dependencies**: TokenManager, API client
**Implementation Notes**: SSR-compatible, handles token refresh

### 2.2 TokenManager
...

## 3. Data Models
[Database schema with relationships]

## 4. Integration Points
[How this integrates with existing codebase]

## 5. Security Considerations
[Threat model and mitigations]

## 6. Testing Strategy
[Test coverage requirements]
```

</details>

**When to use**:
- ✅ After requirements are **approved** (manually or with `-y`)
- ✅ When you need **architectural guidance** before implementation
- ✅ For **complex features** requiring research and design decisions

**Common Issues**:

| Issue | Cause | Solution |
|-------|-------|----------|
| ❌ "Requirements not approved" | Missing approval step | Review requirements.md and approve, or use `-y` flag |
| ❌ "Design phase failed" | Network issues during research | Check internet connection for WebSearch/WebFetch |
| ⚠️ Design too shallow | Simple feature auto-detected | Manually request more detail if needed |
| ⚠️ Missing diagrams | Complex architecture | Verify Mermaid syntax, manually add if needed |
| ⚠️ Design doesn't fit codebase | Incomplete steering | Update `/kiro:steering` with current patterns |

**Auto-Approval (`-y` flag)**:
- ⚠️ **Use carefully** - skips human review of requirements
- ✅ **Good for**: Iteration during development, trusted requirements
- ❌ **Avoid for**: Production features, critical systems, first-time workflows

**Pro Tips**:
- 💡 **Review discovery findings** - AI researches external dependencies and APIs
- 💡 Design is **editable** - customize and re-run if needed (merge mode)
- 💡 **Mermaid diagrams** auto-generate for complex architectures - verify they render
- 💡 Integration points show **how new code fits** existing system

**Related Commands**:
- [`/kiro:validate-design`](#kirovalidate-design) - Optional: quality review before tasks
- [`/kiro:spec-tasks`](#kirospec-tasks) - Next: break into implementation tasks
- [`/kiro:spec-status`](#kirospec-status) - Check design progress

---

### `/kiro:spec-tasks`

**Purpose**: Generate detailed, actionable implementation tasks that translate design into executable work items, including parallel-friendly waves labeled `P0`, `P1`, etc.

**Parameters**: `<feature-name> [-y]`

**Usage**:
```bash
/kiro:spec-tasks <feature-name> [-y]
```

**Arguments**:
- `<feature-name>` (required): Feature directory name
- `[-y]` (optional): Auto-approve requirements and design without confirmation

**What it does**:
1. **Validates** requirements and design are approved (or auto-approves with `-y`)
2. **Maps** all requirements to specific implementation tasks
3. **Sizes** tasks to 1-3 hours each for manageable increments
4. **Organizes** tasks with logical hierarchy and progression
5. **Marks** execution waves with `P#` labels so teams know which tasks can run in parallel
6. **Updates** `tasks.md` and metadata

**Task Structure**:
```
P0 — Serial gate (must finish before P1)
  Major Task (1, 2, 3...)
    Sub-tasks (1.1, 1.2...) sized 1-3 hours, each with acceptance criteria

P1 — Parallel wave (multiple majors can run concurrently)
  Major Task (4, 5...)
    Sub-tasks (4.1, 4.2...)
```

**Example**:
```bash
# Standard flow with approval prompt
/kiro:spec-tasks user-auth-oauth

# Fast-track with auto-approval
/kiro:spec-tasks user-auth-oauth -y
```

<details>
<summary><strong>Sample Output</strong></summary>

```
## Status
✓ Generated tasks at .kiro/specs/user-auth-oauth/tasks.md

## Task Summary
- Total: 8 major tasks, 24 sub-tasks
- All 15 requirements covered
- Average task size: 1-3 hours per sub-task
- Estimated completion: 48-72 hours

## Next Steps
Review tasks.md and start implementation:
```bash
/kiro:spec-impl user-auth-oauth 1.1,1.2
```
```

</details>

<details>
<summary><strong>Generated Tasks Structure</strong></summary>

```markdown
# Implementation Tasks: User Auth OAuth

P0 — Backend Foundation
## 1. Database Schema and Models
- [ ] 1.1 Create User table with OAuth fields (email, provider, providerId, tokens)
- [ ] 1.2 Create Session table for JWT token management
- [ ] 1.3 Create RefreshToken table for token rotation
- [ ] 1.4 Add database migrations and rollback scripts

P1 — Service Integration
## 2. OAuth Provider Configuration
- [ ] 2.1 Set up Google OAuth client credentials and redirect URLs
- [ ] 2.2 Set up GitHub OAuth application and callback endpoints
- [ ] 2.3 Implement environment variable configuration for OAuth secrets
- [ ] 2.4 Create OAuth provider abstraction layer

P1 — Service Integration
## 3. Authentication API Routes
- [ ] 3.1 Implement /api/auth/[provider]/login endpoint
- [ ] 3.2 Implement /api/auth/callback handler for OAuth flow
- [ ] 3.3 Implement /api/auth/logout endpoint
- [ ] 3.4 Implement /api/auth/refresh for token renewal

...
```

</details>

**Task Principles**:
- ✅ **Natural language** - "Create User table" not "Define UserSchema class"
- ✅ **Self-contained** - Each task stands alone with clear scope
- ✅ **Incremental** - Each task integrates with system (no orphaned work)
- ✅ **Testable** - Clear acceptance criteria for each task
- ✅ **Parallel-aware** - `P0` for blocking work, same `P#` can execute concurrently
- ✅ **Sequential where needed** - P0 before P1, major tasks still numbered for clarity

**When to use**:
- ✅ After design is **approved** (manually or with `-y`)
- ✅ When you need **implementation roadmap** with clear milestones
- ✅ Before starting actual coding to understand scope

**Common Issues**:

| Issue | Cause | Solution |
|-------|-------|----------|
| ❌ "Design not approved" | Missing approval step | Review design.md and approve, or use `-y` flag |
| ❌ "Tasks too large" | Complex requirements | AI should auto-size to 1-3 hours - report if not |
| ⚠️ Orphaned tasks | Task doesn't integrate | Verify tasks.md follows integration principle |
| ⚠️ Missing requirements | Incomplete mapping | Check if all requirements have corresponding tasks |
| ⚠️ Too many levels | Excessive nesting | Tasks limited to 2 levels (major + sub) - edit if deeper |

**Task Numbering**:
- Major tasks: `1, 2, 3, 4...` (sequential, never repeat)
- Sub-tasks: `1.1, 1.2, 1.3...` under each major task
- ❌ **Never**: `1.1.1` (no third level)
- ✅ **Always**: Tasks integrate after completion (no "implement later" placeholders)

**Auto-Approval (`-y` flag)**:
- ⚠️ Approves **both requirements and design**
- ✅ **Good for**: Rapid prototyping, iteration
- ❌ **Avoid for**: Production features without human review

**Pro Tips**:
- 💡 **Review task order** - should follow logical implementation sequence
- 💡 Tasks are **checkboxes** - `[ ]` unchecked, `[x]` completed by `/kiro:spec-impl`
- 💡 **Edit freely** - add, remove, or reorder tasks as needed
- 💡 Run `/kiro:spec-status` to track completion progress

**Related Commands**:
- [`/kiro:spec-impl`](#kirospec-impl) - Next: execute implementation tasks
- [`/kiro:spec-status`](#kirospec-status) - Track task completion
- [`/kiro:validate-impl`](#kirovalidate-impl) - Validate after implementation

---

### `/kiro:spec-impl`

**Purpose**: Execute implementation tasks using Test-Driven Development (TDD) methodology.

**Parameters**: `<feature-name> [task-numbers]`

**Usage**:
```bash
/kiro:spec-impl <feature-name> [task-numbers]
```

**Arguments**:
- `<feature-name>` (required): Feature directory name
- `[task-numbers]` (optional): Comma-separated task IDs to execute
  - Format: `1.1,1.2,1.3` or `1,2,3`
  - If omitted: Executes **all pending** unchecked tasks

**What it does**:
Executes tasks following **Kent Beck's TDD cycle**:
1. **🔴 RED** - Write failing test first
2. **🟢 GREEN** - Write minimal code to pass test
3. **🔵 REFACTOR** - Clean up while keeping tests green
4. **✅ VERIFY** - Ensure no regressions
5. **📝 MARK COMPLETE** - Update checkbox in tasks.md

**Examples**:
```bash
# Execute specific tasks
/kiro:spec-impl user-auth-oauth 1.1,1.2,1.3

# Execute all pending tasks in feature
/kiro:spec-impl user-auth-oauth

# Execute single task
/kiro:spec-impl user-auth-oauth 2.1

# Execute major task (all sub-tasks)
/kiro:spec-impl user-auth-oauth 1
```

<details>
<summary><strong>Sample Implementation Session</strong></summary>

```
## Executing Tasks for user-auth-oauth

### Task 1.1: Create User table with OAuth fields
🔴 RED: Writing test...
✓ Created tests/models/user.test.ts
  - Test: User.create() with OAuth fields
  - Expected to fail: User model doesn't exist

🟢 GREEN: Implementing...
✓ Created src/models/User.ts
✓ Added OAuth fields: email, provider, providerId
✓ Tests passing

🔵 REFACTOR: Cleaning up...
✓ Extracted schema validation to helper
✓ Added TypeScript types
✓ All tests still passing

✅ VERIFY: Final checks...
✓ Unit tests: 5/5 passing
✓ No regressions in existing tests
✓ Code coverage: +15 lines

📝 Updated tasks.md: [x] 1.1 Create User table with OAuth fields

---

### Task 1.2: Create Session table for JWT token management
...
```

</details>

**TDD Workflow Details**:

**🔴 RED Phase**:
- Write test **before** implementation code
- Test should **fail** (code doesn't exist yet)
- Use descriptive test names
- Example:
```typescript
// tests/models/user.test.ts
describe('User Model', () => {
  it('should create user with OAuth provider', () => {
    const user = User.create({
      email: 'test@example.com',
      provider: 'google',
      providerId: '123'
    });
    expect(user.email).toBe('test@example.com');
  });
});
```

**🟢 GREEN Phase**:
- Write **minimal code** to pass test
- Don't over-engineer
- Focus only on making **this test** pass
```typescript
// src/models/User.ts
class User {
  constructor(public email: string, public provider: string, public providerId: string) {}
  
  static create(data: any) {
    return new User(data.email, data.provider, data.providerId);
  }
}
```

**🔵 REFACTOR Phase**:
- Improve code structure
- Remove duplication
- Apply patterns
- **Tests must still pass**

**When to use**:
- ✅ After tasks are **approved** in spec.json
- ✅ When ready to **write actual code**
- ✅ For **incremental implementation** (specific task numbers)
- ✅ To **complete all pending tasks** (no task numbers specified)

**Common Issues**:

| Issue | Cause | Solution |
|-------|-------|----------|
| ❌ "Tasks not approved" | spec.json approval missing | Review tasks.md and approve, or check spec.json |
| ❌ "Feature not found" | Wrong feature name | Verify name matches `.kiro/specs/` directory |
| ❌ "Invalid task number" | Task ID doesn't exist | Check tasks.md for valid task numbers |
| ❌ "Tests failing" | Implementation incomplete | Fix failing tests before moving to next task |
| ⚠️ Tests not written first | TDD not followed | AI should write tests first - report if skipped |
| ⚠️ Regressions detected | Breaking existing functionality | Fix before continuing to maintain quality |

**Task Selection**:
```bash
# Specific sub-tasks
/kiro:spec-impl feature 1.1,1.2,1.3

# All sub-tasks of major task 1
/kiro:spec-impl feature 1

# Mix of major and sub-tasks
/kiro:spec-impl feature 1,2.1,2.2,3

# All pending tasks (empty checkboxes)
/kiro:spec-impl feature
```

**Validation Steps**:
For each task completion:
- ✅ All tests pass (new + existing)
- ✅ No regressions in existing functionality
- ✅ Code coverage maintained or improved
- ✅ Implementation follows design.md specifications
- ✅ Checkbox updated in tasks.md

**Pro Tips**:
- 💡 **Start small** - Execute 1-2 tasks at a time initially
- 💡 **TDD is mandatory** - Tests written before implementation
- 💡 **Check regressions** - Existing tests must continue passing
- 💡 **Incremental commits** - Commit after each task or small group
- 💡 Run `/kiro:spec-status` frequently to track progress
- 💡 Use `/kiro:validate-impl` after completing tasks

**Related Commands**:
- [`/kiro:validate-impl`](#kirovalidate-impl) - Validate completed implementation
- [`/kiro:spec-status`](#kirospec-status) - Check implementation progress
- [`/kiro:spec-tasks`](#kirospec-tasks) - Review task list

---

## Validation Commands

### `/kiro:validate-gap`

**Purpose**: Analyze the gap between requirements and existing codebase to inform implementation strategy (optional quality gate for brownfield projects).

**Parameters**: `<feature-name>`

**Usage**:
```bash
/kiro:validate-gap <feature-name>
```

**Arguments**:
- `<feature-name>` (required): Feature directory name

**What it does**:
1. Loads requirements and **all steering context**
2. Analyzes existing codebase using Grep and Read tools
3. Identifies missing capabilities and integration challenges
4. Evaluates multiple implementation approaches
5. Generates gap analysis report

**When to use**:
- ✅ **Brownfield projects** - Existing codebase with new requirements
- ✅ **Before design phase** - Inform technical decisions
- ✅ **Complex integrations** - Understand existing patterns first
- ❌ **Greenfield projects** - Skip this for new codebases

**Example**:
```bash
/kiro:validate-gap user-auth-oauth
```

<details>
<summary><strong>Sample Gap Analysis</strong></summary>

```
## Gap Analysis Summary

### Scope
Adding OAuth 2.0 authentication to existing username/password system

### Key Findings
- ✅ Authentication middleware exists (src/middleware/auth.ts)
- ✅ User model already has email field
- ❌ No OAuth provider integration
- ❌ Missing JWT token management
- ⚠️ Current session uses cookies, needs JWT migration

### Implementation Approaches

**Option 1: Extend Existing Auth (Recommended)**
Pros: Preserves current users, gradual migration
Cons: Dual auth systems temporarily
Effort: Medium (3-4 days)
Risk: Low

**Option 2: Replace with OAuth-Only**
Pros: Clean architecture, modern approach
Cons: Requires user migration, breaking change
Effort: High (5-7 days)
Risk: Medium

**Option 3: Parallel Systems**
Pros: Zero downtime, safe rollback
Cons: Complex maintenance
Effort: High (6-8 days)
Risk: Low

### Recommendations
1. Start with Option 1 (extend existing)
2. Phase 1: Add OAuth alongside current auth
3. Phase 2: Migrate existing users to OAuth
4. Phase 3: Deprecate username/password (6 months)

### Areas Requiring Research
- JWT library selection (jsonwebtoken vs jose)
- OAuth provider rate limits and quotas
- Token refresh strategy (sliding window vs absolute expiry)

## Next Steps
Proceed to design phase with this analysis:
```bash
/kiro:spec-design user-auth-oauth
```
```

</details>

**Analysis Framework**:
1. **Existing Capabilities** - What's already implemented
2. **Missing Capabilities** - What needs to be built
3. **Integration Points** - Where new code connects
4. **Multiple Options** - Viable approaches with trade-offs
5. **Research Needs** - Areas requiring deeper investigation

**Common Issues**:

| Issue | Cause | Solution |
|-------|-------|----------|
| ❌ "Requirements not found" | Wrong feature name or phase | Run `/kiro:spec-requirements` first |
| ⚠️ Analysis too shallow | Small codebase | Provide more context manually if needed |
| ⚠️ Missing integration points | Incomplete steering | Update `/kiro:steering` with current architecture |
| 💡 "Can I skip this?" | Greenfield project | Yes - this is optional for new codebases |

**Pro Tips**:
- 💡 **Not mandatory** - Optional quality gate, especially useful for brownfield
- 💡 Informs **design decisions** - Use findings in spec-design phase
- 💡 **Multiple approaches** - AI evaluates trade-offs to help decision-making
- 💡 Gap analysis can **identify risks early**
- 💡 Flags areas needing **further research** before design

**Related Commands**:
- [`/kiro:spec-requirements`](#kirospec-requirements) - Must run before gap analysis
- [`/kiro:spec-design`](#kirospec-design) - Next step after gap analysis
- [`/kiro:validate-design`](#kirovalidate-design) - Design validation after creation

---

### `/kiro:validate-design`

**Purpose**: Interactive technical design quality review to ensure readiness for implementation (optional quality gate).

**Parameters**: `<feature-name>`

**Usage**:
```bash
/kiro:validate-design <feature-name>
```

**Arguments**:
- `<feature-name>` (required): Feature directory name

**What it does**:
1. Loads design document and all context
2. Conducts interactive quality review
3. Identifies **maximum 3 critical issues**
4. Recognizes design strengths
5. Provides **GO/NO-GO decision** with rationale

**When to use**:
- ✅ **Complex architectures** - High-risk or complex designs
- ✅ **Before task breakdown** - Catch issues early
- ✅ **Team review** - Structured review process
- ❌ **Simple features** - Skip for straightforward implementations

**Example**:
```bash
/kiro:validate-design user-auth-oauth
```

<details>
<summary><strong>Sample Design Review</strong></summary>

```
## Design Review: user-auth-oauth

### Review Summary
Design is comprehensive with well-defined components and security considerations. 
Minor gaps in error handling and testing strategy require attention before implementation.

### Critical Issues

**1. Token Refresh Race Condition (High Priority)**
Current design doesn't handle concurrent refresh requests. If multiple tabs 
refresh simultaneously, could invalidate tokens incorrectly.

Recommendation: Implement token refresh lock mechanism using Redis or in-memory store.

**2. Missing OAuth State Validation (Security)**
Design lacks CSRF protection via OAuth state parameter. Vulnerable to authorization 
code interception attacks.

Recommendation: Generate and validate cryptographic state parameter in OAuth flow.

**3. Error Handling Incomplete (Medium Priority)**
Design specifies happy path but lacks comprehensive error scenarios:
- OAuth provider downtime
- Token expiry during request
- Revoked OAuth permissions

Recommendation: Add error handling section with retry strategies and user feedback.

### Design Strengths
- ✅ Well-architected component separation (AuthProvider, TokenManager, OAuthHandler)
- ✅ Database schema includes proper indexes and constraints
- ✅ Security considerations comprehensive (HTTPS, rate limiting, secure cookies)

### Final Assessment
**🟡 CONDITIONAL GO**

Design is solid but requires addressing the 3 critical issues before task generation. 
All issues are addressable within existing architecture - no fundamental redesign needed.

Estimated fix time: 2-3 hours of design refinement.

### Next Steps
1. Update design.md to address the 3 issues above
2. Re-run validation or proceed directly to tasks if confident
3. Generate tasks: `/kiro:spec-tasks user-auth-oauth`
```

</details>

**Decision Types**:
- **🟢 GO** - Design ready for implementation
- **🟡 CONDITIONAL GO** - Minor issues to address, but can proceed
- **🔴 NO-GO** - Fundamental issues requiring redesign

**Review Criteria**:
- ✅ Requirements coverage
- ✅ Component interfaces and contracts
- ✅ Integration with existing system
- ✅ Security considerations
- ✅ Error handling and edge cases
- ✅ Testability
- ✅ Performance implications

**Common Issues**:

| Issue | Cause | Solution |
|-------|-------|----------|
| ❌ "Design not found" | Wrong feature name or phase | Run `/kiro:spec-design` first |
| ⚠️ Too many critical issues | Complex or incomplete design | Address issues and re-run validation |
| ⚠️ Review too lenient | Simple feature | Validation focuses on critical risks only |
| 💡 "Do I need this?" | Unsure if required | Optional - use for complex/risky designs |

**Critical Issues Guidelines**:
- **Maximum 3 issues** - Focus on most important
- **Significantly impact success** - Not nitpicks or style preferences
- **Actionable** - Clear recommendations provided
- **Prioritized** - Ordered by severity/risk

**Pro Tips**:
- 💡 **Not mandatory** - Optional quality gate before task generation
- 💡 **Interactive process** - Engage in dialogue with AI about concerns
- 💡 Focuses on **critical risks** only, not perfection
- 💡 **Balanced assessment** - Recognizes strengths too
- 💡 Use for **peer review** - Structured format for team discussions

**Related Commands**:
- [`/kiro:spec-design`](#kirospec-design) - Must run before design validation
- [`/kiro:spec-tasks`](#kirospec-tasks) - Next step after GO decision
- [`/kiro:validate-gap`](#kirovalidate-gap) - Optional pre-design validation

---

### `/kiro:validate-impl`

**Purpose**: Validate implementation against requirements, design, and tasks to ensure quality and completeness.

**Parameters**: `[feature-name] [task-numbers]`

**Usage**:
```bash
/kiro:validate-impl [feature-name] [task-numbers]
```

**Arguments**:
- `[feature-name]` (optional): Feature to validate
  - If omitted: Detects from conversation history
- `[task-numbers]` (optional): Specific tasks to validate
  - Format: `1.1,1.2,1.3`
  - If omitted: Validates all completed tasks (`[x]`)

**What it does**:
1. **Detects** completed implementations (from history or checkboxes)
2. **Loads** requirements, design, tasks, and steering context
3. **Validates**:
   - ✅ Tests exist and pass
   - ✅ Requirements traceability (EARS requirements covered)
   - ✅ Design structure reflected in code
   - ✅ No regressions in existing functionality
4. **Reports** validation results

**Examples**:
```bash
# Auto-detect from recent /kiro:spec-impl commands
/kiro:validate-impl

# Validate specific feature (all completed tasks)
/kiro:validate-impl user-auth-oauth

# Validate specific tasks
/kiro:validate-impl user-auth-oauth 1.1,1.2,1.3
```

<details>
<summary><strong>Sample Implementation Validation</strong></summary>

```
## Implementation Validation: user-auth-oauth

### Detected Implementations
From conversation history:
- Task 1.1: Create User table with OAuth fields ✅
- Task 1.2: Create Session table for JWT token management ✅
- Task 1.3: Create RefreshToken table ✅

### Validation Results

#### ✅ Task 1.1: User Table
**Tests**: 5/5 passing
- ✓ User.create() with OAuth fields
- ✓ Validation for required fields
- ✓ Unique constraint on email+provider
- ✓ Database migration rollback

**Requirements Coverage**:
- ✓ FR-1.1.1: Store user OAuth provider data
- ✓ FR-1.1.2: Unique user identification

**Design Alignment**:
- ✓ Matches User model specification in design.md
- ✓ Includes all specified fields
- ✓ Implements specified constraints

**Code Quality**: No issues

---

#### ✅ Task 1.2: Session Table
**Tests**: 4/4 passing
- ✓ Session creation with JWT
- ✓ Session expiry validation
- ✓ Token refresh mechanism
- ✓ Concurrent session handling

**Requirements Coverage**:
- ✓ FR-2.1.1: JWT token generation
- ✓ FR-2.1.2: Token expiry management

**Design Alignment**:
- ✓ Follows TokenManager design
- ✓ Implements refresh strategy

**Code Quality**: No issues

---

#### ⚠️ Task 1.3: RefreshToken Table
**Tests**: 3/4 passing
- ✓ Token rotation
- ✓ Revocation handling
- ❌ FAILING: Concurrent refresh test (race condition)

**Requirements Coverage**:
- ✓ FR-2.2.1: Refresh token rotation
- ⚠️ FR-2.2.2: Thread-safe refresh (test failing)

**Design Alignment**:
- ✓ Structure matches design
- ⚠️ Missing lock mechanism from design spec

**Code Quality Issues**:
1. Race condition in concurrent refresh (test failure)
2. Missing Redis lock from design.md

**Recommendation**: Fix race condition before proceeding

---

### Summary
- ✅ 2/3 tasks fully validated
- ⚠️ 1/3 tasks with issues requiring attention
- Overall: 12/13 tests passing (92%)
- Requirements coverage: 5/6 (83%)

### Next Steps
1. Fix Task 1.3 race condition
2. Re-run validation: `/kiro:validate-impl user-auth-oauth 1.3`
3. Continue with Task 2.x when ready
```

</details>

**Validation Checks**:
1. **Test Coverage**
   - Tests exist for implemented functionality
   - All tests passing
   - No regressions in existing tests

2. **Requirements Traceability**
   - EARS requirements mapped to implementation
   - All specified functionality present

3. **Design Alignment**
   - Code structure follows design.md
   - Components match specifications
   - Interfaces implemented correctly

4. **Code Quality**
   - No obvious issues or anti-patterns
   - Follows project conventions from steering

**When to use**:
- ✅ **After implementation** - Validate completed tasks
- ✅ **Before PR/merge** - Quality gate for code review
- ✅ **Debugging** - Identify gaps when features not working
- ✅ **Progress check** - Verify implementation completeness

**Common Issues**:

| Issue | Cause | Solution |
|-------|-------|----------|
| ❌ "No implementation found" | No completed tasks | Run `/kiro:spec-impl` first |
| ❌ "Tests failing" | Implementation incomplete/broken | Fix failing tests before validation passes |
| ⚠️ Missing requirements | Incomplete implementation | Implement missing functionality |
| ⚠️ Design mismatch | Code doesn't follow design | Refactor to match design.md specifications |
| 💡 Auto-detection not working | No history | Specify feature and task numbers explicitly |

**Auto-Detection**:
Scans conversation history for:
```bash
/kiro:spec-impl user-auth-oauth 1.1,1.2,1.3
```
Extracts: `user-auth-oauth` and tasks `1.1, 1.2, 1.3`

**Pro Tips**:
- 💡 Run after **each implementation session** to catch issues early
- 💡 **Auto-detection** works great in continuous conversation
- 💡 Use as **quality gate** before moving to next major task
- 💡 **Regressions** are flagged - existing tests must still pass
- 💡 Pair with `/kiro:spec-status` for complete progress view

**Related Commands**:
- [`/kiro:spec-impl`](#kirospec-impl) - Implementation execution
- [`/kiro:spec-status`](#kirospec-status) - Overall feature progress
- [`/kiro:spec-tasks`](#kirospec-tasks) - View task list

---

## Status & Utility

### `/kiro:spec-status`

**Purpose**: Display comprehensive status and progress for a specification across all phases.

**Parameters**: `<feature-name>`

**Usage**:
```bash
/kiro:spec-status <feature-name>
```

**Arguments**:
- `<feature-name>` (required): Feature directory name to check

**What it does**:
1. Loads spec metadata from `spec.json`
2. Analyzes all spec files (requirements, design, tasks)
3. Calculates completion percentages
4. Identifies next actions
5. Reports any blockers

**Example**:
```bash
/kiro:spec-status user-auth-oauth
```

<details>
<summary><strong>Sample Status Report</strong></summary>

```
# Status: user-auth-oauth

## Feature Overview
**Name**: User Auth OAuth  
**Phase**: Implementation  
**Last Updated**: 2025-10-29 14:23:45  
**Language**: en

---

## Phase Status

### ✅ Requirements (100% Complete)
- Generated: Yes
- Approved: Yes
- Total: 15 requirements, 87 acceptance criteria
- All requirements mapped to tasks

### ✅ Design (100% Complete)
- Generated: Yes
- Approved: Yes
- Components: 7 core components
- Diagrams: 3 Mermaid diagrams
- Integration points: 3 API routes

### ✅ Tasks (100% Complete)
- Generated: Yes
- Approved: Yes
- Major tasks: 8
- Sub-tasks: 24

### ⏳ Implementation (58% Complete)
- Completed: 14/24 tasks
- Remaining: 10 tasks
- Current focus: Task 3.x (Authentication API Routes)

---

## Task Progress

### Completed Tasks (14) ✅
- [x] 1.1 Create User table with OAuth fields
- [x] 1.2 Create Session table for JWT token management
- [x] 1.3 Create RefreshToken table
- [x] 1.4 Add database migrations and rollback scripts
- [x] 2.1 Set up Google OAuth client credentials
- [x] 2.2 Set up GitHub OAuth application
- [x] 2.3 Implement environment variable configuration
- [x] 2.4 Create OAuth provider abstraction layer
- [x] 3.1 Implement /api/auth/[provider]/login endpoint
- [x] 3.2 Implement /api/auth/callback handler
- [x] 3.3 Implement /api/auth/logout endpoint
- [x] 3.4 Implement /api/auth/refresh endpoint
- [x] 4.1 Create TokenManager service
- [x] 4.2 Implement JWT generation and validation

### Remaining Tasks (10) ⏳
- [ ] 4.3 Implement token refresh logic
- [ ] 4.4 Add token revocation mechanism
- [ ] 5.1 Create AuthProvider React context
- [ ] 5.2 Implement useAuth hook
- [ ] 5.3 Add authentication guards for routes
- [ ] 6.1 Write unit tests for OAuth flow
- [ ] 6.2 Write integration tests for API routes
- [ ] 6.3 Add E2E tests for login/logout
- [ ] 7.1 Implement rate limiting middleware
- [ ] 8.1 Update documentation and examples

---

## Next Action
Continue implementation with remaining tasks:
```bash
/kiro:spec-impl user-auth-oauth 4.3,4.4,5.1
```

Or implement all remaining tasks:
```bash
/kiro:spec-impl user-auth-oauth
```

---

## Issues
⚠️ **Warning**: Task 3.x completed but validation not run.  
  Recommended: `/kiro:validate-impl user-auth-oauth` to verify quality

---

## Estimated Completion
- Remaining effort: ~20-30 hours (10 tasks × 2-3 hours each)
- At current pace: ~3-4 days
```

</details>

**Status Indicators**:
- ✅ **Complete** - Phase finished and approved
- ⏳ **In Progress** - Phase started, not finished
- ❌ **Blocked** - Cannot proceed (missing dependencies)
- 🔄 **Needs Review** - Generated but not approved

**When to use**:
- ✅ **Check progress** - See where feature stands
- ✅ **After breaks** - Resume work after time away
- ✅ **Planning** - Estimate remaining effort
- ✅ **Debugging** - Identify missing approvals or files
- ✅ **Status updates** - Share progress with team

**Common Issues**:

| Issue | Cause | Solution |
|-------|-------|----------|
| ❌ "Spec not found" | Wrong feature name | List specs in `.kiro/specs/` directory |
| ⚠️ Percentages incorrect | tasks.md parsing issue | Verify checkbox format: `- [ ]` and `- [x]` |
| 💡 Missing next action | Unclear phase | Status should suggest next command |

**Completion Calculation**:
- **Requirements**: Generated + Approved = 100%
- **Design**: Generated + Approved = 100%
- **Tasks**: Generated + Approved = 100%
- **Implementation**: (Completed Tasks / Total Tasks) × 100%

**Pro Tips**:
- 💡 Run **frequently** to track progress
- 💡 **Estimates** help with planning and scheduling
- 💡 **Blockers** section highlights what prevents progress
- 💡 Use to **resume work** after context switch
- 💡 Great for **status updates** in team meetings

**Related Commands**:
- [`/kiro:spec-impl`](#kirospec-impl) - Continue implementation
- [`/kiro:validate-impl`](#kirovalidate-impl) - Validate completed work
- All other spec commands based on current phase

---

## Workflow Examples

<details>
<summary><strong>Complete Greenfield Flow</strong></summary>

```bash
# 1. Project setup
/kiro:steering

# 2. Initialize feature
/kiro:spec-init User authentication with OAuth 2.0 and JWT tokens

# 3. Generate requirements
/kiro:spec-requirements user-auth-oauth

# 4. Create design
/kiro:spec-design user-auth-oauth

# 5. Break into tasks
/kiro:spec-tasks user-auth-oauth

# 6. Implement incrementally
/kiro:spec-impl user-auth-oauth 1.1,1.2
/kiro:spec-impl user-auth-oauth 1.3,1.4
/kiro:spec-impl user-auth-oauth 2

# 7. Check progress
/kiro:spec-status user-auth-oauth

# 8. Validate implementation
/kiro:validate-impl user-auth-oauth
```

</details>

<details>
<summary><strong>Brownfield Flow (Existing Project)</strong></summary>

```bash
# 1. Establish project context
/kiro:steering
/kiro:steering-custom  # Add domain-specific patterns

# 2. Initialize enhancement
/kiro:spec-init Add OAuth to existing auth system

# 3. Generate requirements
/kiro:spec-requirements oauth-enhancement

# 4. Analyze integration gaps
/kiro:validate-gap oauth-enhancement

# 5. Create design (informed by gap analysis)
/kiro:spec-design oauth-enhancement

# 6. Validate design against existing system
/kiro:validate-design oauth-enhancement

# 7. Break into tasks
/kiro:spec-tasks oauth-enhancement

# 8. Implement and validate
/kiro:spec-impl oauth-enhancement 1.1,1.2
/kiro:validate-impl oauth-enhancement
```

</details>

<details>
<summary><strong>Fast-Track Flow (Experienced Users)</strong></summary>

```bash
# 1. Quick setup
/kiro:steering

# 2. Initialize with description
/kiro:spec-init Add user profile page with avatar upload

# 3. Auto-approve through design
/kiro:spec-requirements user-profile
/kiro:spec-design user-profile -y
/kiro:spec-tasks user-profile -y

# 4. Implement all at once
/kiro:spec-impl user-profile

# 5. Final validation
/kiro:validate-impl user-profile
```

</details>

---

## Common Patterns

<details>
<summary><strong>Iterative Refinement</strong></summary>

```bash
# Generate initial version
/kiro:spec-requirements feature

# Review and refine (run multiple times)
/kiro:spec-requirements feature  # Updates based on feedback

# Same for design and tasks
/kiro:spec-design feature
/kiro:spec-design feature  # Refine based on review
```

</details>

<details>
<summary><strong>Incremental Implementation</strong></summary>

```bash
# Implement one major task at a time
/kiro:spec-impl feature 1
/kiro:validate-impl feature

/kiro:spec-impl feature 2
/kiro:validate-impl feature

# Check overall progress
/kiro:spec-status feature
```

</details>

### Quality Gates
```bash
# Optional gates at each phase
/kiro:spec-requirements feature
/kiro:validate-gap feature          # Optional: brownfield only

/kiro:spec-design feature
/kiro:validate-design feature       # Optional: complex designs

/kiro:spec-tasks feature

/kiro:spec-impl feature 1.1,1.2
/kiro:validate-impl feature         # Optional: after each session
```

---

## Tips & Best Practices

### General
- 🎯 **Always start with steering** for existing projects - dramatically improves quality
- 🎯 **One feature at a time** - avoid parallel spec development
- 🎯 **Commit frequently** - after each completed task or phase
- 🎯 **Review before approve** - don't auto-approve (`-y`) production features

### Steering
- 💡 Run `/kiro:steering` **first** for existing projects
- 💡 Re-run after **major refactoring** to update context
- 💡 Use `/kiro:steering-custom` for **repeated domain patterns**
- 💡 Steering is **additive** - preserves your customizations

### Requirements
- 💡 Be **specific** in descriptions - include constraints and context
- 💡 **Iterate freely** - run multiple times to refine
- 💡 Verify **EARS format** for testable acceptance criteria
- 💡 All requirements should be **testable and verifiable**

### Design
- 💡 Use `-y` flag **carefully** - skips requirements review
- 💡 Let AI **research** - discovery phase finds best practices
- 💡 **Review diagrams** - ensure Mermaid syntax renders correctly
- 💡 Design can be **edited and regenerated** (merge mode)

### Tasks
- 💡 Tasks should be **1-3 hours** each - raise issue if larger
- 💡 **Natural language** descriptions - what to do, not code structure
- 💡 Verify **all requirements** have corresponding tasks
- 💡 Check **task order** - should follow logical sequence

### Implementation
- 💡 **TDD is mandatory** - tests before code
- 💡 Start with **small batches** - 1-2 tasks initially
- 💡 Watch for **regressions** - existing tests must pass
- 💡 Run `/kiro:spec-status` **frequently** to track progress
- 💡 Use `/kiro:validate-impl` after **each session**

### Validation
- 💡 **validate-gap**: Use for brownfield, skip for greenfield
- 💡 **validate-design**: Use for complex/risky designs
- 💡 **validate-impl**: Use after each implementation session
- 💡 Validation is **optional** - quality gates, not blockers

---

## Troubleshooting

### "Feature not found"
**Cause**: Wrong feature name or spec doesn't exist  
**Solution**: Check `.kiro/specs/` directory for correct name

### "Requirements/Design not approved"
**Cause**: Phase not marked as approved in spec.json  
**Solution**: Review the document and approve, or use `-y` flag

### "Template missing"
**Cause**: Corrupted or incomplete installation  
**Solution**: Reinstall cc-sdd: `npx cc-sdd@latest`

### Tasks not completing
**Cause**: Checkbox format incorrect in tasks.md  
**Solution**: Ensure format is exactly `- [ ]` (unchecked) or `- [x]` (checked)

### Tests failing during implementation
**Cause**: Implementation incomplete or incorrect  
**Solution**: Fix failing tests before moving to next task (TDD RED→GREEN→REFACTOR)

### Steering seems outdated
**Cause**: Codebase changed since last steering update  
**Solution**: Re-run `/kiro:steering` to sync with current code

### AI suggestions don't match project
**Cause**: Incomplete or missing steering context  
**Solution**: Run `/kiro:steering` and `/kiro:steering-custom` for domain patterns

---

## Quick Reference Card

```
┌─────────────────────────────────────────────────────────────┐
│ cc-sdd Command Quick Reference                              │
├─────────────────────────────────────────────────────────────┤
│ STEERING                                                    │
│  /kiro:steering              Create/update project memory   │
│  /kiro:steering-custom       Add domain-specific context    │
├─────────────────────────────────────────────────────────────┤
│ SPEC WORKFLOW                                               │
│  /kiro:spec-init <desc>      Initialize feature             │
│  /kiro:spec-requirements <f> Generate requirements          │
│  /kiro:spec-design <f> [-y]  Create technical design        │
│  /kiro:spec-tasks <f> [-y]   Break into implementation      │
│  /kiro:spec-impl <f> [tasks] Execute with TDD               │
├─────────────────────────────────────────────────────────────┤
│ VALIDATION (Optional)                                       │
│  /kiro:validate-gap <f>      Analyze existing vs required   │
│  /kiro:validate-design <f>   Review design quality          │
│  /kiro:validate-impl [f] [t] Validate implementation        │
├─────────────────────────────────────────────────────────────┤
│ STATUS                                                      │
│  /kiro:spec-status <f>       Check progress                 │
└─────────────────────────────────────────────────────────────┘

Legend: <f> = feature-name, [t] = task-numbers, [-y] = auto-approve
```

---

## Related Documentation

- [Spec-Driven Development Workflow](spec-driven.md) - Conceptual overview and methodology
- [Claude Code Subagents](claude-subagents.md) - Subagent workflow patterns
- [Project README](../../README.md) - Installation and quick start

---

**Last Updated**: 2025-10-29  
**Version**: 2.0.0-alpha.3
