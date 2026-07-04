# Bug Report

## Summary
Sessions schedule row with Monday-only weekday value (`0` in sheet column `weekdays_available`) is rendered as `-` in Admin UI "Days of week" cell, instead of showing Monday.

## Steps to Reproduce
1. Open sheet `sessions_schedule`.
2. Create or edit a row where `weekdays_available` is numeric `0` (not text `0,2,4`, etc.).
3. Ensure row is otherwise valid and visible in Admin Sessions Schedule list.
4. Open Admin page -> Sessions Schedule.
5. Observe the "Days of week" cell for that row.

## Expected Behavior
The UI should show Monday label/chip (localized), e.g. `Mon` / `Ma`, for `weekdays_available = 0`.

## Actual Behavior
UI shows dash `-` in "Days of week" for Monday-only rows.

## Environment
- Browser: Chrome (reported)
- Device: Desktop (reported)
- Screen size: Desktop width (reported)
- Backend version: GAS deployed web app (exact deployment ID/version to be confirmed)
- Frontend commit: OQM-0042-sessions-schedule-management branch (exact SHA to be confirmed)

## Relevant Skills
(Select all that apply)

- [x] API Contract  
  @see .github/skills/wire-react-to-gas/SKILL.md

- [x] Frontend API Client  
  @see .github/skills/frontend-api-client/SKILL.md

- [x] UX & Accessibility  
  @see .github/skills/frontend-ux-and-accessibility/SKILL.md

- [x] Responsive Design  
  @see .github/skills/frontend-responsive-design/SKILL.md

- [x] Backend Validation  
  @see .github/skills/gas-validation-rules/SKILL.md

- [x] Date/Time Logic  
  @see .github/skills/gas-date-and-time/SKILL.md

## Logs / Screenshots
- Screenshot 1: Admin UI row shows `-` in "Days of week".
- Screenshot 2: Sheet row shows `weekdays_available = 0`.
- Backend logging confirms data path where falsy `0` can be converted to empty string during row mapping.

## Additional Notes
Root cause: backend mapping used a falsy fallback for `weekdays_available` (`row[5] || ''`), which turns numeric `0` into empty string.  
Fix: use nullish fallback (`row[5] ?? ''`) so numeric `0` is preserved as string `"0"`.  
Regression test should cover numeric Monday-only value in `listSessionsSchedule_` mapping.