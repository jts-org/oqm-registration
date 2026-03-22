**Title:** 
Trainee Page Content And Registration To a Training Session

**Description:**  
Implement Trainee Page, show available training sessions to a trainee on Trainee Page and enable registration to a session. Registration data is collected and confirmed through dialogs, send via GAS API to backend and the result is communicated to the user.

**User Story:**  
As a trainee, I want to register for a training session, so that my participation is recorded and confirmed.

**Preconditions:**  
- User has clicked the "Trainees" button on Home Page

**Operation Flow:**  
1. Application makes a request to backend via GAS api to fetch available training sessions' info on screen
    - Loading spinner is shown to the user and interaction with UI is blocked until response is received from the backend
    - Toast message: "Fetching training sessions. Please wait."
2. Application shows available training sessions same way as in [CoachPage.tsx](web/src/pages/Coach/CoachPage.tsx)
    - By default all cards are greenish color (follow the theme)
    - Cards have "Register" button active by default
    - If trainee unregisters (feature will be implemented later) from a session he/she have registered then button label is "Unregister"
    - Coach names are shown only for sessions with `session_type` "free/sparring"
    - Camp instructor name in place of coach name if session belongs to a camp
3. When user clicks card's "Register" button Manual Trainee Registration Dialog opens
    - User fills registration information
        - User clicks "Cancel" button → Manual Trainee Registration Dialog closes and toast message: "Registration cancelled" is shown to the user
        - User clicks "Ok" → Confirm Trainee Registration Dialog opens
4. User clicks "Confirm" button on Confirm Trainee Registration Dialog → trainee registration data is send to backend via GAS API
    - Toast message: "Registration ongoing. Please wait." is shown to the user
    - Loading spinner is shown and all interaction with UI is blocked until response is received from backend
    - Message about succesful or failed trainee registration is shown to the user
        - if succesfull
            - Confirm Trainee Registration Dialog and Manual Trainee Registration Dialog closes
            - Toast message: "Registration successfull." is shown to the user
            - Trainee's first name, last names, age is transferred to Trainee Page
                - Store into a state `pendingTraineeData`
            - Trainee is navigated to Trainee Page
            - Trainee Page's Alert Card shows info: "Logged in: {{first name}} {{last name}}."
            - Trainee can register to other sessions using the `pendingTraineeData` state content
        - if failed Confirm Trainee Registration Dialog stays open and the error message is shown to the user depending on the returned error
            - concurrent_request error: "Concurrent operation ongoing. Please try again."
            - already_registered error: "You already have registered for this training session."
            - validation_failed error: "Validation failed. Check input values."
            - validation_failed_age error: "Validation failed. Age is missing for underage trainee."
5. User clicks "Cancel" button on Confirm Trainee Registration Dialog
    - the Confirm Trainee Registration Dialog closes and toast message: "Registration cancelled" is shown to the user
    - Manual Trainee Registration Dialog stays open

**Dialog/Page Content:**
1. Trainee Page
    1. See [CoachPage.tsx](web/src/pages/Coach/CoachPage.tsx) for reference
    2. Tittle text: "Trainees registration"
    3. If user is not logged in Alert Card shows warning: "You are not logged in."
    4. If user is logged in Alert card shows success: "Logged in: {{first name}} {{last name}}"
    5. "Login" or "Log out" button replaces the "free/sparring" button
        1. "Login" button is shown if state `pendingTraineeData` has no content
            - use LoginIcon from '@mui/icons-material/Login' as icon
            - Functionality when user clicks the button will be implemented later
        2. "Log out" button is shown if state `pendingTraineeData` has content
            - use LogoutIcon from '@mui/icons-material/Logout'
            - Clicking the button clears `pendingTraineeData` state and Alert Card shows warning: "You are not logged in."
            - User stays on Trainee Page
    6. Add "Register PIN" button on the right of the "Login"/"Logout" button
        - use PinIcon from '@mui/icons-material/Pin' as icon
        - Functionality when user clicks the button will be implemented later
    7. Cards don't show coach name except when session_type is "free/sparring"
    8. Cards show camp instructor name if session belongs to a camp
    9. User clicks "Back to main" button
        - State `pendingTraineeData` is cleared
        - User is navigated to Main Page
2. Manual Trainee Registration Dialog
    1. See [ManualCoachRegistrationDialog.tsx](web/src/features/coach/components/ManualCoachRegistrationDialog.tsx) for reference
    2. Add FormGroup containing FormControlLabel below lastname TextField containing only one CheckBox
        - all MUI components
        - FormControlLabel
            - label="I'm under 18 year old"
            - not required
        - if checkbox is checked show NumberSpinner MUI component on the left side of the checkbox
        - NumberSpinner MUI component
            - Label="Age:"
            - min={1}
            - max={17}
            - size="small"
            - defaultValue={15}
    3. Info messsage and link
        - text: "With personal PIN code, you speed up and simplify your registration."
        - Functionality when user clicks the link will be implemented later
    4. "Cancel" and "Ok" buttons at the bottom of the dialog
3. Confirm Trainee Registration Dialog
    1. See [ConfirmCoachRegistrationDialog.tsx](web/src/features/coach/components/ConfirmCoachRegistrationDialog.tsx) for reference
    2. Title text same as referenced dialog
    3. Confirm Register Question text: "Do you register as trainee for this session?"
    4. Session type, session date and time (start and end times) are shown as referenced dialog
    5. Coach name 
        - field visible only if training session's session_type is "free/sparring"
    6. Camp instructor name
        - only if session belongs to a camp
    7. Trainee's name and age
        - Age included only if trainee is underage
    8. "Cancel" and "Ok" buttons

**Data Handling:**
1. Fetching available training sessions GAS function (GAS function works in outline much like `getCoachSessions_()` function)
    1. Calculate training period: 21-day window (7 days before current week's Monday through next 2 weeks)
    2. Pre-calculate active sessions during training period using `sessions` and `weekly_schedule` sheets and add them into the set.
    3. Fetch coach sessions rows within training period from `coach_registrations` sheet
        - Only rows with `realized` value equals `true` and `session_type` value equals `"free/sparring"` are included into the set
    4. Checks if any camps are scheduled within training period from `camps` sheet by comparing `start_date` and `end_date` values with training period
        - Include those camp sessions of the camp that fall within training period from `camp_schedules` sheet
        - replace pre-existing training sessions with camp sessions of same dates that `session_type` is not `"free/sparring"`
        - fetch `instructor` value from `camps` sheet
            - from `camps` row that `id` matches `camp_shedules` row's `camp_id`
    5. Sort by date and then start time
    6. Return following information:
        - id
            - for camp sessions: 'camp_' + id from `camp_shedules` sheet + '_' + camp session date
            - regular sessions: id from `weekly_schedule` sheet + '_' + session date
            - free/sparring sessions: 'sparring_' + id from `coach_registrations` sheet + '_' + free/sparring session date
        - session_type
            - values: 'advanced' | 'fittness' | 'basic' | 'free/sparring' | `session_name` from `camp_shedules` sheet
        - session_type_alias
            - `session_type_alias` from `sessions` sheet or `session_name` from `camp_shedules` sheet
        - date
            - scheduled date of the session
        - start_time
            - in format 'HH:MM'
        - end_time
            - in format 'HH:MM'
        - location
            - empty string for now
        - coach_firstname
            - has value only if `session_type` is "free/sparring"
            - from `coach_registrations` sheet
        - coach_lastname
            - has value only if `session_type` is "free/sparring"
            - from `coach_registrations` sheet
        - camp_instructor_name
            - has value only if session is camp session
        - is_free_sparring
            - true if session_type is "free/sparring", otherwise false
2. Saving trainee registration data GAS function
    1. Request is send via [registerTraineeForSession](web/src/features/trainee/api/trainee.api.ts) API function
    1. Request payload content
        - first_name: trainee's first name
        - last_name: trainee's last name
        - age_group: 'adult' | 'underage'
        - underage_age: Trainee's age if trainee is underage, otherwise empty value
        - session_type: session type of the session the trainee is registering to
        - camp_session_id: see fetch operation's return values
            - if id start with 'camp_' extract the id part and set the value here
            - backend handles the id extraction
            - for other session types this value is not set
        - date: the date of the session the trainee is registering to
        - start_time: start time of the training session the trainee is registering to
            - in format 'HH:MM'
        - end_time: end time of the training session the trainee is registering to
            - in format 'HH:MM'            
    1. Acquire script lock
        - return 'concurrent_request' if lock cannot be aquired
    2. Scan `trainee_registrations` sheet for previous registrations.
        - compare request's data against `trainee_registrations` sheet rows, exclude id from comparison
        - If match is found then 'already_registered' error is returned
    3. Append new row to `trainee_registrations` sheet
        - by default set 'realized' column boolean value to true
        - set 'created_at' and 'updated_at' values to current date    
    4. return new row's id
    5. Finally release script lock

**User Feedback:**
- Alert Card warning: "You are not logged in."
- Alert card info: "Logged in: {{first name}} {{last name}}."
- Toast message: "Fetching training sessions. Please wait."
- Toast message: "Registration ongoing. Please wait."
- Toast message: "Registration cancelled"
- Success: "Registration successfull."
- Cancel: "Registration cancelled."
- concurrent_request error: "Concurrent operation ongoing. Please try again."
- already_registered error: "You already have registered for this training session."
- validation_failed error: "Validation failed. Check input values."
- validation_failed_age error: "Validation failed. Age is missing for underage trainee."
- When registration succesfull the session card's
    - background changes to orange (use corresponding theme color)
    - Button changes to "Unregister"
    - DoneIcon from '@mui/icons-material/Done' appears on the right upper corner

**Test Cases:**  
- Trainee sees a list of available training sessions on the Trainee Page.
- Loading spinner and toast message appear while fetching sessions
- Session cards display correct information (coach/camp instructor, session type, date/time).
- "Register" button opens Manual Trainee Registration Dialog.
- Registration dialog collects trainee information, including underage checkbox and age spinner.
- "Cancel" button closes dialog and shows cancellation toast.
- "Ok" button opens Confirm Trainee Registration Dialog.
- Confirm dialog displays session and trainee details.
- "Confirm" button sends registration data; spinner and toast appear.
- On success, dialogs close, session card updates (orange background, "Unregister" button, DoneIcon), and trainee data is stored in state.
- On failure, error message is shown in dialog (concurrent_request, already_registered, validation_failed, validation_failed_age).
- "Cancel" button in confirm dialog closes only the confirm dialog.
- "Login"/"Logout" button changes based on trainee state; clicking "Logout" clears state and shows warning.
- "Register PIN" button is visible and uses correct icon.
- "Back to main" button clears state and navigates to Main Page.
- Accessibility: All dialogs and buttons are keyboard accessible and have appropriate ARIA labels.

**Acceptance Criteria:**  
- Trainee Page displays sessions with correct information and UI elements.
- Registration flow works as described, including dialogs, state updates, and error handling.
- Session card updates visually after successful registration.
- All toast and alert messages match specified text.
- "Login"/"Logout" and "Register PIN" buttons function as described.
- Data sent to backend matches outlined payload structure.
- Edge cases (already registered, concurrent request, validation errors) are handled gracefully.
- Accessibility requirements are met for dialogs and buttons.
- All referenced icons and theme colors are used consistently.
- Outlook of Trainee Page and new dialogs follow the same style as referenced pages and dialogs

**Linked Files/Branches:**  
- [CoachPage.tsx](web/src/pages/Coach/CoachPage.tsx)
- [TraineePage.tsx](web/src/pages/Trainee/TraineePage.tsx)
- [ManualCoachRegistrationDialog.tsx](web/src/features/coach/components/ManualCoachRegistrationDialog.tsx)
- [ConfirmCoachRegistrationDialog.tsx](web/src/features/coach/components/ConfirmCoachRegistrationDialog.tsx)
- GAS API implementation ([Code.gs](gas/Code.gs))
- [sessions sheet schema](skills/SKILL.sheet-schema.md)
- [weekly_schedule sheet schema](skills/SKILL.sheet-schema.md)
- [coach_registrations sheet schema](skills/SKILL.sheet-schema.md)
- [camps sheet schema](skills/SKILL.sheet-schema.md)
- [camp_schedules sheet schema](skills/SKILL.sheet-schema.md)
- [SKILL.wire-react-to-gas.md](skills/SKILL.wire-react-to-gas.md)
