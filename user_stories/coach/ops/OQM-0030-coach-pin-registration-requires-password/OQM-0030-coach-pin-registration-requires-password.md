**Title:**
OQM-0030 Coach PIN Registration Requires Password

**Description:**
Registering a coach PIN must also require a valid coach password.

**User Story:**
As a system administrator, I want the coach to provide the coach password when registering a coach PIN, so that coach entitlement is verified.

**Scope:**
- Frontend in web:
  - When RegisterPinDialog is shown in coach mode (showAlias=true):
    - Add coach password input after PIN input fields.
    - Keep Register button disabled until required fields are valid, including coach password.
    - Include coach password in register payload.
    - Ensure registerCoachPin(data) propagates the new backend error code unchanged.
    - Show a user-facing localized message for the new error code.
  - Keep trainee mode behavior unchanged when RegisterPinDialog is shown with showAlias=false.
- Backend in gas:
  - Update registerCoachPin_(payload) to validate coach password and return a new error code invalid_password for invalid or missing password.
  - Perform password validation before coach alias/PIN conflict checks.
- Contract/docs:
  - Update API contract documentation for registerCoachPin request payload and error cases.
  - Update coach manuals to describe the new password step and user-facing failure message (no technical error codes in manuals).

**Out of Scope:**
- Changes to Google Sheet schemas.
- Changes to token/session model.
- Any coach login route changes (coachLogin remains unchanged).

**Preconditions:**
- Existing registerCoachPin route and frontend API call are already in use.
- Existing coach_login and coach_registrations sheets follow current schema.
- Token validation and existing response envelope remain unchanged.
- Script property (Apps Script) `COACH_PASSWORD` set and available.

**Main Flow:**
1. User enters firstname, lastname, optional alias, PIN, PIN confirmation, and coach password, then clicks Register.
2. Client sends POST route registerCoachPin with payload { firstname, lastname, alias, pin, password }.
3. Backend validates required fields and validates password against COACH_PASSWORD.
4. If password is invalid or missing, backend returns invalid_password.
5. If password is valid, backend proceeds with existing registerCoachPin validation logic and behavior.

**Alternative Flow:**
1. Provided coach password does not match: backend returns invalid_password.
2. UI stays on dialog and shows localized invalid password message.
3. User can retry without losing non-sensitive fields according to current UX behavior.

**User Feedback Messages:**
- invalid_password: Wrong password. Try again.
- Existing register errors remain unchanged.

**Test Cases:**
- Backend unit test: registerCoachPin_ returns invalidPassword (mapped to invalid_password by doPost) when payload password is missing.
- Backend unit test: registerCoachPin_ returns invalidPassword when payload password is incorrect.
- Backend unit test: registerCoachPin_ does not proceed to alias/PIN conflict checks when password is invalid.
- Backend unit test: registerCoachPin_ continues existing behavior when password is correct (already_registered, pins_do_not_match, mismatching_aliases, pin_reserved, and success paths still work).
- Backend route test: doPost(registerCoachPin) maps backend invalidPassword to API error invalid_password.
- Frontend API test: registerCoachPin(data) throws Error('invalid_password') unchanged when backend returns invalid_password.
- Frontend component test (coach mode): password field is visible and required.
- Frontend component test (coach mode): Register button remains disabled until password is provided and form is otherwise valid.
- Frontend component test (coach mode): invalid_password opens business error dialog with localized message.
- Frontend component test (trainee mode): no password field is shown and existing trainee registration behavior is unchanged.
- Localization test: en/fi locale files include translation key for invalid_password message.
- Manual QA: verify coach manuals (en/fi) document the added password step and retry guidance.

**Acceptance Criteria:**
- Coach mode shows a password field and requires it before enabling Register.
- Trainee mode shows no coach password field and preserves existing behavior.
- registerCoachPin payload includes password in coach mode.
- Backend returns invalid_password for missing/incorrect password.
- Password validation occurs before alias/PIN conflict logic.
- With correct password, existing registerCoachPin behavior and error mappings stay unchanged.
- Frontend propagates invalid_password unchanged from API layer to UI handler.
- UI shows the localized invalid password message in both English and Finnish.
- Contract docs and coach manuals are updated consistently with implemented behavior.

**Linked Files/Branches:**
- [RegisterPinDialog.tsx](web/src/shared/components/RegisterPinDialog/RegisterPinDialog.tsx)
- [coach.api.ts](web/src/features/coach/api/coach.api.ts)
- [SKILL.wire-react-to-gas.md](skills/SKILL.wire-react-to-gas.md)
- [Code.gs](gas/Code.gs)
- [coach-manual.en.md](user_manuals/coach-manual.en.md)
- [coach-manual.fi.md](user_manuals/coach-manual.fi.md)
- Suggested branch: feature/oqm-0030-coach-pin-registration-requires-password

**References:**
- [skills/SKILL.wire-react-to-gas.md](skills/SKILL.wire-react-to-gas.md)
- [backend.instructions.md](.github/instructions/backend.instructions.md)
- [frontend.instructions.md](.github/instructions/frontend.instructions.md)
- [copilot-instructions.md](.github/instructions/copilot-instructions.md)