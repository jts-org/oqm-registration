```markdown
---
name: adr-process
description: Architecture Decision Record (ADR) process and template for documenting significant architectural decisions. Use when mimir-architect identifies decisions needing formal documentation.
---

# ADR Process

Use this reference to document architectural decisions with long-term impact.

## When to Use ADR

Create an ADR when a decision:

- **Has lasting impact** on structure, dependencies, or integrations  
- **Is hard to reverse** without major effort  
- **Has meaningful alternatives** that were evaluated  
- **Affects multiple components** or boundaries  

**Skip ADRs** for trivial, temporary, or low-impact implementation details.

## ADR Location

Store ADRs in track or project documentation:

./mimir/tracks/{track-name}/decisions/
  ADR-001-{decision-name}.md

./docs/architecture/decisions/
  ADR-001-{decision-name}.md

## ADR Template

```markdown
# ADR-{NNN}: {Decision Title}

**Status**: Proposed | Accepted | Deprecated | Superseded by ADR-XXX  
**Date**: {YYYY-MM-DD}  
**Deciders**: {owners}

## Context
{Problem or opportunity prompting the decision. Include constraints: technical, business, team, time.}

## Decision
{Clear, specific description of the decision.}

## Alternatives Considered

### Option A: {Name}
- **Pros**: {benefits}
- **Cons**: {drawbacks}
- **Why not**: {reason}

### Option B: {Name}
- **Pros**: {benefits}
- **Cons**: {drawbacks}
- **Why not**: {reason}

## Consequences

### Positive
- {benefit}

### Negative
- {cost or tradeoff}

### Risks
- {risk}: {mitigation}

## Implementation Notes
{Guidance, cautions, or follow-up considerations.}
```

## ADR Process

### 1. Identify
Flag decisions meeting ADR criteria during architecture work.

### 2. Draft
Create ADR with status **Proposed**. Include alternatives.

### 3. Review
Share with stakeholders if collaborative. Update based on feedback.

### 4. Accept
Set status to **Accepted**. Link from spec.md or relevant docs.

### 5. Evolve
When superseded, update status and link to the new ADR. Never delete; ADRs form historical record.

## Integration with Mimir

**In spec.md**: Reference ADRs for major decisions.

```markdown
## Design
See ADR-001 in the track `decisions/` directory for database rationale.
```

**In plan.md**: Add ADR tasks when significant decisions occur.

```markdown
### 1.3 Document Database Decision
**Agent**: mimir-architect  
**Output**: ADR-001 documenting PostgreSQL selection  
**Status**: pending
```

## Anti-patterns

- ❌ ADR for every minor decision  
- ❌ Vague decisions without alternatives  
- ❌ Editing or deleting accepted ADRs (supersede instead)  
- ❌ ADRs without consequences (decisions always have costs)
```
