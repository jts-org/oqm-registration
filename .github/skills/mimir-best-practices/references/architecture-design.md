```markdown
---
name: architecture-design
description: Architecture design methodology for shaping architecture before planning. Use when mimir-architect must compare options, recommend a stance, and leave a compact handoff for planning.
---

# Architecture Design

Use this reference when architecture-sensitive work needs a design stance before planning.

## When to Use

- **Pre-planning shaping**: planning requested but boundaries/integrations still unstable  
- **Cross-cutting refactor**: plan depends on a coherent architecture direction  
- **Migration stance**: multiple viable transition paths  
- **Integration choice**: contracts, ownership, or failure handling unsettled  

If the request already has a stable proposal needing critique, use `architecture-review.md`.

## Required Inputs

- Objective and expected outcome  
- Current constraints: boundaries, compliance, timeline, team capacity  
- Relevant architecture context  
- Main uncertainty: what would make the plan wrong if guessed early  

If something is missing, ask only the smallest question needed to avoid a misleading design.

## Design Modes

| Mode | Use When | Output |
| ---- | -------- | ------ |
| **Boundary Shaping** | unclear ownership/seams/component splits | boundary stance |
| **Integration Shaping** | unclear dependencies/contracts/failure paths | integration pattern |
| **Migration Shaping** | multiple rollout paths | migration stance |
| **Constraint Shaping** | conflicting or implicit requirements | explicit invariants |

Choose one primary mode. Add a secondary only if it changes the stance.

## Multi-Perspective Comparison

Compare options only through relevant
```