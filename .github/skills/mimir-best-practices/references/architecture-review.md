```markdown
---
name: architecture-review
description: Architecture review methodology for assessing existing systems. Use when mimir-architect performs reviews, assessments, or critiques of architecture.
---

# Architecture Review

Use for reviewing, assessing, or critiquing existing architecture.  
If the work is still shaping boundaries, integrations, or stance, use `references/architecture-design.md` first.

## When to Use
- Review request: “Review my architecture”, “assess this design”
- Pre-implementation validation
- Migration planning
- Health checks

Prefer `architecture-design.md` when the design is still unstable and needs directional shaping.

## Review Scope
| Scope | Focus | Depth |
|-------|--------|--------|
| Component | Single service/module | Deep, implementation-level |
| System | Multi-component interactions | Integrations, contracts |
| Domain | Business domain boundary | Bounded contexts, ownership |
| Enterprise | Cross-domain | Standards, patterns, governance |

## Viewpoint Framework

### Technical
- Scalability: growth, bottlenecks  
- Reliability: failure modes, recovery  
- Performance: latency, throughput, resources  
- Maintainability: complexity, coupling, testability  
- Security: threats, surface, compliance

### Business
- Alignment with goals  
- Cost/TCO  
- Flexibility  
- Time-to-market

### Operations
- Observability  
- Deployment & rollback  
- Incident response  
- Capacity & scaling strategy

### Team
- Cognitive load  
- Ownership clarity  
- Skills match

## Engineering Review Lenses
- Blast radius: affected components/teams/user paths  
- Boring by default: proven patterns unless novelty pays for itself  
- Reversibility: rollback/disable/narrow without heroics  
- Systems over heroes: operable during incidents  
- Essential vs accidental complexity: solving the real problem only

Use lenses to sharpen findings, not as separate ceremonies.

## Review Process

### 1. Scope & Context
- Define boundaries  
- Gather docs  
- Identify stakeholders  
- Confirm review-readiness

### 2. Discovery
- Map architecture (use discover agent if needed)  
- Identify components, boundaries, integrations  
- Document assumptions

### 3. Analysis
- Apply viewpoints  
- Apply lenses to decision points  
- Compare to patterns/standards  
- Identify gaps, risks, opportunities

### 3.1 Failure-Mode & Test Mapping
For each important change/boundary:
- List realistic failure mode  
- Check test/validation coverage  
- Check error handling/fallback  
- Check observability (silent failures = high-priority gaps)

If this reveals the architecture is still being invented, switch to `architecture-design.md`.

### 4. Findings
- Categorize by severity  
- Provide evidence  
- Suggest alternatives  
- Highlight safer/reversible options

### 5. Documentation
- Write to track/review doc  
- Return summary to orchestrator

## Findings Template
```markdown
# Architecture Review: {System/Component Name}

**Date**: {YYYY-MM-DD}  
**Scope**: {Component | System | Domain | Enterprise}  
**Reviewer**: mimir-architect

## Overview
{Brief description}

## Context
{Reason for review}

## Findings

### Critical
{Immediate issues}

### Major
{Significant issues}

### Minor
{Improvements}

### Observations
{Neutral notes}

## Recommendations

### Immediate
- {recommendation}

### Short-term
- {recommendation}

### Long-term
- {recommendation}

## Risks
| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| {risk} | High/Med/Low | High/Med/Low | {mitigation} |

## Review Checklist
- Scope explicit and narrow  
- Compared at least one alternative  
- Blast radius + rollback considered  
- Failure modes mapped to tests/handling/observability  
- Recommendations realistic for owning team

## Next Steps
{Follow-up actions}
```

## Integration with Mimir

**In spec.md**:
```markdown
## Why
**Problem**: Architecture review identified {issues}...
```

**In plan.md**:
```markdown
### 0.2 Architecture Review
**Agent**: mimir-architect  
**Mode**: Review  
**Output**: Review findings in track  
**Status**: pending
```

Use review to challenge scope before implementation hardens. Useful outcomes include “shrink the change” or “choose the reversible option.”  
If no stable design exists, shape direction with `architecture-design.md` first.

## Anti-patterns
- ❌ Undefined scope  
- ❌ Only technical viewpoint  
- ❌ No severity/priority  
- ❌ Criticism without alternatives  
- ❌ Missing stakeholder context  
- ❌ Cleverness over boring, reversible defaults
```
