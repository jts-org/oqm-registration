# Copilot Continuous Learning Skill (Project-Specific)

This file defines how GitHub Copilot should continuously learn from solved technical problems in this project.  
Copilot must treat this file as a project-specific knowledge base and follow all rules below when reading, updating, or suggesting updates to `learnings.md`.

This project uses:
- React + Vite (frontend)
- Google Apps Script (backend)
- Google Sheets (data storage)

Copilot must follow all rules below.

---

# 1. Purpose of This Skill

Copilot should maintain a project-specific continuous learning system.  
All reusable technical learnings must be stored in `learnings.md` at the project root.

Copilot must:
- Append new learnings when appropriate.
- Reuse existing learnings when solving similar problems.
- Keep the file structured, readable, and consistent.
- Avoid storing sensitive or proprietary data.

---

# 2. When Copilot Should Record a Learning

Copilot should add a new learning ONLY when all conditions are met:

- The problem required non-trivial reasoning.
- The solution is reusable in this project’s architecture.
- The pattern is likely to appear again in React, Vite, GAS, or Sheets.
- The learning does not contain sensitive data.
- The learning is not a trivial syntax fix.
- The learning is not a one-off hack.

Copilot should NOT record learnings for:
- Typos, missing imports, or simple syntax errors.
- Project-specific quirks that won’t repeat.
- Full code patches or large code blocks.
- Anything containing secrets, IDs, tokens, or private data.

---

# 3. How Copilot Should Record a Learning

Each learning must be added under the correct section in `learnings.md` and follow this exact format:

### [Short Title of the Learning]
**Problem Pattern:**  
Short description of the issue Copilot solved.

**Context Pattern:**  
Minimal code snippet or structural pattern (indented code block).

    // minimal snippet showing the pattern

**Solution Summary:**  
One-sentence distilled fix.

**Reasoning:**  
Why this fix works (1–2 sentences).

**Tags:**  
`react`, `vite`, `gas`, `sheets`, `performance`, `api`, etc.

**Reusability Notes:**  
When Copilot should apply this learning again.

Copilot must:
- Use short, clear titles.
- Keep entries concise.
- Use only indented code blocks (no fenced blocks).
- Avoid storing full files or long patches.
- Append new learnings at the bottom of the correct section.

---

# 4. How Copilot Should Reuse Learnings

When Copilot encounters a new problem:

1. Identify the relevant section (React, GAS, Sheets, Cross-Cutting).
2. Scan existing learnings for similar patterns.
3. Match based on:
   - Problem description
   - Code structure
   - Tags
4. Suggest reuse:
   “This resembles a previous learning: [title]. The recommended pattern is…”
5. Adapt the solution to the current context.
6. If the new case generalizes the pattern, refine the existing learning.

Copilot must NOT:
- Apply learnings blindly.
- Suggest irrelevant patterns.
- Overwrite existing learnings unless refinement is clearly needed.

---

# 5. Sections Copilot Must Maintain in `learnings.md`

Copilot must keep learnings organized under these sections:

# Frontend: React + Vite
## State Management & React Patterns
## Component Architecture & Reusability
## Async Data Fetching & API Integration
## Performance Optimizations

# Backend: Google Apps Script (GAS)
## Sheet Read/Write Patterns
## Data Validation & Sanitization
## Performance & Quotas

# Data Layer: Google Sheets
## Schema Design & Sheet Organization
## Avoiding Race Conditions

# Cross-Cutting Learnings
## API Contract Patterns
## Security & Permissions
## Deployment & Versioning

Copilot may add new subsections if a new category of reusable learning emerges.

---

# 6. Copilot Behavior Rules

Copilot must:
- Treat this file as authoritative project knowledge.
- Keep formatting consistent.
- Maintain readability and structure.
- Never delete existing learnings unless instructed by the user.
- Never store sensitive or proprietary data.
- Never store full code files.
- Never store secrets, IDs, or tokens.

Copilot should:
- Append new learnings immediately after solving a reusable problem.
- Reference this file when suggesting solutions.
- Refine learnings when patterns evolve.

---

# End of Skill Definition
