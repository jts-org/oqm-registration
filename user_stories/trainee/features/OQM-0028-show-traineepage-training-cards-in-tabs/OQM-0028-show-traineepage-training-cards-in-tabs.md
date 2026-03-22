# Title
OQM-0028: Show TraineePage session cards in weekly tabs (current week by default)

## Summary
Trainees need faster navigation through the 21-day session window on the trainee registration page.
Replace the current flat date-grouped rendering with weekly tabs so trainees can view one calendar week (Mon-Sun) at a time. The current calendar week must be selected by default.

## Problem
The trainee session list can be hard to scan when many days are visible at once. Trainees requested week-level navigation to reduce scrolling and make session selection easier.

## Scope
- Add MUI Tabs and Tab to the trainee registration page.
- Group existing date groups into calendar week buckets (Mon-Sun).
- Default the selected tab to the current calendar week if present; otherwise the first available week.
- Keep existing trainee registration, PIN registration, PIN login, logout, and refresh flows unchanged.
- Add localized week tab labels (EN/FI).
- Update trainee user manuals (EN/FI) for the new weekly navigation behavior.
- Add frontend tests for tab rendering, default selection, and tab switching behavior.

## Out of scope
- Backend or GAS route changes.
- Coach page behavior changes.
- Broad refactor of shared date utilities.
- Session card redesign beyond what is required for the new tab container.

## User flow
1. Trainee opens the trainee registration page.
2. Trainee sees week tabs above the session list.
3. The current calendar week is selected by default.
4. Trainee switches tabs to view another week.
5. Inside each tab, sessions remain grouped by date and rendered as SessionCards.
6. Trainee can still register, refresh, log in with PIN, register a PIN, and log out as before.

## Acceptance criteria
1. Trainee registration shows week tabs when sessions are available.
2. Tabs represent calendar weeks from Monday to Sunday.
3. The current calendar week is selected by default when available.
4. If the current week is not present, the first available week is selected.
5. Selecting a week tab only shows sessions from that week.
6. Sessions within the selected week remain grouped by day.
7. Existing trainee Register/Login/Register PIN/Logout/Refresh behavior remains unchanged.
8. New week tab labels are localized in English and Finnish.
9. Trainee manuals in English and Finnish describe weekly tab usage.
10. Tests cover:
	- multi-week tab rendering
	- default current-week selection
	- tab switch visibility behavior
	- no-tabs behavior when there are no sessions

## Concrete test cases
1. Given sessions in two different weeks, when TraineePage loads, then two tabs are rendered.
2. Given sessions in current week and next week, when TraineePage loads, then the current-week session is visible and the next-week session is hidden.
3. Given two week tabs, when the user clicks the second tab, then the second-week session is visible and the current-week session is hidden.
4. Given only one week in the data, when TraineePage loads, then one tab is rendered and sessions are shown normally.
5. Given no sessions, when TraineePage loads, then the no-sessions state is shown and the tab container is not shown.

## Definition of done
- [] Feature implemented and tests green.
- [] Localization updated in EN/FI locale files.
- [] User manuals updated in EN/FI.
- [] PR includes manual impact and test evidence.
