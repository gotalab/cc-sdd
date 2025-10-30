# Customization Guide

Tailor cc-sdd templates to match your team's workflow, tech stack, and approval processes.

## Keep These Patterns

cc-sdd relies on a few structural cues so commands like `/kiro:spec-impl` can parse your specs correctly:

- **Requirements**: Keep numbering (`Requirement 1`, `Requirement 2`) and EARS-style acceptance criteria
- **Tasks**: Keep checkbox/numbering (`- [ ] 1.`, `- [ ] 2.1`) and `_Requirements: X_` references (order can follow implementation flow)
- **Design**: Keep section headings (AI groups content by heading)

Everything else—context, metadata, extra sections—is yours to customize.

## Customize in Three Steps
1. Copy the default templates by opening files under `{{KIRO_DIR}}/settings/templates/`.
2. Add the structure your team expects while keeping the numbering and checkboxes intact.
3. Regenerate a spec to confirm the AI follows your additions, then iterate.

## Why Customize?

Custom templates make generated specs feel native to your workflow:
- ✅ Match company review/approval gates
- ✅ Reflect domain or tech stack expectations
- ✅ Produce ready-to-share requirements, designs, and task lists

## Templates You Can Edit

All templates in `{{KIRO_DIR}}/settings/templates/` are editable:

```
{{KIRO_DIR}}/settings/templates/
├── specs/
│   ├── requirements.md     # Requirements format
│   ├── design.md           # Design doc structure
│   └── tasks.md            # Task breakdown format
└── steering/
    ├── product.md          # Product context template
    ├── tech.md             # Tech stack template
    └── structure.md        # Architecture template
```

**How it works**: AI reads these templates and generates specs matching their structure.


## Customization Playbook

Pick the scenario that matches your team, copy the snippet into the right template, and regenerate a spec to validate the output.

### Example 1: PRD-Style Requirements
- **Edit**: `{{KIRO_DIR}}/settings/templates/specs/requirements.md`
- **Use when**: Product teams expect PRD context before diving into requirements
- **Keep**: Requirement numbering (1, 2, 3...) and EARS acceptance criteria
- **Add**: Product overview, business context, non-functional requirement section

<details>
<summary><strong>Show customization</strong></summary>

**Add to template** (preserve EARS structure):
```markdown
## Product Overview
**Problem Statement**: [What problem does this solve?]
**Target Users**: [Who benefits?]
**Success Metrics**: [How do we measure success?]

---

## Requirements

### Requirement 1: [Feature Name]
**Objective:** As a [role], I want [capability], so that [benefit]

**Business Context**:
- Priority: P0 / P1 / P2
- Timeline: [Target date]
- Dependencies: [What must be ready first?]

#### Acceptance Criteria
1. WHEN [event] THEN [system] SHALL [response]
2. IF [precondition] THEN [system] SHALL [response]
3. WHERE [context] THE [system] SHALL [behavior]

---

## Non-Functional Requirements

### Requirement NFR-1: Performance
**Objective:** Ensure system responsiveness

#### Acceptance Criteria
1. WHEN page loads THEN system SHALL respond within 2 seconds
2. WHEN API called THEN system SHALL respond within 200ms
```

- **Result**: PRD-style docs that still work with `/kiro:spec-impl` and `/kiro:validate-impl`.

</details>

---

### Example 2: Frontend-Focused Design
- **Edit**: `{{KIRO_DIR}}/settings/templates/specs/design.md`
- **Use when**: You need component architecture, state management, and UX flows up front
- **Keep**: Section headings and Mermaid diagram blocks (AI relies on them)
- **Add**: Component hierarchy, state patterns, accessibility/performance checklists

<details>
<summary><strong>Show customization</strong></summary>

**Add sections**:
```markdown
## Component Hierarchy
\`\`\`
App
├── FeatureContainer (state)
│   ├── FeatureHeader (presentational)
│   ├── FeatureContent (presentational)
│   └── FeatureFooter (presentational)
\`\`\`

## State Management
**Global State** (Redux/Zustand):
- User authentication
- App settings

**Local State** (useState):
- Form inputs
- UI toggles

## API Integration
**Endpoints**:
- `GET /api/...`
- `POST /api/...`

**Error Handling**:
- Loading states
- Error boundaries
- Toast notifications

## Accessibility
- [ ] Keyboard navigation
- [ ] ARIA labels
- [ ] Screen reader tested

## Performance
- [ ] Code splitting
- [ ] Lazy loading
- [ ] Memoization strategy
```

- **Result**: Design docs now focus on React/Vue/frontend concerns.

</details>

---

### Example 3: Backend-Focused Design
- **Edit**: `{{KIRO_DIR}}/settings/templates/specs/design.md`
- **Use when**: API contracts, database schemas, or service architecture drive your reviews
- **Keep**: Headings + Mermaid blocks so validation commands can map design sections
- **Add**: Endpoint specs, SQL schema, security/performance checklists

<details>
<summary><strong>Show customization</strong></summary>

**Add sections**:
```markdown
## API Specification

### Endpoints
**POST /api/v1/resource**
- **Auth**: Bearer token required
- **Request**: `{ field: string, ... }`
- **Response**: `{ id: string, ... }`
- **Errors**: 400, 401, 500

## Database Schema
\`\`\`sql
CREATE TABLE resource (
  id UUID PRIMARY KEY,
  created_at TIMESTAMP,
  ...
);
\`\`\`

**Indexes**: ...  
**Constraints**: ...

## Service Architecture
\`\`\`mermaid
graph LR
  API[API Gateway] --> Service[Resource Service]
  Service --> DB[(PostgreSQL)]
  Service --> Cache[(Redis)]
\`\`\`

## Security
- [ ] Input validation
- [ ] SQL injection prevention
- [ ] Rate limiting
- [ ] Authentication/authorization

## Performance
- [ ] Database query optimization
- [ ] Caching strategy
- [ ] Connection pooling
```

- **Result**: Design docs now cover API, DB, and backend infrastructure.

</details>

---

### Example 4: Company Approval Process
- **Edit**: `{{KIRO_DIR}}/settings/templates/specs/design.md`
- **Use when**: Specs must capture security or architecture sign-off steps
- **Keep**: Existing headings so validation still references the right sections
- **Add**: Checklists and approval checkboxes for each review team

<details>
<summary><strong>Show customization</strong></summary>

**Add approval sections**:
```markdown
## Security Review Checklist
- [ ] Authentication mechanism reviewed
- [ ] Authorization model validated
- [ ] Input validation documented
- [ ] Secrets management plan
- [ ] Compliance requirements (GDPR, SOC2, etc.)

**Security Team Approval**: [ ] @security-team

---

## Architecture Review Checklist
- [ ] Follows established patterns
- [ ] Scalability considerations documented
- [ ] Database schema approved
- [ ] API design reviewed
- [ ] Observability/monitoring plan

**Architecture Team Approval**: [ ] @architecture-team

---

## Implementation Approval
**Approved by**: [Name]  
**Date**: [YYYY-MM-DD]  
**Notes**: ...
```

- **Result**: Generated designs include built-in approval workflow.

</details>

---

### Example 5: Task Execution Control
- **Edit**: `{{KIRO_DIR}}/settings/templates/specs/tasks.md`
- **Use when**: Implementation planning needs parallel markers or dependency notes
- **Keep**: Checkbox numbering (`- [ ] 1.`, `- [ ] 2.1`) and `_Requirements: X_` references
- **Add**: Parallel-safe markers, dependency/priority metadata, execution comments

<details>
<summary><strong>Show customization</strong></summary>

**Customize while preserving structure**:
```markdown
- [ ] 1. Set up project foundation (P)
  - Initialize technology stack
  - Configure infrastructure
  - **Parallel-safe**: Yes (no dependencies)
  - _Requirements: All requirements need foundation_

- [ ] 2. Build authentication system
- [ ] 2.1 Implement login functionality (CRITICAL)
  - Set up user data storage with validation
  - Build authentication mechanism
  - **Depends on**: 1 (requires foundation)
  - **Blocking**: Yes (other features depend on auth)
  - _Requirements: 1_

- [ ] 2.2 Implement logout functionality (P)
  - Clear session on logout
  - Redirect to login page
  - **Depends on**: 2.1
  - **Parallel-safe**: Yes (can run with 2.3)
  - _Requirements: 2_

- [ ] 2.3 Implement session refresh (P)
  - Token refresh mechanism
  - **Depends on**: 2.1
  - **Parallel-safe**: Yes (can run with 2.2)
  - _Requirements: 3_

- [ ] 3. Build API endpoints
- [ ] 3.1 Create /api/auth/login endpoint
  - **Depends on**: 2.1 (requires auth logic)
  - _Requirements: 4, 5_

- [ ] 3.2 Create /api/auth/logout endpoint (P)
  - **Depends on**: 2.2, 3.1
  - **Parallel-safe**: Yes (with 3.3)
  - _Requirements: 6_

- [ ] 3.3 Create /api/auth/refresh endpoint (P)
  - **Depends on**: 2.3, 3.1
  - **Parallel-safe**: Yes (with 3.2)
  - _Requirements: 7_
```

**Legend**:
- `(P)` - Parallel-safe (can execute simultaneously with other P tasks)
- `(CRITICAL)` - Blocking task (other tasks depend on this)
- `**Depends on**` - Must wait for these tasks to complete
- `**Parallel-safe**` - Explicit marker for concurrent execution
- `_Requirements: X_` - Which requirements this task implements

- **Result**: Clear execution strategy for AI and developers.

</details>

---

### Example 6: JIRA/Linear Integration
- **Edit**: `{{KIRO_DIR}}/settings/templates/specs/tasks.md`
- **Use when**: You want generated tasks ready to paste into JIRA, Linear, or Asana
- **Keep**: Checkbox numbering so `/kiro:spec-impl` can execute tasks
- **Add**: Priority, estimation, labels, and custom fields that match your tracker

<details>
<summary><strong>Show customization</strong></summary>

**Add metadata for issue trackers**:
```markdown
- [ ] 1.1: Create User model with OAuth fields
  **Type**: Story  
  **Priority**: High  
  **Estimation**: 3 story points  
  **Assignee**: TBD  
  **Labels**: backend, database  
  
  **Implements**: Requirements 1.1, 1.2  
  **Acceptance Criteria**: 1.1.1, 1.1.2
  
  **JIRA Fields**:
  - Epic: AUTH-123
  - Sprint: Sprint 15
  - Components: Backend, Security
```

- **Result**: Tasks copy directly into your issue tracker with metadata intact.

</details>

---

### Example 7: Domain-Specific Steering
- **Create**: `{{KIRO_DIR}}/steering/api-standards.md` via `/kiro:steering-custom`
- **Use when**: You need AI outputs to follow domain rules (REST, payments, localization, etc.)
- **Keep**: Heading hierarchy so steering docs stay scannable
- **Add**: Concrete examples, payload formats, rate limits, error contracts

<details>
<summary><strong>Show example</strong></summary>

**Content**:
```markdown
# API Standards

## REST Conventions
- Base URL: `/api/v1`
- Versioning: URL-based (`/v1`, `/v2`)
- Authentication: Bearer tokens

## Request/Response Format
**Success**:
\`\`\`json
{
  "data": { ... },
  "meta": { "timestamp": "..." }
}
\`\`\`

**Error**:
\`\`\`json
{
  "error": {
    "code": "INVALID_INPUT",
    "message": "...",
    "details": { ... }
  }
}
\`\`\`

## Rate Limiting
- 100 requests/minute per user
- Header: `X-RateLimit-Remaining`

## Pagination
- Query params: `?page=1&limit=20`
- Response includes `meta.total`, `meta.page`
```

- **Result**: AI automatically follows these patterns in all designs.

</details>

---

## Best Practices

### ✅ Do
- **Keep it concise** - Templates guide structure, not content
- **Preserve formats** - Requirements (1, 2...), EARS criteria, Tasks (`- [ ] 1.`, `- [ ] 2.1`)
- **Show relationships** - Tasks reference requirements via `_Requirements: 1, 2_`
- **Version control** - Commit `{{KIRO_DIR}}/settings/` to git

### ❌ Don't
- **Break numbering** - Keep requirement/task numbers simple for easy reference
- **Remove checkboxes** - `- [ ]` format required for task execution
- **Force task/requirement alignment** - Tasks follow optimal implementation order

---

## Template Variables

Templates support these variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `{{FEATURE_NAME}}` | Feature identifier | `user-auth-oauth` |
| `{{FEATURE_TITLE}}` | Human-readable name | `User Auth OAuth` |
| `{{KIRO_DIR}}` | Specs directory | `.kiro` (default) |
| `{{LANG}}` | Language code | `en`, `ja`, `zh-TW` |

**Usage in template**:
```markdown
# {{FEATURE_TITLE}} - Requirements

Feature ID: `{{FEATURE_NAME}}`
```

---

## Workflow Integration Examples

### Scenario: React + TypeScript + Tailwind

**Custom steering**: `{{KIRO_DIR}}/steering/tech.md`
```markdown
## Frontend Stack
- React 18 with TypeScript (strict mode)
- Tailwind CSS for styling
- React Query for data fetching
- Zustand for state management

## Component Patterns
- Functional components only
- Custom hooks for reusable logic
- Props interfaces in separate `.types.ts` files
```

**Result**: AI generates React-specific designs and tasks.

---

### Scenario: Rails Monolith

**Custom steering**: `{{KIRO_DIR}}/steering/structure.md`
```markdown
## Architecture
- Rails 7 monolith
- PostgreSQL database
- Sidekiq for background jobs
- RSpec for testing

## Conventions
- Fat models, skinny controllers
- Service objects for business logic
- Concerns for shared behavior
```

**Result**: Designs follow Rails patterns automatically.

---

## Troubleshooting

**AI ignores my custom template**
- Ensure file is in correct location: `{{KIRO_DIR}}/settings/templates/`
- Re-run command after template changes
- Check for syntax errors in markdown

**Generated docs too generic**
- Add more specific examples in templates
- Use custom steering for domain patterns
- Include required sections as headings

**Team members have different templates**
- Commit `{{KIRO_DIR}}/settings/` to version control
- Share across team via git
- Document customizations in team wiki

---

## Next Steps

1. **Identify gaps**: What's missing in default templates?
2. **Customize incrementally**: Start with one template
3. **Test**: Generate a spec and review output
4. **Iterate**: Refine based on team feedback
5. **Share**: Commit to git for team consistency

**Need help?** See [Command Reference](command-reference.md) for template-related commands.

---

**Last Updated**: 2025-10-29  
**Related**: [Spec-Driven Development Workflow](spec-driven.md)
