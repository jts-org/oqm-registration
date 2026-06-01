**Title:**
OQM-0035 Add Customer Event And Schedule

**Description:**
Administrators need a dedicated Admin flow for creating customer event master data and its session schedule in one operation. This feature adds a new `Events` entry point inside the Admin page, a customer-event creation view, and a backend route that stores the event in `customer_events` and its session rows in `customer_event_schedules`.

This issue covers creation of the event and its schedule only. The created data is intended to support later participant-registration flows, but linking participant rows to customer event sessions is not part of this scope.

**User Story:**
As an administrator, I want to create a customer event together with one or more scheduled sessions, so that customer event data is available in the system for later registration workflows.

**Scope:**
- Frontend in web (Admin area):
  - Add a new `Events` dashboard card with `Open` action that routes the user to the in-page Events section.
  - Add a new drawer navigation item for `Events` that routes the user to the same in-page Events section.
  - Add an Events section to the Admin page.
  - Add a `Customer events` card with `Add` action inside the Events section.
  - Add an `Add Customer Event` view that opens when the user clicks `Add`.
  - `Add Customer Event` view sections (MUI components):
    - `Customer Event Info`
      - Event (TextField)
      - Event alias (TextField)
      - Instructor name (TextField)
      - Start date (DatePicker)
      - End date (DatePicker)
    - `Customer event schedule`
      - Multi-row entry UI using MUI components (DataGrid or list-style rows with TextFields, DatePicker, and TimePicker/TimeField)
      - Each row includes:
        - Session name (TextField)
        - Session name alias (TextField)
        - Date (DatePicker)
        - Start time (TimePicker/TimeField)
        - End time (TimePicker/TimeField)
      - `+ Add session` action
      - Row removal action
  - Frontend validation:
    - Event, event alias, instructor name, start date, and end date are required.
    - End date must be the same as or after start date.
    - At least one schedule row is required.
    - Every schedule row requires session name, session name alias, date, start time, and end time.
    - Schedule row date must be within the customer event date range.
    - Schedule row end time must be the same as or after start time.
  - Add one `Submit` action that sends the customer event and all schedule rows in a single request.
  - Show localized success/error feedback, including request summary and row-level rejection reasons when applicable.
- Backend in GAS:
  - Add a new admin-protected route for inserting one customer event together with one or more schedule rows.
  - Protect the operation with script locking:
    - If validation or duplicate checks fail, no rows are written to either sheet.
    - If the request succeeds, the customer event row and all schedule rows are written together.
  - Validate the customer event row before insertion:
    - Event must not be null or empty.
    - Event alias must not be null or empty.
    - Instructor name must not be null or empty.
    - Start date and end date are required.
    - End date must not be before start date.
  - Validate every schedule row before insertion:
    - At least one schedule row must be provided.
    - Schedule date must be on or after the customer event start date and on or before the customer event end date.
    - Session name must not be null or empty.
    - Session name alias must not be null or empty.
    - Start time and end time are required.
    - End time must not be before start time.
  - Connect every schedule row to the inserted customer event using `event_id = customer_events.id`.
  - Detect duplicates:
    - Customer event duplicate against existing `customer_events` rows.
    - Schedule duplicate against existing `customer_event_schedules` rows.
    - Schedule duplicate within the submitted schedule batch itself.
  - Return response summary with:
    - Customer event row inserted count (`0` or `1`)
    - Total schedule rows processed
    - Schedule rows inserted count
    - Schedule rows rejected count
    - Row-level rejection reasons
- Contract and docs:
  - Update API contract documentation in `skills/SKILL.wire-react-to-gas.md`.
  - Add the new sheet schemas to `skills/SKILL.sheet-schema.md`.
- Localization:
  - Add all new labels and feedback messages in both:
    - English (`en.json`)
    - Finnish (`fi.json`)
- Tests:
  - Add or extend backend tests for route validation, duplicate detection and response summary behavior.
  - Add or extend frontend tests for Events navigation, customer-event form behavior, validation, submission flow, and summary rendering.

**Out of Scope:**
- Viewing existing customer events and schedules.
- Editing existing customer events and schedules.
- Removing existing customer events and schedules.
- Linking `trainee_registrations` rows to customer event sessions.
- File import or bulk upload for event schedule creation.

**New Schemas:**
`customer_events` sheet schema:

| Column | Name        | Type     |
|--------|-------------|----------|
| A      | id          | string   |
| B      | event       | string   |
| C      | event_alias | string   |
| D      | instructor  | string   |
| E      | start_date  | ISO-8601 |
| F      | end_date    | ISO-8601 |
| G      | realized    | boolean  |
| H      | created_at  | ISO-8601 |
| I      | updated_at  | ISO-8601 |

`customer_event_schedules` sheet schema:

| Column | Name               | Type     |
|--------|--------------------|----------|
| A      | id                 | string   |
| B      | event_id           | string   |
| C      | session_name       | string   |
| D      | session_name_alias | string   |
| E      | date               | ISO-8601 |
| F      | start_time         | time     |
| G      | end_time           | time     |
| H      | realized           | boolean  |
| I      | created_at         | ISO-8601 |
| J      | updated_at         | ISO-8601 |

`event_id` acts as a foreign key and must reference `customer_events.id`.
Date values use `YYYY-MM-DD` format. Time values use `HH:MM` format.
`realized` field value is set to TRUE by default in insertion.

**Preconditions:**
- Administrator is authenticated and has a valid admin session token.
- `customer_events` and `customer_event_schedules` sheets exist and follow the documented structure.
- Existing Admin page shell and localization setup are available.

**Main Flow (Create customer event):**
1. Administrator opens the Admin page and navigates to the Events section.
2. Administrator opens the `Add Customer Event` view.
3. Administrator enters customer event information.
4. Administrator enters one or more schedule rows.
5. Administrator adds or removes schedule rows as needed.
6. Administrator clicks `Submit`.
7. Frontend sends the customer event payload and schedule rows in one request to the admin-protected GAS route.
8. GAS acquires a lock, validates the full request, checks duplicates, and writes the customer event row plus all schedule rows.
9. Frontend shows the result summary.

**Alternative Flows:**
1. Customer event data is missing or invalid:
   - Frontend blocks submit when client-side validation can detect the problem.
   - Backend rejects the request if invalid data still reaches the route.
   - No rows are written.
2. End date is before start date:
   - Request is rejected with validation error.
   - No rows are written.
3. No schedule rows are provided:
   - Request is rejected with validation error.
   - No rows are written.
4. A schedule row is outside the event date range or has end time before start time:
   - Request is rejected with row-level validation detail.
   - No rows are written.
5. Duplicate customer event or duplicate schedule row is detected:
   - Request is rejected with duplicate error details.
   - No rows are written.
6. Script lock cannot be acquired because another admin write is in progress:
   - Request fails with concurrent-operation error.
   - No partial writes occur.

**User Feedback Messages:**
- Localized inline validation for missing or invalid form fields.
- Localized submission result summary including:
  - Customer event created (`yes`/`no`)
  - Total schedule rows
  - Added schedule rows
  - Rejected schedule rows
- Localized row-level rejection reasons for invalid or duplicate schedule rows.
- Localized error message for concurrent-operation failure.

**Test Cases:**
- Backend:
  - Valid customer event with multiple valid schedule rows is accepted and writes both sheets.
  - Missing required customer event field is rejected and writes nothing.
  - End date before start date is rejected.
  - Empty schedule batch is rejected.
  - Schedule row outside event date range is rejected.
  - Schedule row with end time before start time is rejected.
  - Duplicate customer event against existing sheet data is rejected.
  - Duplicate schedule row against existing sheet data is rejected.
  - Duplicate schedule row inside the submitted batch is rejected.
  - Lock acquisition failure returns concurrent-operation error and writes nothing.
  - Customer event row is not written when any schedule row fails validation.
- Frontend:
  - Admin page shows `Events` dashboard card and drawer item.
  - `Open` action and drawer navigation both route to the Events section.
  - `Add Customer Event` view opens from the `Customer events` card.
  - Add-session and remove-session actions work for multiple schedule rows.
  - Submit is blocked or validation is shown when required fields are missing.
  - Date-range and time-range validation messages are shown for invalid input.
  - Successful submission shows localized summary counts.
  - Failed submission shows localized row-level rejection reasons.
  - Localization regression check confirms all new EN/FI keys exist.

**Acceptance Criteria:**
- Admin page includes a new `Events` dashboard card and drawer navigation item.
- Admin can open an `Add Customer Event` view from the Events section.
- Admin can enter one customer event and one or more schedule rows in the same flow.
- Frontend validates required fields, event date range, schedule date range, and schedule start/end times.
- Submit sends one admin-protected request containing the customer event and schedule rows.
- GAS writes `customer_events` and `customer_event_schedules`.
- Every inserted schedule row references the inserted customer event through `event_id`.
- Duplicate customer events and duplicate schedule rows are rejected.
- Response includes summary counts and row-level rejection reasons.
- All new UI labels and feedback messages are localized in English and Finnish.
- API contract documentation and sheet schema documentation are updated.
- Automated backend and frontend tests cover the new behavior.

**Linked Files/Branches:**
- [gas/Code.gs](gas/Code.gs)
- [gas/__tests__/registerTraineeBatchForSessions.test.js](gas/__tests__/registerTraineeBatchForSessions.test.js)
- [web/src/pages/Admin/AdminPage.tsx](web/src/pages/Admin/AdminPage.tsx)
- [web/src/pages/Admin/__tests__/AdminPage.test.tsx](web/src/pages/Admin/__tests__/AdminPage.test.tsx)
- [web/src/features/admin/api/admin.api.ts](web/src/features/admin/api/admin.api.ts)
- [web/src/features/admin/components/AdminBatchFeedPanel.tsx](web/src/features/admin/components/AdminBatchFeedPanel.tsx)
- [web/src/locales/en.json](web/src/locales/en.json)
- [web/src/locales/fi.json](web/src/locales/fi.json)
- [skills/SKILL.wire-react-to-gas.md](skills/SKILL.wire-react-to-gas.md)
- [skills/SKILL.sheet-schema.md](skills/SKILL.sheet-schema.md)
- Suggested branch: `feature/oqm-0035-add-customer-event-and-schedule`

**References:**
- [AGENTS.md](AGENTS.md)
- [.github/instructions/backend.instructions.md](.github/instructions/backend.instructions.md)
- [.github/instructions/frontend.instructions.md](.github/instructions/frontend.instructions.md)
- [.github/instructions/copilot-instructions.md](.github/instructions/copilot-instructions.md)
- [.github/instructions/review-checklist.instructions.md](.github/instructions/review-checklist.instructions.md)
- [skills/SKILL.wire-react-to-gas.md](skills/SKILL.wire-react-to-gas.md)
- [skills/SKILL.sheet-schema.md](skills/SKILL.sheet-schema.md)
