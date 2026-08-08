```markdown
---
name: documentation-update
description: Rules for detecting and drafting required documentation updates for manuals, SKILL.md files, and developer docs when UI, flows, API contracts, schemas, or backend logic change.
license: MIT
---

# SKILL: Documentation Update

Defines how Copilot detects when documentation updates are required and how Copilot drafts those updates.  
Applies to:
- user manuals (`user_manuals/*.en.md`, `user_manuals/*.fi.md`)
- SKILL.md files
- developer-facing docs (architecture, flows, schemas)

Ensures documentation stays synchronized with UI behavior, API contracts, sheet schemas, and backend logic.

---

# 1. When to Apply

Activate whenever:
- PR changes UI behavior or user-visible flows  
- PR changes API request/response shapes  
- PR changes sheet schemas or column order  
- PR changes backend architecture or error codes  
- user asks for documentation updates  
- user asks “what needs updating in manuals?”  
- PR Review Skill identifies documentation impact  

---

# 2. Detection Rules

Documentation updates are **required** when any of the following change:

## UI Behavior
- new UI elements  
- changed labels/buttons/text  
- changed validation rules  
- changed navigation flow  
- changed error messages  
- changed loaders/modals/notifications  
- changed mobile/tablet/desktop behavior  

## API Contract
- changed payload shape  
- changed response shape  
- added/removed/renamed fields  
- changed error codes  
- changed route behavior  

## Sheet Schema
- changed column order  
- added/removed/renamed columns  
- changed validation rules  
- changed write logic  

## Backend Architecture
- changed concurrency rules  
- changed locking behavior  
- new routes  
- changed error handling  
- changed data flow  

If any detected:
1. Mark documentation updates as **Required Fixes** in PR review  
2. Generate draft updates for manuals + SKILL.md  
3. Ask user to confirm or refine  

---

# 3. Documentation Update Procedure

## Step 1 — Identify Impact
Summarize what changed and why documentation must be updated.

## Step 2 — Determine Affected Docs
Map changes to targets:
- UI → user manuals (en + fi)  
- API → SKILL.md + developer docs  
- sheet schema → SKILL.md + developer docs  
- backend architecture → SKILL.md + developer docs  

## Step 3 — Generate Draft Updates

### User Manuals (EN + FI)
- user-focused explanation  
- expected outcomes  
- error recovery steps  
- screenshot placeholders (`[screenshot: ...]`)  
- step-by-step instructions  
- no technical jargon  

### SKILL.md Files
- technical explanation of new rules  
- updated procedures  
- updated payload/response definitions  
- updated schema definitions  
- updated error codes  
- updated architectural constraints  

## Step 4 — PR “Manual Impact” Note
Copilot must generate:

```
## Manual Impact
This PR changes user-visible behavior. Manuals must be updated in:
- user_manuals/*.en.md
- user_manuals/*.fi.md

Changes:
- <list of behavior changes>
```

## Step 5 — Ask for Confirmation
Copilot must ask:
- “Should I refine or expand the manual updates?”  
- “Do you want the Finnish version as well?”  
- “Should I update the related SKILL.md files?”  

---

# 4. Output Format

When generating documentation updates, Copilot must output:

1. **Summary of Impact**  
2. **Updated English Manual Section**  
3. **Updated Finnish Manual Section**  
4. **Updated SKILL.md Section (if needed)**  
5. **Manual Impact Note for PR**  

---

# 5. Rules for User Manuals

Copilot must ensure:
- user-focused, non-technical tone  
- instructions describe what user sees/does  
- expected outcomes included  
- error recovery steps included  
- Finnish characters use unicode escapes if required  
- simple, clear language  

---

# 6. If No Documentation Is Needed
If no user-visible or architectural changes:
**“No documentation updates required.”**

---

# 7. If Context Is Missing
If user asks for documentation updates without diff or description, Copilot must request:
- PR description  
- changed files  
- relevant code snippets  
```
