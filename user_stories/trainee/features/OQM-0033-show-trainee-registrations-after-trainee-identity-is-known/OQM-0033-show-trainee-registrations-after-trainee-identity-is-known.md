**Title:**
OQM-0033 Show Trainee Registrations in Cards After Trainee Identity Is Known

**Description:**
After trainee identity is known (PIN login or successful manual registration), trainee's existing registrations for training sessions should be fetched within the currently shown 21-day period. Trainee session cards must show registration state based on that known trainee identity.

**User Story:**
As a trainee, I want to see my existing registrations as soon as my identity is known, so that I can immediately recognize sessions I have already registered for within the shown date window and avoid duplicate registration attempts.

**Scope:**
- Frontend: when trainee login succeeds on TraineePage, trigger a refresh of trainee sessions for that logged-in trainee context.
- Frontend: when trainee is identified through successful manual registration (name persisted to `pendingTraineeData`), trigger the same refresh behavior so existing registrations are reflected immediately.
- Frontend: map backend registration status into `TraineeSessionItem.trainee_registered` and render registered state consistently on cards.
- Frontend: preserve current card behavior for registered sessions (registered color, DoneIcon, `Unregister` button label remains non-functional as currently defined).
- Frontend: keep existing weekly tabs, session grouping, and existing login/register PIN/logout flows unchanged except for status refresh behavior.
- Backend (GAS): extend trainee session retrieval logic so response can include trainee-specific registration state for the 21-day window when trainee identity is provided.
- API contract docs: update `skills/SKILL.wire-react-to-gas.md` if route params/payload/response fields change.
- Tests: add/update tests for both identity sources (login and manual-registration-known-name) and correct registered-flag rendering.

**Out of Scope:**
- Implementing trainee unregister/cancel-registration backend route.
- Redesigning trainee session card layout.
- Changing coach/admin flows or routes.
- Expanding trainee window beyond current 21-day behavior.

**Preconditions:**
- User is on TraineePage.
- Trainee identity exists in TraineePage state (`pendingTraineeData`) from either:
  - successful PIN login via `verifyTraineePin`, or
  - successful manual registration confirmation flow.
- GAS route for fetching trainee sessions is available and returns session objects for the 21-day window.
- `trainee_registrations` sheet contains realized registrations that can be matched against session date/time/type.

**Main Flow (Show Registrations After Identity Is Known):**
1. Trainee identity becomes known on TraineePage through one of these paths:
   - Path A: user logs in with PIN successfully.
   - Path B: user completes manual registration successfully and trainee name is stored into `pendingTraineeData`.
2. TraineePage has known trainee identity (`first_name`, `last_name`, and when available age data) and refreshes sessions from backend for that identity context.
3. Backend returns session list for the 21-day window with trainee registration state merged into each relevant session item.
4. TraineePage renders returned sessions in weekly tabs and day groups.
5. For each session where `trainee_registered=true`, session card shows registered visual state:
	- registered color state
	- DoneIcon visible
	- action button label is `Unregister` (current non-functional behavior remains unchanged)
6. For sessions where `trainee_registered` is false/absent, card remains registerable with `Register` label.

**Alternative Flows:**
1. Session refresh fails after identity becomes known:
	- Show localized load error message (`traineeRegistration.loadError`).
	- Keep known trainee alert visible.
	- Keep prior session list unchanged if available, otherwise show empty/error state according to current page behavior.
2. No existing registrations for known trainee in current 21-day window:
	- Sessions are shown normally.
	- No card is marked as registered.
3. Session is already marked registered and user clicks card action:
	- Existing behavior remains (no unregister implementation in this issue).

**Logout Flow:**
1. User clicks Button label: `Logout` on TraineePage.
2. Trainee identity state is cleared.
3. Page refreshes trainee sessions in logged-out context.
4. Registered markers originating from logged-in identity are removed from cards.
5. Alert returns to warning state (`You are not logged in.`).

**User Feedback Messages:**
- Existing messages are reused:
  - Progress while fetching sessions: `Fetching training sessions. Please wait.`
  - Error on load failure: `Failed to load sessions. Please try again.`
	- Known trainee alert: `Logged in: {{first_name}} {{last_name}}.`
  - Logged out alert: `You are not logged in.`
- UI state changes after identity-based refresh:
  - Session cards that match trainee registrations show registered visual state and DoneIcon.
- No new user-facing messages are required unless contract-level errors are introduced.

**Test Cases:**
- Component: after successful trainee login, TraineePage triggers session refresh for logged-in trainee context.
- Component: after successful manual registration confirmation (name known in `pendingTraineeData`), TraineePage triggers session refresh for that trainee context.
- Integration/API: backend returns registered markers for sessions where logged-in trainee already exists in `trainee_registrations` for same session/date/time.
- Integration/API: backend returns the same registered markers when trainee identity comes from manual-registration-known-name flow.
- Component: registered sessions render with registered visual state and `Unregister` label.
- Component: non-registered sessions render with default state and `Register` label.
- Component: logout clears trainee context and removes registered markers after refresh.
- Component: failed refresh after identity becomes known shows localized load error and does not crash page.
- Regression: existing trainee registration flow (manual + confirm) still marks newly registered session correctly.
- Regression: weekly tabs and date grouping behavior remain unchanged.

**Acceptance Criteria:**
- Successful trainee identity resolution (PIN login or manual-registration-known-name) results in session data refresh tied to known trainee context.
- Existing trainee registrations within the visible 21-day window are shown as registered on TraineePage cards for both identity sources.
- Registered-card visual indicators (registered color, DoneIcon, action label) are shown consistently.
- Logout clears trainee context and registered indicators from session cards.
- Existing trainee login/register PIN/manual registration/week-tab behaviors are not regressed.
- Error handling remains localized and user-friendly.
- Tests cover login-based refresh, manual-known-name refresh, registered rendering, logout reset, and failure path.
- Contract changes (if any) are reflected in `skills/SKILL.wire-react-to-gas.md`.

**Linked Files/Branches:**
- `web/src/pages/Trainee/TraineePage.tsx`
- `web/src/features/trainee/components/TraineeSessionCard.tsx`
- `web/src/features/trainee/api/trainee.api.ts`
- `web/src/features/trainee/types.ts`
- `gas/Code.gs`
- Suggested branch: `feature/oqm-0033-show-trainee-registrations-after-identity-known`

**References:**
- `skills/SKILL.wire-react-to-gas.md`
- `skills/SKILL.sheet-schema.md`
- `.github/instructions/frontend.instructions.md`
- `.github/instructions/backend.instructions.md`
- `.github/instructions/review-checklist.instructions.md`
