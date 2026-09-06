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
5. After a valid PIN or manual entry, a dialog asks whether to save your name and age in this browser for future QR registrations. Select Save or Don't save; this is optional and you can decline if you are using a shared device. You see a confirmation message showing whether the save succeeded.
6. Review the session and trainee details in the confirmation dialog, then select Ok to submit.
7. On a later visit, if a valid identity is already saved in this browser, selecting Continue skips the PIN and manual entry steps and goes straight to the confirmation dialog for the new session.
8. If the remembered identity is not yours, select "Not you? Use a different identity" to clear it and register with your own PIN or manual entry.

Expected result:
- QR registration works when the selector matches a valid same-day session.
- The app tells you clearly if the QR link is invalid or no matching session is available.
- Your saved name and age are optional browser data and are not sent until you confirm a registration.
- QR registration can use an existing trainee PIN or continue with required manual name entry.
- A previously saved identity lets repeat QR registrations skip straight to session confirmation, with a fallback to switch identities if needed.

## QR Registration: Saved Details Missing
Your saved name and age can be removed when the browser clears this site's data. Private or incognito browsing commonly removes saved site data when its private windows are closed. The app cannot keep these details if the browser removes them. Saving is optional; your PIN is managed by the service, not stored as saved browser identity data.

To keep saved details on your personal device, do not use private or incognito tabs, and do not clear this site's cookies or site data. Clearing browser or site data removes the saved QR identity. The browser controls whether data remains available.

### Desktop browsers
Check that the browser is not set to delete site data when it closes:
- Microsoft Edge: open `edge://settings/privacy`, then review **Clear browsing data on close**. Do not enable clearing cookies or site data for this app.
- Google Chrome: open `chrome://settings/content/siteData`, or go to **Privacy and security** and check **Delete data sites have saved to your device when you close all windows**. Keep this option off for saved details to remain.
- Mozilla Firefox: open `about:preferences#privacy`, then under **Cookies and Site Data** check **Delete cookies and site data when Firefox is closed**. Turn it off, or add an exception for this app if your Firefox version offers one.
- Safari: open **Safari Settings > Privacy > Manage Website Data**. Do not remove this app's website data if you want to keep saved details. Private Browsing does not keep saved details after private windows are closed.

### Mobile browsers
- Safari on iPhone or iPad: open the **Settings** app, then **Safari > Advanced > Website Data**. Do not remove this app's website data, and do not use Private Browsing.
- Chrome on Android: open the three-dot menu, then **Settings > Privacy and security > Clear browsing data**. Do not clear cookies or site data.
- Samsung Internet: open the menu, then **Settings > Personal browsing data > Delete browsing data**. Do not delete cookies or site data.
- Firefox on Android: open the menu, then **Settings > Delete browsing data on quit** or **Data Management**. Do not enable deletion of cookies or site data when Firefox closes.

If the details have already been removed, open the QR link again, select **Continue**, and enter your PIN or use manual entry. You can choose **Save** again after your identity is verified. Browser labels may vary slightly by version.

## QR Registration for Customer Events
When scanning a customer event QR code at the gym (e.g. `https://jts-org.github.io/oqm-registration/register?customer-event=<id>`):

1. **Event Resolution**: The app automatically fetches the event details and all eligible training sessions for that event.
2. **Session Selection**:
   - **Single Session**: If exactly one session is available, it is selected automatically.
   - **Multiple Sessions**: If two or more sessions are available, a selection list with checkboxes appears. You can select any non-empty subset or use **Select all** / **Deselect all**.
3. **Identity Entry**: Enter your first name and last name. If you are under 18, check the underage box and specify your age (1–17).
4. **Confirmation**: Select **Confirm Registration** to view the summary of your selected sessions and identity details.
5. **Submission**: Select **Submit Registration**. Upon success, a confirmation message confirms your registration for all selected sessions.

## Error and Recovery
- Missing session selector in the QR link.
  - Open a valid QR link or contact support if the link is broken.
- Missing customer event identifier in the link.
  - Ensure the full QR URL was scanned or opened properly.
- The customer event is invalid or unavailable / inactive.
  - Contact the event organizer or gym staff to verify the event is active.
- No training sessions are available for this event.
  - No active schedule rows were found within the event dates.
- Please select at least one session to continue.
  - In multi-session events, select at least one session checkbox before confirming.
- This QR code is not supported.
  - Use a valid campaign link for the current session set.
- No matching training session is available today.
  - Check the session schedule or try again on another day.
- This registration is already recorded / You are already registered.
  - No new duplicate registration is created.
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
