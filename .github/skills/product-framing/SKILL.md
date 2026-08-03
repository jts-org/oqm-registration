```markdown
---
name: product-framing
description: Product thinking framework for clarifying ambiguous feature requests before planning or implementation. Use when the problem statement is fuzzy, scope is debated, multiple directions are plausible, or upstream product context is sparse. Helps agents validate problem, user, impact, assumptions, alternatives, and constraints before writing a spec.
metadata:
  author: mimir-system
  version: "1.0.0"
---

# Product Framing

Compact framework for determining whether a request is coherent enough to plan.

---

# When to Use

Use when:
- request names a feature but not a concrete problem  
- multiple plausible solutions exist  
- scope is being debated  
- upstream product inputs are fragmented or missing  
- a spec would lock in a weak premise  

Skip when:
- problem is already concrete and evidenced  
- change is small, reversible, low‑cost  
- task is a straightforward bug fix or follow‑through  

---

# Core Questions

Before planning, answer:

1. What is happening today?  
2. What change is proposed?  
3. Who is affected, and why does it matter?  
4. What would “good” look like in 12 months?  
5. What are credible alternatives, including doing less?  
6. What quality dimensions should evaluators use to judge excellence vs minimum acceptance?

---

# Premise Challenge

Pressure‑test the initial framing:

- Are we solving the real problem or only the phrasing?  
- What evidence suggests urgency?  
- What would make this unnecessary?  
- What is the smallest reversible move that teaches us something?  
- If we could not build the requested solution, what simpler path remains?

---

# Framing Template

```markdown
## Product Context

### Current State
[What happens today? Where is friction, failure, delay, or confusion?]
[Who works around it, and what is the cost?]

### Proposed Change
[What change is being asked for?]
[How does it improve the current state?]

### 12-Month Ideal
[If direction is right, what does success look like?]
[What becomes simpler, faster, safer, or more valuable?]

### User
[Who is affected?]
[What are they trying to accomplish when this problem appears?]

### Impact
[Why does this matter now?]
[What changes if we do nothing?]

### Evidence
[tickets, observation, metrics, support pain, repeated work]

### Assumptions
[What assumptions might be wrong?]
[What would invalidate this direction?]

### Alternatives
- Minimal: [smallest reversible step]
- Scoped: [balanced implementation with exclusions]
- Ambitious: [larger investment only if payoff justifies]

### Scope Stance
[minimal | scoped | ambitious — and why]

### Evaluation Rubric Seed
[Dimensions evaluators should use to judge quality; excellent vs poor vs critical failure]
```

---

# Planning Packet Normalization

When upstream inputs are incomplete, normalize framing into a planner‑ready packet.

Rules:
- Packet is planner input, not lifecycle authority  
- Preserve upstream identifiers when durable  
- Mint local typed ID only when no upstream anchor exists and cross‑step joins are needed  

Shape:

```markdown
## Planning Packet

### Packet ID
[Use upstream durable anchor if exists; otherwise mint narrow typed ID only when needed.]

### Authority Source
[upstream | local]

### Source Context
- Upstream artifacts: [tickets/docs/ADRs/issue links/none]
- Local notes: [working notes or gaps]
- Missing artifacts: [what is absent and whether it blocks planning]

### Problem Frame
[Reuse Product Context: current state, proposed change, user, impact, evidence, assumptions, alternatives, scope stance]

### Design Constraints
- Invariants: [what must not change]
- Boundaries: [what stays out of scope]
- Open questions: [only unresolved points affecting planning]

### Rubric Seed
[Planner translates into spec.md Rubric; distinct from acceptance criteria]

### Lifecycle Context
[Where this sits in Mimir flow; what remains invariant/dynamic/optional]

### Traceability
- Linked track: [path or “not created yet”]
- Linked reviews: [IDs]
- Linked approvals: [artifacts]

### Optional Echo Fields
- Upstream ID: [repeat only when needed]
- Local ID: [repeat only when join key is needed]
```

---

# Stable Identifier Guidance

Use identifiers in this order:

1. Preserve upstream durable IDs (Jira, Confluence, ADR).  
2. Mint local packet/intent ID only when no upstream anchor exists and cross‑step traceability is required.  
3. Keep local IDs narrow and typed (e.g., `pp-20260424T120000Z-shipping-notify`).  
4. Use local IDs only for joining packet/review/approval/follow‑up artifacts.

---

# Alternative Approaches

Always compare at least two approaches; include one that does less.

- **Minimal** — reversible, low‑risk, proves need  
- **Scoped** — solves core problem without expansion  
- **Ambitious** — only when evidence + urgency justify larger investment  

---

# Lightweight Scope Stances

- **Minimal** — understanding weak or change cost high  
- **Scoped** — problem clear, boundaries knowable  
- **Ambitious** — narrower options insufficient for stated impact  

---

# Good Questions

- What happens today without this?  
- Which user is blocked vs inconvenienced?  
- How would we know this improved things?  
- What is the boring default option?  
- What should we explicitly not do in this iteration?

---

# Anti‑Patterns

Avoid:
- solution‑first framing  
- treating stakeholder phrasing as the problem  
- skipping alternatives because one path feels familiar  
- ambitious scope without evidence or downside to incrementalism  

---

# Integration with Mimir

Use before discovery‑heavy planning when problem definition is unstable.

In `spec.md`, the `Why` section should capture framing:

```markdown
## Why
**Current State**: [...]
**Proposed Change**: [...]
**User**: [...]
**Impact**: [...]
**Alternatives Considered**: [minimal/scoped/ambitious]
**Chosen Scope Stance**: [...]
```

Rubric seed should define quality lens: excellent vs poor vs critical failure.

---

# Non‑Goals

Do not use this skill to:
- create a second lifecycle system  
- redefine delivery or approval ownership  
- mint local IDs when upstream anchors exist  
- turn planning packet into workflow script or evidence ledger  

---

# Philosophy

Avoid writing a detailed plan for the wrong problem.

---

# Related Skills

For structured requirements extraction (EARS, ambiguity detection, completeness analysis), see `requirements-engineering`. Optional handoff.
```
