**Title:**
OQM-0021 Create User Manuals

**Description:**
Create clear end-user manuals for trainee and coach user paths in both English and Finnish. Manuals must focus on UI usage only and help first-time users complete key flows without technical support.

**User Story:**
As a trainee or coach, I want concise step-by-step usage instructions in my language so that I can use the application correctly without knowing implementation details.

**Scope:**
- Create a trainee manual in English and Finnish.
- Create a coach manual in English and Finnish.
- Use Markdown format and store manuals under root folder `user_manuals/`.
- Cover only user-facing flows and visible UI behavior.

**Out Of Scope:**
- Backend architecture, API contracts, sheet schema, deployment, or any technical internals.
- Developer setup instructions.

**Preconditions:**
- Root folder exists: `user_manuals/`.
- Application flows referenced in manuals are already implemented in the UI.
- All UI labels referenced in manuals match localized app text.

**Deliverables:**
- `user_manuals/trainee-manual.en.md`
- `user_manuals/trainee-manual.fi.md`
- `user_manuals/coach-manual.en.md`
- `user_manuals/coach-manual.fi.md`

**Manual Structure Requirements (all 4 manuals):**
1. Short purpose section (who the manual is for).
2. Prerequisites for user (what they need before starting).
3. Step-by-step main usage flows with expected outcomes.
4. Error and recovery section (what the user should do when an action fails).
5. FAQ or quick tips section.
6. Keep language non-technical and action-oriented.

**Main Flow (Create Manuals):**
1. Draft English versions first for trainee and coach.
2. Verify flow coverage against current UI pages and dialogs.
3. Add Finnish versions with matching structure and meaning.
4. Review all four manuals for terminology consistency and clarity.
5. Confirm each described step can be completed in the current UI.

**Alternative Flows:**
1. If a referenced UI flow is not yet implemented:
    - Document only currently available user actions.
    - Mark missing behavior in issue notes and exclude it from manuals.
2. If EN/FI translation meaning diverges:
    - Keep EN/FI section structure identical.
    - Resolve wording mismatch before closing the issue.

**Finalization Flow:**
1. Validate file paths, naming, and Markdown readability.
2. Peer-review manuals for language clarity and flow accuracy.
3. Link manuals in PR description and this issue.

**User Feedback Messages:**
- No new runtime UI messages are introduced by this issue.
- Manuals must include examples of existing user-visible messages where relevant (for example success, validation, and failure feedback) using plain-language explanation.

**Test Cases:**
- All four manual files exist in `user_manuals/` with correct filenames.
- Each manual includes purpose, prerequisites, steps, error recovery, and tips sections.
- A reviewer can follow each documented main flow in the UI without needing technical knowledge.
- EN/FI versions for trainee manual contain equivalent content.
- EN/FI versions for coach manual contain equivalent content.
- No manual contains backend, API, sheet, or deployment implementation details.
- Markdown renders correctly in GitHub preview.

**Acceptance Criteria:**
- Four manuals are created (trainee/coach x EN/FI) under `user_manuals/`.
- Manuals are UI-focused, non-technical, and understandable for first-time users.
- Documented steps match current application behavior.
- EN/FI content pairs are semantically equivalent.
- Manuals include guidance for common user errors and retries.
- All placeholders are removed from this issue before completion.

**Linked Files/Branches:**
- `user_manuals/trainee-manual.en.md`
- `user_manuals/trainee-manual.fi.md`
- `user_manuals/coach-manual.en.md`
- `user_manuals/coach-manual.fi.md`
- Branch: `feature/oqm-0021-create-user-manuals`

**References:**
- `AGENTS.md`
- `README.md`
- `.github/instructions/copilot-instructions.md`
- `.github/instructions/frontend.instructions.md`
