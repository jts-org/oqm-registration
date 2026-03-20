# Prompt: OQM-0024 Language Switch and Session Label Localization

You are implementing issue OQM-0024 in the OQM Registration repository.

## Goal
Implement and verify HomePage language switching (English/Finnish), browser-locale default behavior, session-scoped persistence, and language-aware session label rendering.

## Required Outcome
1. HomePage has language controls for English and Suomi.
2. Selected language updates UI text immediately and is saved in session storage for current tab/session.
3. With no stored selection:
- browser locale starting with fi defaults to Finnish
- all other locales default to English
4. Session title rendering rules:
- English selected: use session_type
- Non-English selected: use session_type_alias when available, otherwise session_type
5. Documentation updates:
- Frontend instructions include localization behavior and Finnish unicode-escape rule for locale strings.
- User manuals include how to change language.
6. Tests are updated and passing.

## Scope Boundaries
- Do not add language controls outside HomePage.
- Do not add backend persistence for language preference.
- Keep unrelated behavior and public APIs unchanged.

## Files to Touch
- .github/instructions/frontend.instructions.md
- web/src/pages/Home/HomePage.tsx
- web/src/pages/Home/__tests__/HomePage.test.tsx
- web/src/features/coach/components/SessionCard.tsx
- web/src/features/coach/components/__tests__/SessionCard.test.tsx
- web/src/features/trainee/components/TraineeSessionCard.tsx
- web/src/features/trainee/components/__tests__/TraineeSessionCard.test.tsx
- web/src/pages/Coach/__tests__/CoachPage.test.tsx
- web/src/pages/Trainee/__tests__/TraineePage.test.tsx
- web/src/locales/en.json
- web/src/locales/fi.json
- user_manuals/trainee-manual.en.md
- user_manuals/trainee-manual.fi.md
- user_manuals/coach-manual.en.md
- user_manuals/coach-manual.fi.md

## Implementation Notes
- Reuse existing i18n singleton from web/src/lib/i18n.ts.
- Keep language state handling minimal and local to HomePage controls.
- For session storage key, use oqm_language.
- Preserve existing coding style and localization key patterns.

## Verification Steps
1. Run frontend tests:
- cd web
- npm test -- --run
2. Confirm acceptance behavior manually:
- switch language from HomePage
- refresh same tab and verify language is retained
- clear session storage and verify browser-locale default behavior
- verify session cards show correct title by language

## Definition of Done
- All acceptance criteria in OQM-0024 issue are met.
- Frontend test suite passes.
- User manuals and instructions are updated to match implemented behavior.
