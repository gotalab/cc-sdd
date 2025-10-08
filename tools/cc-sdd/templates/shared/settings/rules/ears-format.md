# EARS Format Guidelines

## Overview
EARS (Easy Approach to Requirements Syntax) is the standard format for acceptance criteria in spec-driven development.

## Primary EARS Patterns

### 1. Event-Driven (WHEN-THEN)
- **Pattern**: WHEN [event/condition] THEN [system/subject] SHALL [response]
- **Use Case**: Responses to specific events or triggers
- **Example**: WHEN user clicks checkout button THEN Checkout Service SHALL validate cart contents

### 2. State-Based (IF-THEN)
- **Pattern**: IF [precondition/state] THEN [system/subject] SHALL [response]
- **Use Case**: Behavior dependent on system state or preconditions
- **Example**: IF cart is empty THEN Checkout Service SHALL display empty cart message

### 3. Continuous Behavior (WHILE-THE)
- **Pattern**: WHILE [ongoing condition] THE [system/subject] SHALL [continuous behavior]
- **Use Case**: Ongoing behaviors that persist during a condition
- **Example**: WHILE payment is processing THE Checkout Service SHALL display loading indicator

### 4. Contextual Behavior (WHERE-THE)
- **Pattern**: WHERE [location/context/trigger] THE [system/subject] SHALL [contextual behavior]
- **Use Case**: Location or context-specific requirements
- **Example**: WHERE user is on payment page THE Checkout Service SHALL encrypt all form inputs

## Combined Patterns
- WHEN [event] AND [additional condition] THEN [system/subject] SHALL [response]
- IF [condition] AND [additional condition] THEN [system/subject] SHALL [response]

## Subject Selection Guidelines
- **Software Projects**: Use concrete system/service name (e.g., "Checkout Service", "User Auth Module")
- **Process/Workflow**: Use responsible team/role (e.g., "Support Team", "Review Process")
- **Non-Software**: Use appropriate subject (e.g., "Marketing Campaign", "Documentation")

## Quality Criteria
- Each criterion must be testable and verifiable
- Use SHALL for mandatory requirements, SHOULD for recommended
- Avoid ambiguous terms (e.g., "fast", "user-friendly")
- Keep each criterion atomic (one behavior per statement)

