# Title
OQM-0027: Show CoachPage session cards in weekly tabs (current week by default)

## Summary
Coaches need faster navigation through the 21-day session window on Coach Quick Registration.
Replace the current flat date-grouped rendering with weekly tabs so coaches can view one calendar week (Mon-Sun) at a time. The current calendar week must be selected by default.

## Problem
The current session list can be hard to scan when many days are shown at once. Coaches requested week-level navigation to reduce cognitive load and speed up session selection.

## Scope
- Add MUI Tabs and Tab to Coach Quick Registration page.
- Group existing date groups into calendar week buckets (Mon-Sun).
- Default selected tab to current calendar week if present; otherwise first available week.
- Keep existing SessionCard behavior and register/remove/sparring flows unchanged.
- Add localized week tab labels (EN/FI).
- Update coach user manuals (EN/FI) for the new navigation behavior.
- Add frontend tests for tab rendering, default selection, and tab switching behavior.

## Out of scope
- Backend or GAS route changes.
- Trainee page UI parity changes.
- Broad refactor of shared date utilities.

## User flow
1. Coach logs in and opens Coach Quick Registration.
2. Coach sees week tabs above sessions.
3. Current calendar week is selected by default.
4. Coach switches tabs to view another week.
5. Inside each tab, sessions remain grouped by date and rendered as SessionCards.
6. Coach can still Register, Remove, Refresh, and use Free/sparring flow as before.

## Acceptance criteria
1. Coach Quick Registration shows week tabs when sessions are available.
2. Tabs represent calendar weeks from Monday to Sunday.
3. Current calendar week is selected by default when available.
4. If current week is not present, first available week is selected.
5. Selecting a week tab only shows sessions from that week.
6. Sessions within the selected week remain grouped by day.
7. Existing Register/Remove/Manual/Sparring/Refresh behavior remains unchanged.
8. New week tab labels are localized in English and Finnish.
9. Coach manuals in English and Finnish describe weekly tab usage.
10. Tests cover:
    - multi-week tab rendering
    - default current-week selection
    - tab switch visibility behavior

## Concrete test cases
1. Given sessions in two different weeks, when CoachPage loads, then two tabs are rendered.
2. Given sessions in current week and next week, when CoachPage loads, then current week session is visible and next week session is hidden.
3. Given two week tabs, when user clicks second tab, then second-week session is visible and current-week session is hidden.
4. Given only one week in data, when CoachPage loads, then one tab is rendered and sessions are shown normally.
5. Given no sessions, when CoachPage loads, then no-sessions state is shown and tab container is not shown.

## Definition of done
- [] Feature implemented and tests green.
- [] Localization updated in EN/FI locale files.
- [] User manuals updated in EN/FI.
- [] PR includes manual impact and test evidence.