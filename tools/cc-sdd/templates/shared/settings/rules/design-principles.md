# Technical Design Rules and Principles

## Core Design Principles

### 1. Type Safety is Mandatory
- **NEVER** use `any` type in TypeScript interfaces
- Define explicit types for all parameters and returns
- Use discriminated unions for error handling
- Specify generic constraints clearly

### 2. Design vs Implementation
- **Focus on WHAT, not HOW**
- Define interfaces and contracts, not code
- Specify behavior through pre/post conditions
- Document architectural decisions, not algorithms

### 3. Visual Communication
- **Simple features**: Basic component diagram or none
- **Medium complexity**: Architecture + data flow
- **High complexity**: Multiple diagrams (architecture, sequence, state)
- **Always pure Mermaid**: No styling, just structure

### 4. Component Design Rules
- **Single Responsibility**: One clear purpose per component
- **Clear Boundaries**: Explicit domain ownership
- **Dependency Direction**: Follow architectural layers
- **Interface Segregation**: Minimal, focused interfaces

### 5. Data Modeling Standards
- **Domain First**: Start with business concepts
- **Consistency Boundaries**: Clear aggregate roots
- **Normalization**: Balance between performance and integrity
- **Evolution**: Plan for schema changes

### 6. Error Handling Philosophy
- **Fail Fast**: Validate early and clearly
- **Graceful Degradation**: Partial functionality over complete failure
- **User Context**: Actionable error messages
- **Observability**: Comprehensive logging and monitoring

### 7. Integration Patterns
- **Loose Coupling**: Minimize dependencies
- **Contract First**: Define interfaces before implementation
- **Versioning**: Plan for API evolution
- **Idempotency**: Design for retry safety

## Documentation Standards

### Language and Tone
- **Declarative**: "The system authenticates users" not "The system should authenticate"
- **Precise**: Specific technical terms over vague descriptions
- **Concise**: Essential information only
- **Formal**: Professional technical writing

### Structure Requirements
- **Hierarchical**: Clear section organization
- **Traceable**: Requirements to components mapping
- **Complete**: All aspects covered for implementation
- **Consistent**: Uniform terminology throughout

## Diagram Guidelines

### Mermaid Best Practices
```mermaid
graph TB
    A[Client] --> B[API Gateway]
    B --> C[Service A]
    B --> D[Service B]
    C --> E[Database]
```

- Use descriptive node names
- Show data flow direction
- Group related components
- Indicate external systems
- Keep layouts simple and readable
- **Avoid special characters in node IDs and labels**: 
  - **Node IDs**: Use only alphanumeric characters and underscores (no `@`, `/`, `-` at start, etc.)
  - **Node labels**: No parentheses `()`, brackets `[]` (except wrapper), quotes, or slashes
  - ❌ `DnD[@dnd-kit/core]` → ⚠️ Parse error (invalid ID with `@`)
  - ❌ `UI[KanbanBoard(React)]` → ⚠️ Parse error (invalid label with `()`)
  - ✅ `DndKit[dnd-kit/core]` → Use alphanumeric IDs, package names in labels
  - ✅ `UI[KanbanBoard UI]` → Use simple alphanumeric text
  - Details like technology stack belong in component descriptions, not diagram labels

### When to Include Diagrams
- Architecture: Always for 3+ components
- Sequence: For multi-step interactions
- State: For complex state machines
- ER: For complex data relationships
- Flow: For business processes

## Quality Metrics
### Design Completeness Checklist
- All requirements addressed
- No implementation details leaked
- Clear component boundaries
- Explicit error handling
- Comprehensive test strategy
- Security considered
- Performance targets defined
- Migration path clear (if applicable)

### Common Anti-patterns to Avoid
❌ Mixing design with implementation
❌ Vague interface definitions
❌ Missing error scenarios
❌ Ignored non-functional requirements
❌ Overcomplicated architectures
❌ Tight coupling between components
❌ Missing data consistency strategy
❌ Incomplete dependency analysis


