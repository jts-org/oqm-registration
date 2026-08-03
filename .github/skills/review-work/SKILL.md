---
name: review-work
description: 'Review code, design work, plans, ADRs, specs, docs, and related work artifacts with an artifact-first, lens-driven method. Use when you need independent review passes, an explicit adversarial challenge, evidence-backed findings, targeted escalation, and a stable report contract.'
metadata:
  author: mimir-system
  version: "1.0.0"
---

# Review Work

This is a method skill, not a reviewer persona, gate, or workflow wrapper.

## When to Use

- Review code, design work, plans, ADRs, specs, docs, and related work artifacts.
- Use when the review should start from the artifact and stated intent rather than from a fixed process.
- Use when the result must stay portable across artifact types while keeping the same finding and report shape.

## Optional Concern Overlays

The parent skill remains the stable contract. These overlays add optional concern-specific depth only.
They are non-exhaustive and not a workflow: load zero, one, or several overlays, choose the smallest
useful set for the artifact and risk profile, and adapt beyond this map when the review needs it.

- security and trust boundaries: [Security and Trust Boundaries](references/security-trust-boundaries.md)
- data and state safety: [Data and State Safety](references/data-state-safety.md)
- contracts and compatibility: [Contracts and Compatibility](references/contracts-compatibility.md)
- testing and maintainability: [Testing and Maintainability](references/testing-maintainability.md)
- performance and scale: [Performance and Scale](references/performance-scale.md)
- frontend experience and quality: [Frontend Experience and Quality](references/frontend-experience-quality.md)
- specification quality: [Specification Quality](references/specification-quality.md)

## Direct Code Review

When the artifact is mainly a diff, changed-file set, or implementation patch, read
[Direct Code Review](references/direct-code-review.md) before applying the main method. Use it to
anchor the intended behavior change, changed boundaries, evidence, and any optional concern
overlays that the change clearly activates.

## Method

### 1. Anchor the Review Scope

Start by naming:

- artifact type
- stated intent
- review boundary
- evidence available
- evaluation rubric, if the artifact or governing spec provides one

Lens choice and escalation come after this scope statement.

When a rubric is present, use it as the quality judgment model. Acceptance criteria define the minimum gate;
the rubric defines whether the completed work is high-quality, fit-for-purpose, and aligned with intent. Do not
collapse the rubric into a task checklist.

If the artifact is a diff, changed-file set, or implementation patch, anchor the review by naming:

- intended behavior change
- changed boundaries, contracts, or dependencies
- whether the change is executable code, instruction prose, or mixed
- evidence available for the change: tests, repro, logs, checks, or examples
- the main quality questions to pressure next: correctness, boundary safety, verification depth, and downstream risk

### 2. Apply the Core Lenses

Always apply all four core lenses:

- intent alignment
- internal coherence/correctness
- risk/adversarial analysis
- evidence/traceability

### 3. Add Adaptive Lenses Only When Justified

Add adaptive lenses only when the artifact or scope warrants them, and name the justification.

- change impact
- execution/operability
- maintainability/evolvability
- communication/audience fit

### 4. Run Independent Passes

Run at least two non-adversarial passes before synthesis.

- Treat them as logically parallel viewpoints even when executed sequentially.
- Do not let a later pass inherit provisional conclusions from an earlier pass before synthesis.
- Across these passes, cover all core lenses and any selected adaptive lenses.
- At minimum, one pass should anchor on intent/coherence and one on evidence/impact.

### 5. Run the Explicit Adversarial Pass

Run one explicit adversarial pass after the independent passes and before synthesis.

- Challenge assumptions.
- Look for failure modes, unsafe edges, misleading claims, and missing mitigations.
- Keep this pass visible even when earlier passes look clean.

### 6. Synthesize Only After All Passes Complete

Merge findings only after every pass is done.

- deduplicate by issue
- keep the strongest evidence
- preserve lens attribution
- prioritize by severity, impact, and confidence rather than pass order

### 7. Close on Review Quality Gates

Before closing, make the review's coverage explicit for the changed surface.

- correctness and changed-behavior alignment
- rubric alignment when a rubric exists
- contract or boundary safety
- test and verification sufficiency
- operational or downstream risk where relevant
- whether the review expectations differ because the change is instruction prose only, executable, or mixed

If one of these gates is not applicable or cannot be closed with current evidence, say so directly.

## Finding Discipline

Every material finding must include:

- `severity`: `critical|high|medium|low`
- `lens`
- `finding`
- `evidence`
- `impact`
- `confidence`: `high|medium|low`
- `recommended_action`
- `escalation` (optional)

No evidence means no finding.

## Escalation

Escalation is optional, narrow, and question-scoped.

- Escalate only when a remaining gap requires specialist depth, authority, or evidence the generic review method cannot resolve.
- Name the expertise needed, the exact unresolved question, and why the gap blocks a confident conclusion.
- Keep specialist or subagent use pluggable and trust-based rather than tied to a fixed roster or tool chain.
- Structural/context discovery is usually relevant when boundaries, dependencies, or hidden coupling are unclear.
- Architecture review, domain research, and targeted validation are optional when the unresolved gap is architectural,
  external/domain, or verification-oriented.
- If no narrower expertise is needed, finish the review without escalation.

## Output Contract

Emit the same report shape every time:

1. `review_scope`
2. `overall_judgment`
3. `prioritized_findings`
4. `open_questions_or_assumptions`
5. `escalations_performed_or_recommended`
6. `no_material_issues`

If no findings meet the materiality bar, make `no_material_issues` explicit instead of implying it.