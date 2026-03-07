# Verify Coach Pin
When user enters a valid PIN code and clicks 'Verify' button in Coach Login Dialog
- entered PIN code is sent to backend via GAS API
- in GAS the PIN is verified against all PINs stored in 'coach_login' sheet
- if matching PIN is found then corresponding row's data (coach data) is returned to the frontend
- if matching PIN is not found then error 'no_match_found' is returned to the frontend

When user clicks 'Cancel' button in Coach Login Dialog the dialog closes and user is returned to Main View

## Matching PIN is found
- The coach data is stored in a state (verifiedCoach) for as long as the user stays on Coach Page
- a toast notification for succesful verify/login with PIN is shown to the user
    * toast notification content: 'Succesfully logged in as a coach' (use translation key)
- The Coach Login Dialog is closed and Coach Page is shown

## Matching PIN not found
- an inline notification below the a 'Enter PIN code' input field is shown
    * inline notification content: 'Invalid PIN. Try again.' (use translation key)
- The input fields of the Coach Login Dialog are cleared and the dialog stays open for another try.


Acceptance Criteria:
- Dialogs should be modal and block interaction with the main view until closed.
- User can return to previous view or dialog by closing the component
- All user-facing text should support localization (English/Finnish).
- All interactive elements should be accessible via keyboard and screen reader
- Error notifications are shown to the user
- In case of verify PIN code is succesful the coach data is received from GAS backend and stored into the state for as long as the user stays on Coach Page and the state is cleared when navigating away from the Coach Page

References:
- See copilot-instructions.md, frontend.instructions.md and backend.instructions.md
- See SKILL.wire-react-to-gas.md for API contract
- See SKILL.sheet-schema.md for data structure
