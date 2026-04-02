**Title:**
OQM-0034 Batch Feed Trainee Registrations

**Description:**
Trainees still mark participation on paper lists, and administrators need a fast way to transfer those entries into the `trainee_registrations` sheet through the application. This feature adds an admin batch-feeding view where multiple participation rows can be entered and submitted in one request, with strict validation and a clear summary of accepted and rejected rows.

**User Story:**
As an administrator, I want to enter multiple trainee participation rows at once, so that I can quickly transfer paper registration lists into the `trainee_registrations` sheet with minimal manual repetition.

**Scope:**
- Frontend in web (Admin area):
  - Add a batch-feeding view under the Admin page.
  - Add session-type tabs:
    - Advanced
    - Basic
    - Fitness
    - Free/Sparring
    - Camp
  - Add multi-row entry UI using MUI components (DataGrid or list-style rows with TextFields).
  - Each row includes:
    - First name
    - Last name
    - Age group (`adult` or `underage`)
    - Underage age (required when age group is `underage`)
    - Date (DatePicker)
    - Start time (TimeField)
    - End time (TimeField)
    - Camp session id (required when session type is `camp`)
  - Add `+ Add row` action.
  - Add row removal action.
  - Add one `Submit` action that sends all rows in a single request.
  - Show submission summary with accepted count and rejected count, including row-level reasons.
  - Validate free/sparring time rule in UI:
    - Start and end times may both be empty.
    - If either one is set, both must be set.
- Backend in GAS:
  - Add new admin-protected batch route for trainee registration insertion.
  - Validate each row before insertion.
  - Reject duplicates where a trainee is already registered to the same session/date/time identity.
  - Detect duplicates both:
    - Against existing `trainee_registrations` rows.
    - Within the submitted batch itself.
  - Return response summary with:
    - Total rows processed
    - Number of additions
    - Number of rejections
    - Row-level rejection reasons
- Contract and docs:
  - Update API contract documentation in `skills/SKILL.wire-react-to-gas.md`.
  - Keep schema usage aligned with `skills/SKILL.sheet-schema.md`.
- Localization:
  - Add all new labels/messages in both:
    - English (`en.json`)
    - Finnish (`fi.json`)
- Tests:
  - Add/extend backend tests for batch route validation and summary behavior.
  - Add/extend frontend tests for batch-entry UI behavior, validation, and summary rendering.

**Out of Scope:**
- Import from files (CSV/Excel upload).
- OCR or photo-to-data extraction from paper forms.
- Editing existing trainee registrations.
- New sheet schema columns beyond current `trainee_registrations` structure.

**Preconditions:**
- Administrator is authenticated and has a valid admin session token.
- `trainee_registrations` sheet exists and follows documented schema.
- Existing i18n setup is active for EN/FI locales.

**Main Flow (Batch feed):**
1. Administrator opens Admin page and navigates to batch feed section.
2. Administrator chooses a session type tab.
3. Administrator enters multiple rows of trainee participations.
4. Administrator adds/removes rows as needed.
5. Administrator clicks `Submit`.
6. Frontend sends all rows in one request to admin-protected GAS route.
7. GAS validates rows, checks duplicates, appends accepted rows, and rejects invalid/duplicate rows.
8. Frontend shows summary counts and row-level rejection reasons.

**Alternative Flows:**
1. Free/Sparring row has only start or only end time:
   - Row is rejected with validation error indicating both times are required when one is set.
2. Camp row without `camp_session_id`:
   - Row is rejected with validation error.
3. Underage row missing `underage_age`:
   - Row is rejected with validation error.
4. Duplicate row already exists in sheet or appears earlier in same batch:
   - Row is rejected as duplicate.
5. Lock acquisition fails due to concurrent operation:
   - Request returns concurrent-operation error; no partial silent failure.

**User Feedback Messages:**
- Submission result summary includes:
  - Total rows
  - Added rows
  - Rejected rows
- Row-level rejection reasons include codes/messages for:
  - Missing required fields
  - Invalid age group values
  - Missing underage age
  - Missing camp session id
  - Free/sparring time pair mismatch
  - Duplicate registration
  - Concurrent operation failure
- All messages are localized in EN/FI.

**Test Cases:**
- Backend:
  - Submitting multiple valid rows returns all accepted with correct counts.
  - Mixed valid/invalid rows returns partial success with correct accepted/rejected counts.
  - Duplicate against existing sheet row is rejected.
  - Intra-batch duplicate is rejected.
  - Free/sparring row with only one time field is rejected.
  - Free/sparring row with both time fields empty is accepted.
  - Camp row without camp session id is rejected.
  - Underage row without underage age is rejected.
  - Lock acquisition failure returns concurrent-operation error path.
- Frontend:
  - Session tabs switch active session type and new row defaults.
  - Add row and remove row work for multiple entries.
  - Submit disabled when client-side validation fails.
  - Summary panel renders accepted/rejected totals and row-level reasons.
  - API request payload includes all required per-row fields.
  - Localization regression: all new keys exist in EN and FI locale files.

**Acceptance Criteria:**
- Admin has a dedicated batch-feeding view in Admin page.
- Session type is selectable via tabs (Advanced/Basic/Fitness/Free/Sparring/Camp).
- Admin can add and remove multiple rows before submitting.
- `Submit` sends the entered rows in one request.
- GAS validates each row and prevents duplicate registrations for same trainee/session/date/time identity.
- GAS response contains additions/rejections counts and row-level rejection details.
- Free/sparring time rule is enforced: both empty or both provided.
- Camp rows require `camp_session_id`.
- Underage rows require `underage_age`.
- All new UI text and feedback messages are localized in EN/FI.
- Automated backend and frontend tests cover the new behavior.

**Linked Files/Branches:**
- [gas/Code.gs](gas/Code.gs)
- [gas/__tests__/](gas/__tests__/)
- [web/src/pages/Admin/AdminPage.tsx](web/src/pages/Admin/AdminPage.tsx)
- [web/src/pages/Admin/__tests__/AdminPage.test.tsx](web/src/pages/Admin/__tests__/AdminPage.test.tsx)
- [web/src/features/admin/api/admin.api.ts](web/src/features/admin/api/admin.api.ts)
- [web/src/features/admin/types.ts](web/src/features/admin/types.ts)
- [web/src/locales/en.json](web/src/locales/en.json)
- [web/src/locales/fi.json](web/src/locales/fi.json)
- [skills/SKILL.wire-react-to-gas.md](skills/SKILL.wire-react-to-gas.md)
- Suggested branch: feature/oqm-0034-batch-feed-trainee-registrations

**References:**
- [AGENTS.md](AGENTS.md)
- [.github/instructions/backend.instructions.md](.github/instructions/backend.instructions.md)
- [.github/instructions/frontend.instructions.md](.github/instructions/frontend.instructions.md)
- [.github/instructions/copilot-instructions.md](.github/instructions/copilot-instructions.md)
- [.github/instructions/review-checklist.instructions.md](.github/instructions/review-checklist.instructions.md)
- [skills/SKILL.wire-react-to-gas.md](skills/SKILL.wire-react-to-gas.md)
- [skills/SKILL.sheet-schema.md](skills/SKILL.sheet-schema.md)
