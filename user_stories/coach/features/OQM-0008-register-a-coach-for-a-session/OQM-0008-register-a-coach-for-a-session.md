**Title:** Register a coach for a session

**Description:**  
Enable a logged-in coach to register for an available session via the Coach Page. Registration is confirmed through a dialog, and the result is communicated to the user.

**User Story:**  
As a coach, I want to register for a session so that my participation is recorded and confirmed.

**Preconditions:**  
- User is logged in to Coach Page using PIN code  
- At least one Session card with no registered coach are available

**Operation Flow:**  
1. User clicks "Register" button on a session card  
2. Confirmation dialog appears  
3. User clicks "Confirm" → registration sent to backend, result shown  
4. User clicks "Cancel" → dialog closes, cancellation toast shown

**Dialog Content:**
- The ConfirmCoachRegistrationDialog displays:
    - Confirmation text: "Do you register as coach for this session?"
    - Session information 
        - session type
        - date
        - time
    - Coach name or identifier
    - Buttons: Confirm, Cancel

**Data Handling:**
1. GAS function first checks that there isn't already registered coach for the session
    - if one is found then returns with error code `already_taken`
2. GAS function checks that the coach is listed in `coach_login` sheet
    - if no match is found from coach_login sheet returns an error code `unknown_coach`
3. GAS function inserts following data into the `coach_registrations` sheet:
    - id 
        - generated UUIDv4, unique for the sheet
    - first_name
        - From request, firstname of the coach
    - last_name
        - From request, lastname of the coach
    - session_type
        - From request
    - date
        - from request
        - the date when session is being held
        - in format 'YYYY-MM-DD'
    - realized
        - boolean, value set to true by default
        - indicates whether the coach will coach/has coached the training session
        - may be set to false if coach is removed from the session (will be implemented later)
    - start_time
        - from request
        - set only if session_type is 'free/sparring'
        - start time of the session for that day
        - in format 'HH:MM'
    - end_time
        - from request
        - only if session_type is 'free/sparring'
        - end time of the session for that day
        - in format 'HH:MM'
    - created_at
         - current date and time in ISO 8601 format
3. returns id of the appended row or an error if operation fails

**User Feedback:**
Messages shown to the user:
- Toast message: "Registration ongoing. Please wait." when registration operation starts
- Success: "Registration successful!"
- Error: "Registration failed. Please try again."
- already_taken error: "Session already has a registered coach. Refresh page."
- unknown_coach error: "Unknown coach. Contact system administrator."
- Cancel: "Registration cancelled."
- When registration succesful the Session Card's
    - background color changes to green
    - button changes to "Remove" button
    - Coach name is shown in the Session Card

**Test Cases:**  
- Coach can successfully register for only one session at the time
- Coach can register to another session after cancelling before confirmation
- Coach can register to another session after succesful registration
- Coach sees notifications about the progress of the operation as well as Session Card changes when succesfully registered to a session
- Coach receives error message if registration fails 
- Coach can cancel registration before confirmation and sees cancellation notification

**Acceptance Criteria:**  
- Clicking "Register" on a session card opens a confirmation dialog
- Registration data must be validated before sending
- Confirming registration sends data to backend (GAS API) and updates `coach_registrations` sheet  
- User receives a success or failure message after registration attempt  
- Cancelling registration closes the dialog and shows a cancellation toast
- There is no limitations to how many sessions the user can register but only one registration at the time
- There is no limitations to how many session registrations the user can cancel before confirm

**Linked Files/Branches:**  
- [CoachPage.tsx](web/src/pages/Coach/CoachPage.tsx)
- [ConfirmCoachRegistrationDialog.tsx](web/src/features/coach/components/ConfirmCoachRegistrationDialog.tsx)
- [SessionCard.tsx](web/src/features/coach/components/SessionCard.tsx)
- [coach_registrations sheet schema](skills/SKILL.sheet-schema.md)  
- GAS API implementation ([Code.gs](gas/Code.gs))
- [SKILL.wire-react-to-gas.md](skills/SKILL.wire-react-to-gas.md)
