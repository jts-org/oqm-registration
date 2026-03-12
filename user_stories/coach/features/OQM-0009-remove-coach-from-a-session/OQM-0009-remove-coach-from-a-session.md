**Title:** 
Remove a coach from a session

**Description:**  
Enable a logged-in coach to remove coach from a session via the Coach Page. Removal is confirmed through a Confirm Remove Coach Dialog and the result is communicated to the user.

**User Story:**  
As a coach, I want to remove a registered coach from the session so that the session is again available for registration.

**Preconditions:**  
- User is logged in to Coach Page using PIN code or password
- at least one session card with registered coach are available

**Operation Flow:**  
1. User clicks "Remove" button on a Session card
2. Confirmation dialog appears
3. User clicks "Confirm" → removal of registration sent to backend, result shown
4. User clicks "Cancel" → dialog closes, cancellation toast shown

**Dialog/Page Content:**
- The ConfirmCoachRegistrationDialog displays:
    - Confirmation text: "Remove a coach from this session?"
    - Notification text: "Trainees may have registered to the session. Make sure they are informed about the cancellation via proper channels as soon as possible or that a new coach is registered for the session."
    - Session information 
        - session type
        - date
        - time
    - Coach name or identifier
    - Buttons: Confirm, Cancel

**Data Handling:**
1. GAS function locks the script or returns with error code 'concurrent_operation'
2. GAS function first checks that there is a registered coach for the session from `coach_registration` sheet
    - Identifying of the row is made by matching the coach first and lastname, date and session_type. The realized column value must be true
    - if matching row is not found then return with error code `registration_not_found`
    - if matching row is found but the realized column value is false then return with error code `session_available`
3. Gas function updates the row
    - realized
        - boolean, value set to false
    - updated_at
        - current date and time in ISO 8601 format
4. Returns id of the updated row or an error if operation fails
5. Finally release the script lock

**User Feedback:**
Messages shown to the user:
- Toast message: "Registration removal ongoing. Please wait." when registration removal operation starts
- Success: "Registration removed successfully!"
- Error: "Registration removal failed. Please try again."
- concurrent_request error: "Concurrent operation ongoing. Refresh page before trying again."
- session_available error: "Session already without registered coach. Refresh page."
- registration_not_found error: "Registration not found. Refresh page."
- Cancel: "Registration removal cancelled."
- When registration removal has been succesful the Session Card's
    - background color changes to orange
    - button changes to "Register" button
    - Coach name is removed from the Session Card
- If session_type of the removed registration was 'free/sparring' then the Session card's button is disabled

**Test Cases:**  
- Coach can successfully remove registration for only one session at the time
- Coach can remove registertration from another session after cancelling before confirmation
- Coach sees notifications about the progress of the operation as well as Session Card changes when succesfully removed registration from a session
- Coach receives error message if removal of registration fails 
- Coach can cancel removal of registration before confirmation and sees cancellation notification
- Concurrent operation ongoing

**Acceptance Criteria:**  
- Clicking "Remove" on a session card opens a confirmation dialog
- Registration data must be validated before sending
- Confirming registration removal sends data to backend (GAS API) and updates `coach_registrations` sheet  
- User receives a success or failure message after registration removal attempt  
- Cancelling registration removal closes the dialog and shows a cancellation toast
- There is no limitations to how many sessions the user can remove registration but only one registration removal at a time
- There is no limitations to how many session registration removals the user can cancel before confirmation
- Concurrent operations not allowed

**Linked Files/Branches:**  
- [CoachPage.tsx](web/src/pages/Coach/CoachPage.tsx)
- [SessionCard.tsx](web/src/features/coach/components/SessionCard.tsx)
- [ConfirmRemoveCoachDialog.tsx](web/src/features/coach/components/ConfirmRemoveCoachDialog.tsx)
- [coach_registrations sheet schema](skills/SKILL.sheet-schema.md)  
- GAS API implementation ([Code.gs](gas/Code.gs))
- [SKILL.wire-react-to-gas.md](skills/SKILL.wire-react-to-gas.md)
