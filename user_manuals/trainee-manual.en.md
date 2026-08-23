# Trainee User Manual (English)

## Purpose
This manual helps trainees use the application to log in and register for training sessions.

## Prerequisites
- You can open the application main view.
- You know your name details.
- If you already have a PIN, keep it available.

## Change UI Language
1. Go to the application main view (HomePage).
2. Use the language buttons above the title:
   - English
   - Suomi
3. Select your preferred language.

Expected result:
- The visible UI texts change immediately to the selected language.
- Your choice is kept while using the current browser tab/session.
- If no language was selected in the current session, the app uses browser locale by default:
  - Finnish for locales starting with fi
  - English for all other locales

## Main Flow: Register for a Session
1. Open the app main view.
2. Select Trainees.
3. Wait until sessions are loaded.
4. Review the week tabs above the session list.
5. Each tab shows only the week date range (for example, 02.06 - 08.06).
6. A Week heading is shown above the selected week's session cards.
7. The current week opens by default. Select another week tab if you want to see sessions from a different week.
8. Choose a session card and select Register.
9. If you are not logged in yet, fill your first name and last name in the form.
10. If you are under 18, enable the underage checkbox and set your age.
11. Select Ok.
12. Review your registration details in the confirmation dialog.
13. Select Ok to confirm registration.
14. Wait for the result message.

Expected result:
- You see Registration successfull.
- The session card changes to a registered state.
- Your name is shown in the Logged in alert.

## QR Registration Flow
1. Open the QR registration link from the session invite or campaign message.
2. The app checks the selector against the backend's current day and shows the matching session summary.
3. Select Continue, then enter your trainee PIN. A valid PIN fills in your existing name and age; choose manual entry if you do not have a valid PIN.
4. For manual entry, first name and last name are required, along with underage age when applicable.
5. After manual entry, choose whether to save your name, age, and PIN in this browser for future QR registrations. This is optional; decline if you are using a shared device.
6. Review the session and trainee details in the confirmation dialog, then select Ok to submit.

Expected result:
- QR registration works when the selector matches a valid same-day session.
- The app tells you clearly if the QR link is invalid or no matching session is available.
- Your saved name and age are optional browser data and are not sent until you confirm a registration.
- QR registration can use an existing trainee PIN or continue with required manual name entry.

## Error and Recovery
- Missing session selector in the QR link.
  - Open a valid QR link or contact support if the link is broken.
- This QR code is not supported.
  - Use a valid campaign link for the current session set.
- No matching training session is available today.
  - Check the session schedule or try again on another day.
- This registration is already recorded.
  - No new registration is created. Check the session card or contact support if the record is unexpected.
- Registration failed. Please try again.
  - Refresh data and retry.

Note:
- Save identity only on a personal device. Shared devices can expose your personal name and age to others.

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
- Existing registrations in the visible 21-day window are refreshed and shown as registered cards automatically.

## Register a New PIN (Trainee)
1. On the trainee page, select Register PIN.
2. Fill first name, last name, and PIN fields.
3. If you are under 18, enable the underage option and set age.
4. Select Register.

Expected result:
- You see PIN code registered successfully.
- You are treated as logged in for registrations.
- Existing registrations in the visible 21-day window are refreshed and shown as registered cards automatically.

## Other Useful Actions
- Refresh data: reloads session list.
- Log out: clears your logged-in trainee state and refreshes sessions.
- After log out, identity-based registered markers are removed from cards.
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
- Session cards are grouped by day inside the selected week tab.
- The current calendar week is shown first when it exists in the loaded session data.
- Session cards show session name and time.
- Coach name is shown only for free/sparring sessions.
- Camp instructor is shown for camp sessions.
- A registered card shows a Done icon and Unregister label.
- Current behavior: Unregister action is not active yet in trainee flow.

## Quick Tips
- Registering a PIN makes repeated registrations faster.
- Keep your PIN private.
- If the page seems outdated, use Refresh data before retrying actions.

## Send feedback, report a bug, or request support
1. On the Home page, select Feedback.
2. Enter your registered PIN code.
3. Choose whether you are sending feedback, a bug report, or a support request.
4. Write your message and select Send.

Expected result:
- Your feedback is stored for support review.
- OQM support receives a notification email.
