## OQM-0036: Move Week/Viikko Label From Tabs to Selected Week Header

### Summary
Week tabs in Coach and Trainee registration views currently include the localized Week/Viikko prefix in each tab label. This creates repetitive tab text and makes the selected context less clear.
This issue updates the UI so tabs show only the date range, while the localized Week/Viikko label is shown once above the selected week content.

### Problem
- Week tabs repeat Week/Viikko on every tab.
- The active week context is less prominent than it should be.
- UI text can be cleaner and easier to scan on mobile and desktop.

### Goal
- Remove Week/Viikko from tab labels in both Coach and Trainee flows.
- Add a localized selected-week heading above the displayed cards for the active week.
- Keep current week auto-selection and week filtering behavior unchanged.

### Scope
- Update Coach week tab rendering and selected-week heading UI.
- Update Trainee week tab rendering and selected-week heading UI.
- Update EN/FI localization keys for week tab label format.
- Add EN/FI localization keys for selected-week heading.
- Update user manuals (EN/FI) to match visible behavior.

### Out of Scope
- Backend API changes.
- Session grouping logic changes.
- Authentication or registration flow changes.
- Styling/theme redesign beyond the requested text placement.

### Acceptance Criteria
- Coach week tabs show only date range, for example 02.06 - 08.06.
- Trainee week tabs show only date range, for example 02.06 - 08.06.
- Coach page shows localized Week/Viikko heading above selected week cards.
- Trainee page shows localized Week/Viikko heading above selected week cards.
- Existing week tab switching behavior remains unchanged.
- Existing default active week selection remains unchanged.
- EN and FI translations exist for updated and new keys.
- No TypeScript or JSON diagnostics errors are introduced.
- User manuals in EN and FI reflect the new UI wording and behavior.

### Proposed Localization Changes
- traineeRegistration.weekTabLabel: remove Week/Viikko prefix from value.
- coachQuickRegistration.weekTabLabel: remove Week/Viikko prefix from value.
- traineeRegistration.selectedWeekLabel: new key with Week/Viikko + date range.
- coachQuickRegistration.selectedWeekLabel: new key with Week/Viikko + date range.

### Test Plan
1. Verify Coach view
	- Confirm week tabs render date-range-only labels (for example, 02.06 - 08.06).
	- Confirm selected week heading renders with localized Week/Viikko text.
	- Confirm switching tabs updates both heading and visible week cards.
2. Verify Trainee view
	- Confirm week tabs render date-range-only labels (for example, 02.06 - 08.06).
	- Confirm selected week heading renders with localized Week/Viikko text.
	- Confirm switching tabs updates both heading and visible week cards.
3. Verify localization
	- Confirm English texts render correctly.
	- Confirm Finnish texts render correctly.
4. Verify regression and diagnostics
	- Confirm current week remains default when available.
	- Confirm no diagnostics errors in touched TypeScript and JSON files.

### Manual Impact
- Update coach manual EN/FI week-tab guidance.
- Update trainee manual EN/FI week-tab guidance.

### Definition of Done
- All acceptance criteria pass.
- Diagnostics report no new errors.
- Documentation/manual updates are included in the same branch.
