# Trainee User Manual (English)

## Purpose
This manual helps trainees use the application to log in and register for training sessions.

## Prerequisites
- You can open the application main view.
- You know your name details.
- If you already have a PIN, keep it available.

## Main Flow: Register for a Session
1. Open the app main view.
2. Select Trainees.
3. Wait until sessions are loaded.
4. Choose a session card and select Register.
5. If you are not logged in yet, fill your first name and last name in the form.
6. If you are under 18, enable the underage checkbox and set your age.
7. Select Ok.
8. Review your registration details in the confirmation dialog.
9. Select Ok to confirm registration.
10. Wait for the result message.

Expected result:
- You see Registration successfull.
- The session card changes to a registered state.
- Your name is shown in the Logged in alert.

## Login With PIN
1. On the trainee page, select Login.
2. Enter your PIN code (4 to 6 digits).
3. Select Verify.

Note:
- Coaches can also use their existing coach PIN in this same login flow when registering as a trainee.

Expected result:
- You see PIN verified succesfully.
- You are shown as logged in.
- Register PIN and Login buttons are disabled while logged in.

## Register a New PIN (Trainee)
1. On the trainee page, select Register PIN.
2. Fill first name, last name, and PIN fields.
3. If you are under 18, enable the underage option and set age.
4. Select Register.

Expected result:
- You see PIN code registered successfully.
- You are treated as logged in for registrations.

## Other Useful Actions
- Refresh data: reloads session list.
- Log out: clears your logged-in trainee state and refreshes sessions.
- Back to main: returns to the main view.

## Error and Recovery
- Invalid PIN. Try again.
  - Check PIN length (4 to 6 digits) and retry.
- Validation failed. Check input values.
  - Verify name fields and underage age value.
- Concurrent operation ongoing. Please try again.
  - Wait a moment and retry.
- Registration failed. Please try again.
  - Refresh data and retry.

## Notes About Session Cards
- Session cards show session name and time.
- Coach name is shown only for free/sparring sessions.
- Camp instructor is shown for camp sessions.
- A registered card shows a Done icon and Unregister label.
- Current behavior: Unregister action is not active yet in trainee flow.

## Quick Tips
- Registering a PIN makes repeated registrations faster.
- Keep your PIN private.
- If the page seems outdated, use Refresh data before retrying actions.
