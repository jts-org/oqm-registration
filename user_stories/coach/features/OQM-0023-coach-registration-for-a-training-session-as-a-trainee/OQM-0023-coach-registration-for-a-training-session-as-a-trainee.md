**Title:**
OQM-0023 Enable Coach Login Through verifyTraineePin for Trainee Session Registration

**Description:**
Allow a coach to authenticate in the trainee flow using an existing coach PIN so coaches can register themselves into trainee-side training sessions without creating a separate trainee PIN.

**User Story:**
As a coach, I want to log in through the trainee PIN verification flow, so that I can register for sessions where I participate as a trainee.

**Scope:**
- Backend only: update GAS verifyTraineePin behavior.
- Keep existing request and response envelope contract unchanged: { ok: true, data } | { ok: false, error }.
- verifyTraineePin checks trainee_login first; if no match, check coach_login.
- If PIN is found in coach_login, map coach row into trainee-shaped response data:
  - id <- coach_login.id
  - firstname <- coach_login.firstname
  - lastname <- coach_login.lastname
  - age <- empty string (coach sheet has no age column)
  - pin <- coach_login.pin
  - created_at <- coach_login.created_at
  - last_activity <- coach_login.last_activity
- Do not include alias in verifyTraineePin response (response remains trainee-shaped).
- No UI behavior changes required in this issue.

**Out of Scope:**
- Changes to frontend components, button states, or translations.
- Schema changes to Google Sheets.
- New API routes or payload fields.

**Preconditions:**
- GAS route verifyTraineePin is already wired and used by trainee login flow.
- Sheets coach_login and trainee_login follow documented schema.
- API token validation remains enforced.

**Main Flow (Verify PIN):**
1. Client sends POST request with route verifyTraineePin and payload { pin }.
2. Backend validates token and required payload field pin.
3. Backend looks up pin in trainee_login.
4. If trainee match exists, return existing trainee response behavior unchanged.
5. If no trainee match exists, backend looks up pin in coach_login.
6. If coach match exists, backend returns ok: true with trainee-shaped data mapped from coach row.
7. Existing frontend treats response as successful trainee verification.

**Alternative Flows:**
1. PIN does not exist in trainee_login or coach_login:
    - Return { ok: false, error: "no_match_found" }.
2. Missing or invalid token:
    - Return unauthorized error according to current API behavior.
3. Missing pin in payload:
    - Return validation error according to current API behavior.

**Post-Verification Flow (unchanged):**
1. Existing trainee page login success handling continues without frontend changes.
2. User can proceed to trainee session registration using the verified identity.

**User Feedback Messages:**
- No new messages in this issue.
- Existing trainee login success/error messages remain unchanged.

**Test Cases:**
- Unit test: verifyTraineePin returns trainee data when PIN exists in trainee_login.
- Unit test: verifyTraineePin returns mapped trainee-shaped data when PIN exists only in coach_login.
- Unit test: mapped coach result sets age to empty string and does not expose alias.
- Unit test: verifyTraineePin returns no_match_found when PIN exists in neither sheet.
- Unit test: verifyTraineePin keeps existing token and payload validation behavior.
- Regression test: existing verifyCoachPin behavior remains unchanged.

**Acceptance Criteria:**
- verifyTraineePin checks trainee_login first and coach_login second.
- When matched in coach_login, response is ok: true and data shape matches trainee contract.
- Response mapping from coach_login fields is correct and deterministic.
- age is returned as empty string for coach-based matches.
- alias is not present in verifyTraineePin success payload.
- Existing verifyTraineePin behavior for trainee matches is unchanged.
- Existing no_match_found, unauthorized, and validation error behavior is unchanged.
- Automated tests cover trainee match, coach fallback match, and not-found cases.

**Linked Files/Branches:**
- [Code.gs](gas/Code.gs)
- [OQM-0023-coach-registration-for-a-training-session-as-a-trainee.md](user_stories/coach/features/OQM-0023-coach-registration-for-a-training-session-as-a-trainee/OQM-0023-coach-registration-for-a-training-session-as-a-trainee.md)
- Suggested branch: feature/oqm-0023-coach-as-trainee-verification

**References:**
- [SKILL.wire-react-to-gas.md](skills/SKILL.wire-react-to-gas.md)
- [SKILL.sheet-schema.md](skills/SKILL.sheet-schema.md)
- [backend.instructions.md](.github/instructions/backend.instructions.md)
