# OQM-0024: HomePage Language Switch and Session Label Localization

## Description
Add explicit UI language switching on HomePage and align session-card naming behavior by selected language. Update localization rules and user manuals to document the expected behavior.

## User Story
As a user, I want to switch UI language between English and Finnish from the HomePage so that I can read and understand the application texts, and I want session names to follow the selected language consistently.

## Scope
- Add HomePage language switch controls (English/Suomi).
- Persist selected language for current browser tab/session.
- Keep locale default behavior based on browser locale (fi* -> fi, otherwise en).
- For `SessionCard` and `TraineeSessionCard`:
  - English selected: use `session_type`.
  - Non-English selected: use `session_type_alias` when available, else fallback to `session_type`.
- Add/update tests for language switching and session-name rendering behavior.
- Update frontend instruction rules for localization behavior.
- Update trainee and coach manuals (EN/FI) with language switching instructions.

## Out of Scope
- Adding language controls outside HomePage.
- Persisting language to backend/user profile.
- Refactoring existing act(...) warnings in unrelated tests.

## Preconditions
- i18n is initialized from `web/src/lib/i18n.ts`.
- Locale files exist in `web/src/locales/en.json` and `web/src/locales/fi.json`.
- HomePage is reachable from app root.

## Main Flow (Language Switch)
1. Open HomePage.
2. User selects `English` or `Suomi` above the title.
3. App updates i18n language immediately.
4. App stores selected language in session storage key `oqm_language`.
5. HomePage and downstream UI texts render in selected language.

## Alternative Flows
1. If no language has been selected in current session:
- App defaults by browser locale.
- `fi*` locale -> Finnish.
- any other locale -> English.

2. If session storage has an invalid language value:
- Ignore invalid value and use current i18n/browser-locale default behavior.

## Session Label Flow
1. App renders `SessionCard` or `TraineeSessionCard`.
2. If selected language starts with `en`, card title uses `session_type`.
3. Otherwise, card title uses `session_type_alias` when present.
4. If alias is missing, fallback uses `session_type`.

## User Feedback Messages
- HomePage shows language controls: `English`, `Suomi`.
- Text changes immediately after language selection.
- Manuals describe where to change language and how default language is chosen.

## Acceptance Criteria
- HomePage contains clickable language controls for English and Finnish.
- Selecting language updates visible UI texts immediately.
- Selected language is retained during current tab/session.
- With empty session selection:
  - browser locale `fi*` defaults to Finnish.
  - all other locales default to English.
- `SessionCard` and `TraineeSessionCard` render `session_type` in English mode and alias-first in non-English mode.
- Frontend instructions include localization default/scope rules and unicode escape rule for Finnish locale files.
- User manuals include language-switch instructions in both English and Finnish manuals.
- Frontend tests pass.

## Concrete Test Cases
1. HomePage language switch renders both buttons: `English`, `Suomi`.
2. Clicking `Suomi` sets session storage `oqm_language=fi` and HomePage heading appears in Finnish.
3. With `oqm_language=fi`, HomePage loads in Finnish on render.
4. SessionCard in English renders `session_type` (`Kickboxing`) even when alias exists.
5. SessionCard in Finnish renders `session_type_alias` (`Nyrkkeilyharjoitus`) when alias exists.
6. TraineeSessionCard in English renders `session_type`.
7. TraineeSessionCard in Finnish renders `session_type_alias`.
8. Full frontend test suite passes (`npm test -- --run`).

## Linked Files
- `.github/instructions/frontend.instructions.md`
- `web/src/pages/Home/HomePage.tsx`
- `web/src/pages/Home/__tests__/HomePage.test.tsx`
- `web/src/features/coach/components/SessionCard.tsx`
- `web/src/features/coach/components/__tests__/SessionCard.test.tsx`
- `web/src/features/trainee/components/TraineeSessionCard.tsx`
- `web/src/features/trainee/components/__tests__/TraineeSessionCard.test.tsx`
- `web/src/pages/Coach/__tests__/CoachPage.test.tsx`
- `web/src/pages/Trainee/__tests__/TraineePage.test.tsx`
- `web/src/locales/en.json`
- `web/src/locales/fi.json`
- `user_manuals/trainee-manual.en.md`
- `user_manuals/trainee-manual.fi.md`
- `user_manuals/coach-manual.en.md`
- `user_manuals/coach-manual.fi.md`

## Validation Notes
- Frontend suite result after changes: 19 files passed, 325 tests passed.
