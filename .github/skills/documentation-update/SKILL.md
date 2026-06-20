# SKILL: Documentation Update

## Purpose
This skill defines how Copilot must detect when documentation updates are required and how Copilot must draft those updates. It applies to:

- user manuals (`user_manuals/*.en.md`, `user_manuals/*.fi.md`)
- SKILL.md files
- developer-facing docs when architecture, flows, or schemas change

This skill ensures documentation stays synchronized with UI behavior, API contracts, sheet schemas, and backend logic.

---

## When to Apply
Activate this skill whenever:

- a PR changes UI behavior
- a PR changes user-visible flows
- a PR changes API request/response shapes
- a PR changes sheet schemas or column order
- a PR changes backend architecture or error codes
- the user asks for documentation updates
- the user asks “what needs updating in manuals?”
- the PR Review Skill identifies documentation impact

---

## Detection Rules

Copilot must treat documentation updates as required when **any** of the following occur:

### UI Behavior Changes
- new UI elements added
- labels, buttons, or text changed
- validation rules changed
- navigation flow changed
- error messages changed
- loaders, modals, or notifications changed
- mobile/tablet/desktop behavior changed

### API Contract Changes
- request payload shape changed
- response shape changed
- new fields added
- fields removed or renamed
- error codes changed
- route behavior changed

### Sheet Schema Changes
- column order changed
- new columns added
- columns removed or renamed
- validation rules changed
- write logic changed

### Backend Architecture Changes
- concurrency rules changed
- locking behavior changed
- new routes added
- error handling changed
- data flow changed

If any of these are detected, Copilot must:

1. Mark documentation updates as **Required Fixes** in PR review  
2. Generate draft updates for manuals and SKILL.md files  
3. Ask the user to confirm or refine the drafts  

---

## Documentation Update Procedure

When documentation updates are required, Copilot must follow this process:

### Step 1 — Identify Impact
Summarize what changed and why documentation must be updated.

### Step 2 — Determine Which Docs Are Affected
Copilot must map changes to documentation targets:

- UI behavior → user manuals (en + fi)
- API contract → SKILL.md + developer docs
- sheet schema → SKILL.md + developer docs
- backend architecture → SKILL.md + developer docs

### Step 3 — Generate Draft Updates
Copilot must produce:

#### For user manuals:
- user-focused explanation of new behavior
- expected outcomes
- error recovery steps
- screenshot placeholders (e.g., `[screenshot: new form layout]`)
- step-by-step instructions
- no technical jargon

#### For SKILL.md files:
- technical explanation of new rules
- updated procedures
- updated payload/response definitions
- updated schema definitions
- updated error codes
- updated architectural constraints

### Step 4 — Insert “Manual Impact” Note for PR
Copilot must generate a PR-ready note:

```
## Manual Impact
This PR changes user-visible behavior. Manuals must be updated in:
- user_manuals/*.en.md
- user_manuals/*.fi.md

Changes:
- <list of behavior changes>
```

### Step 5 — Ask for Confirmation
Copilot must ask:

- “Should I refine or expand the manual updates?”
- “Do you want me to generate the Finnish version as well?”
- “Should I update the related SKILL.md files?”

---

## Output Format

When generating documentation updates, Copilot must output:

### 1. Summary of Impact
Short explanation of what changed.

### 2. Updated English Manual Section
User-focused, step-by-step, non-technical.

### 3. Updated Finnish Manual Section
Same content, translated and localized.

### 4. Updated SKILL.md Section (if needed)
Technical, developer-focused.

### 5. Manual Impact Note for PR
As described above.

---

## Rules for User Manuals

Copilot must ensure:

- manuals remain user-focused, not technical
- instructions describe what the user sees and does
- expected outcomes are included
- error recovery steps are included
- Finnish characters use unicode escapes if required by repo conventions
- tone is simple, clear, and non-developer

---

## If No Documentation Is Needed
If Copilot detects no user-visible or architectural changes, it must state:

“No documentation updates required.”

---

## If Context Is Missing
If the user asks for documentation updates but provides no diff or description, Copilot must request:

- the PR description
- the changed files
- the relevant code snippets

---
