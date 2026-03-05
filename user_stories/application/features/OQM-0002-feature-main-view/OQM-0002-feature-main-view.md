# Feature: Main View
Main view is shown after application startup
- Main view is full page view
- user should see three (3) buttons in a row to select if the user wants to register him/herself as a trainee or coach into a training session or as an admin
- Button labels: 'Trainees', 'Coaches', 'Admin' (use translation keys)

## 'Trainees' button
when user clicks 'Trainees' button a Trainee registration view opens (dummy view should be shown at this point)

## 'Coaches' button
when user clicks 'Coaches' button a modal coach password enquiry dialog is shown with 'Submit' and 'Cancel' buttons

### Password/PIN enquiry dialog  
- Button labels: ''Verify', 'Login' (use translation key)
- Input field titles: 'Enter PIN code', 'Enter password' (use translation key)
- Link text: 'Register new PIN code' (use translation key)
Modal password enquiry dialog should have following components:

#### Login with personal PIN code input field and verify button
- 'Verify' button is located on the same row as the input field.
- PIN code should be 4-6 characters long and can contain only numbers.
- 'Verify' button should be active only when at least four numbers have been provided by the user
- verify PIN code against registered PIN code from backend and actual login will be implemented later.
- For now when a four number PIN code is provided and Verify button is clicked by the user, a dummy Coach Registration View is shown

#### Register new PIN code link
- the link should be visible under PIN code input field
- when user clicks the link a modal dialog with title 'Register new PIN code' is shown. Use translation key for the title
- content and functionality of the Register PIN Code dialog will be implemented later

#### Login with coach password input field
- a Login button should be visible on the same row as this input field and should be active only when at least one character has been provided by the user
- When user provides a password it is compared to settings data's 'coach_pwd' parameter value
- if passwords match a Coach Registration view is opened (dummy view should be shown at this point)
- if passwords do not match then a modal popup alert for failed login
- when user closes the modal popup alert the Password/PIN enquiry dialog stays open for another try until Cancel button is clicked

### Coach Registration View
- Full-page view
- display a placeholder message
- at this point only a dummy implementation but a button to return to main view should be provided
- Button label: 'Back to Main' (use translation key)

### Register PIN code dialog
- Modal dialog
- display a placeholder message
- at this point only a dummy implementation but a button to close the dialog should be provided.
- when close dialog button is clicked the user returns to Password/PIN enquiry dialog
- Button label: 'Cancel' (use translation key)

## 'Admin' button
- when user clicks 'Admin' button a modal admin password enquiry dialog is shown with 'Submit' and 'Cancel' buttons

### Coach password dialog
- a modal dialog
- Button labels: 'Submit', 'Cancel' (use translation key)
- Input field tittle: 'Enter password' (use translation key)
- Failed login message: 'Incorrect password. Try again' (use translation key)
- When user provides a password it is compared to settings data's 'admin_pwd' parameter value
- if passwords match a Admin view is opened (dummy view should be shown at this point)
- if passwords do not match then a modal popup alert for failed login
- after failed login attempt the dialog stays open for another try

### Admin view
- Full-page view
- display a placeholder message
- at this point only a dummy implementation but a button to return to main view should be provided
- Button label: 'Back to Main' (use translation key)

Acceptance Criteria:
- Dialogs and views with specified components are shown to the user when buttons are clicked
- Dialogs should be modal and block interaction with the main view until closed.
- User can return to previous view or dialog by closing the component
- All user-facing text should support localization (English/Finnish).
- Errors are handled gracefully and surfaced to the user
- All interactive elements should be accessible via keyboard and screen reader
- Network or unexpected errors should be shown as toast notifications.

References:
- See copilot-instructions.md and frontend.instructions.md
