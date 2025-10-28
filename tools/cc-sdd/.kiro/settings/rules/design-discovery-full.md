# Full Discovery Process for Technical Design

## Objective
Conduct comprehensive research and analysis to ensure the technical design is based on complete, accurate, and up-to-date information.

## Discovery Steps

### 1. Requirements Analysis
**Map Requirements to Technical Needs**
- Extract all functional requirements from EARS format
- Identify non-functional requirements (performance, security, scalability)
- Determine technical constraints and dependencies
- List core technical challenges

### 2. Existing Implementation Analysis
**Understand Current System** (if modifying/extending):
- Analyze codebase structure and architecture patterns
- Map reusable components, services, utilities
- Identify domain boundaries and data flows
- Document integration points and dependencies
- Determine approach: extend vs refactor vs wrap

### 3. Technology Research
**Investigate Best Practices and Solutions**:
- **Use WebSearch** to find:
  - Latest architectural patterns for similar problems
  - Industry best practices for the technology stack
  - Recent updates or changes in relevant technologies
  - Common pitfalls and solutions

- **Use WebFetch** to analyze:
  - Official documentation for frameworks/libraries
  - API references and usage examples
  - Migration guides and breaking changes
  - Performance benchmarks and comparisons

### 4. External Dependencies Investigation
**For Each External Service/Library**:
- Search for official documentation and GitHub repositories
- Verify API signatures and authentication methods
- Check version compatibility with existing stack
- Investigate rate limits and usage constraints
- Find community resources and known issues
- Document security considerations
- Note any gaps requiring implementation investigation

### 5. Architecture Pattern Analysis
**Evaluate Architectural Options**:
- Compare relevant patterns (MVC, Clean, Hexagonal, Event-driven)
- Assess fit with existing architecture
- Consider scalability implications
- Evaluate maintainability and team expertise

### 6. Risk Assessment
**Identify Technical Risks**:
- Performance bottlenecks and scaling limits
- Security vulnerabilities and attack vectors
- Integration complexity and coupling
- Technical debt creation vs resolution
- Knowledge gaps and training needs

## Research Guidelines

### When to Search
**Always search for**:
- External API documentation and updates
- Security best practices for authentication/authorization
- Performance optimization techniques for identified bottlenecks
- Latest versions and migration paths for dependencies

**Search if uncertain about**:
- Architectural patterns for specific use cases
- Industry standards for data formats/protocols
- Compliance requirements (GDPR, HIPAA, etc.)
- Scalability approaches for expected load

### Search Strategy
1. Start with official sources (documentation, GitHub)
2. Check recent blog posts and articles (last 6 months)
3. Review Stack Overflow for common issues
4. Investigate similar open-source implementations

## Output Requirements
Document all findings that impact design decisions:
- Key insights affecting architecture
- Constraints discovered during research
- Recommended approaches based on findings
- Risks and mitigation strategies
- Gaps requiring further investigation during implementation