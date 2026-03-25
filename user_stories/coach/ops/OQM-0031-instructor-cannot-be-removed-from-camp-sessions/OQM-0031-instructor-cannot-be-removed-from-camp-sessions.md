**Title:**
OQM-0031 Instructor Cannot Be Removed From Camp Sessions

**Description:**
Camp instructors must not be removable from camp sessions in Coach Quick Registration. When a session belongs to a camp, the session card must remain visible but must not expose a removal action to the user.

**User Story:**
As a coach, I want camp sessions to be shown without a removal action, so that I cannot accidentally remove the camp instructor from a camp session.

**Scope:**
- Frontend in web, when SessionCards are shown on CoachPage:
  - If a session belongs to a camp (session id starts with `camp_`), the session card must not render an action button.
  - Camp session details must still be visible on the card.
  - Non-camp session behavior must remain unchanged.
- Tests:
  - Add or update frontend tests for SessionCard and CoachPage to cover camp-session behavior.
- User documentation:
  - Update impacted coach manuals if the current manuals describe session removal behavior in a way that changes because camp sessions no longer show a remove action.

**Out of Scope:**
- Changes to Google Sheet schemas.
- Changes to token/session model.
- Any coach route changes.
- Any backend/API enforcement changes to `removeCoachFromSession`.
- UI redesign beyond suppressing the action button for camp session cards.

**Preconditions:**
- At least one camp session is included in the currently displayed CoachPage time window.
- Coach is logged in on CoachPage.
- Sessions have been fetched for the currently displayed time window.

**Main Flow (CoachPage camp session rendering):**
1. Coach opens CoachPage and session cards are rendered for the selected date range or active week tab.
2. A camp session is identified by a session id that starts with `camp_`.
3. The camp session card shows the existing session information normally.
4. The camp session card does not render a `Remove` button.
5. The camp session card does not render a fallback `Register` button.
6. Non-camp session cards continue to render their existing `Register` or `Remove` actions based on current rules.

**Alternative Flows:**
1. If the session is not a camp session, existing registration and removal flows continue to work unchanged.
2. If no camp sessions are present in the fetched data, CoachPage behavior remains unchanged.

**User Feedback Messages:**
- No new user-facing text is introduced.
- No remove confirmation dialog opens for camp sessions because no removal action is available.

**Test Cases:**
- SessionCard unit test: given a camp session with coach data, the card renders session details but does not render a `Remove` button.
- SessionCard unit test: given a camp session without registration metadata, the card does not render a fallback `Register` button.
- SessionCard unit test: given a non-camp session with coach data, the card still renders the `Remove` button.
- CoachPage integration test: given fetched data containing both camp and non-camp sessions, the camp session card renders without an action button while the non-camp session card keeps its expected action.
- CoachPage integration test: clicking `Remove` remains possible for non-camp sessions and still opens `ConfirmRemoveCoachDialog`.
- Regression test: existing registration flow for non-camp sessions still renders `Register` when no coach is assigned.

**Acceptance Criteria:**
- CoachPage identifies camp sessions by session id prefix `camp_`.
- A camp session card remains visible with its existing session information.
- A camp session card does not show a `Remove` button.
- A camp session card does not show a `Register` button.
- Camp session cards do not open `ConfirmRemoveCoachDialog` because no remove action is available.
- Non-camp session cards retain existing `Register` and `Remove` behavior.
- Frontend automated tests cover camp-session button suppression and non-camp regression scenarios.
- Coach manuals are updated if existing manual text implies camp instructors can be removed from camp sessions.

**Linked Files/Branches:**
- [SessionCard.tsx](web/src/features/coach/components/SessionCard.tsx)
- [CoachPage.tsx](web/src/pages/Coach/CoachPage.tsx)
- [SessionCard.test.tsx](web/src/features/coach/components/__tests__/SessionCard.test.tsx)
- [CoachPage.test.tsx](web/src/pages/Coach/__tests__/CoachPage.test.tsx)
- [coach-manual.en.md](user_manuals/coach-manual.en.md)
- [coach-manual.fi.md](user_manuals/coach-manual.fi.md)
- Suggested branch: ops/oqm-0031-instructor-cannot-be-removed-from-camp-sessions

**References:**
- [AGENTS.md](AGENTS.md)
- [copilot-instructions.md](.github/instructions/copilot-instructions.md)
- [frontend.instructions.md](.github/instructions/frontend.instructions.md)
- [review-checklist.instructions.md](.github/instructions/review-checklist.instructions.md)