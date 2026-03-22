# Coach User Manual (English)

## Purpose
This manual helps coaches log in and manage coach registrations for sessions.

## Prerequisites
- You can open the application main view.
- You have either:
  - a coach PIN code, or
  - the coach password.

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

## Main Flow: Open Coach Quick Registration
1. Open the app main view.
2. Select Coaches.
3. In the login dialog, either:
   - enter PIN and select Verify, or
   - enter password and select Login.

Expected result:
- You enter Coach Quick Registration.
- Session cards are shown in date groups.

## Register as Coach for a Session
1. On Coach Quick Registration, find a session card.
2. Select Register on a session without a coach.
3. If asked, provide your name details.
4. Review details in Confirm Registration dialog.
5. Select Confirm.

Expected result:
- You see Registration successful.
- Card changes to a registered state with coach details.

## Remove Coach Registration
1. Find a session where you are already registered.
2. Select Remove.
3. Read the warning in the confirmation dialog.
4. Select Confirm to remove.

Expected result:
- You see Registration removed successfully.
- Session card returns to available state.

## Create a Free/Sparring Session
1. Select Free/sparring session.
2. Fill first name, last name, date, start time, and end time.
3. Select Confirm.
4. Confirm the registration in the next dialog.

Expected result:
- A new free/sparring registration is created.
- If the date is outside the visible window, you are informed it will appear when in range.

## Register New PIN Code (Coach)
1. In Coach login dialog, select Register new PIN code.
2. Fill first name, last name, optional alias, and PIN fields.
3. Select Register.
4. Return to login and verify with the new PIN.

Possible registration conflict messages:
- Coach with same name already registered but aliases differ.
  - Verify alias spelling and use the same alias that was previously used.
- You are already registered.
  - Use your existing PIN in Coach login.
- Coach with the same name already registered but pins unmatch.
  - Verify your PIN or contact an administrator if you do not know the original PIN.

## Other Useful Actions
- Refresh data: reloads the current session list.
- Back to main: exits coach page.

## Register Yourself as a Trainee (Using Coach PIN)
1. Return to the main view and select Trainees.
2. Select Login.
3. Enter your coach PIN and select Verify.
4. Register for a trainee-side session normally.

Expected result:
- Coach PIN is accepted in trainee login.
- You can proceed with trainee-side session registration without creating a separate trainee PIN.

## Error and Recovery
- Invalid PIN. Try again.
  - Re-enter PIN and verify.
- Incorrect password. Try again.
  - Re-enter password carefully.
- Session already has a registered coach. Refresh page.
  - Select Refresh data and choose another session if needed.
- Overlapping session found.
  - Adjust free/sparring date or time and retry.
- Concurrent operation ongoing. Refresh page before trying again.
  - Refresh and retry.

## Notes About Session Cards
- Green card means a coach is assigned.
- Non-green card means session is available.
- Free/sparring cards without coach cannot be claimed with Register button.
  - Use Free/sparring session action to create and register one.

## Quick Tips
- Use PIN login for faster access.
- Use alias when you want a preferred display name.
- Refresh data before changes if multiple people are updating sessions.
