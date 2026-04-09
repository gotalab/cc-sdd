# Design Synthesis

After discovery and before writing the design document, apply these three lenses to the collected findings. This step requires the full picture — do not parallelize.

## 1. Generalization

Look across all requirements as a group. Identify cases where multiple requirements are variations of the same underlying problem.

- If feature A is a special case of a more general capability X, design X with an interface that naturally supports A (and potentially B, C later)
- Keep the implementation scope to what the current requirements demand — generalize the interface, not the implementation
- Record identified generalizations in `research.md` under Design Decisions

## 2. Build vs. Adopt

For each major component in the emerging design, ask: is this problem already solved?

- Search for established standards (RFCs, protocols), battle-tested libraries, or platform-native capabilities that address the requirement
- Prefer adopting existing solutions over building custom ones when they fit the requirements without significant adaptation
- If adopting: verify the solution is actively maintained, compatible with the project's stack (check steering), and meets non-functional requirements
- If building: document why existing solutions were rejected (capture in `research.md`)

## 3. Simplification

For each component and abstraction layer in the emerging design, ask: is this necessary?

- Remove components that exist "just in case" or for hypothetical future requirements not in the current spec
- Flatten unnecessary abstraction layers — if an interface has only one implementation with no foreseeable second, it may not need the indirection
- Prefer fewer, cohesive components over many fine-grained ones
- The right design is the smallest one that satisfies all requirements and remains extensible at the interface level
