**Title:**
Register coach for a free/sparring session

**Description:**  
Enable a logged-in coach to register for a free/sparring session via Coach Page. Registration and session data is collected and confirmed through dialogs and the result is communicated to the user.

**User Story:**  
As a coach, I want to register for a free/sparring session, so that my participation is recorded and confirmed. 

**Preconditions:**  
- User is logged in to a Coach Page

**Operation Flow:**  
1. User clicks "Free/sparring session" button
2. Sparring Coach Registration Dialog opens
    1. If user was logged in using PIN code → coach info prefilled
    2. Coach fills required info
    3. Coach clicks 
        - "Confirm" → Confirm Coach Registration Dialog opens with coach and session info
        - "Cancel" → dialog closes, cancellation toast is shown
    4. If Confirm Coach Registration Dialog is dismissed using "Cancel" button, the Sparring Coach Registration Dialog stays open for modifications. Otherwise also Sparring Coach Registration Dialog is dismissed.
3. Succesfully registered free/sparring session card is
    - shown with coach and session data if the session date is within the date span currently shown on Coach Page
    - not shown if the session date falls outside the dates currently shown on Coach Page.

**Dialog/Page Content:**
- Coach Page
    - Page refactoring:
      - add new button "Free/sparring session" on the left side of the "Refresh data" and "Back to Main" buttons within the same Box component
      - locate "Free/sparring session", "Refresh data" and "Back to Main" buttons inside ButtonGroup MUI component
- Sparring Coach Registration Dialog
    - Title text: "Fill free/sparring session information"
    - Mui component: Grid
        - container spacing={2}
        - MUI Component: Grid
            - size={{ xs: 6, md: 6 }}
            - MUI component: Item
                - MUI component: TextField
                    - id: "outlined-helpertext"
                    - label: "First name:"
                    - defaultValue: "Your first name"
                    - required
        - MUI Component: Grid
            - size={{ xs: 6, md: 6 }}
            - MUI component: Item
                - MUI component: TextField
                    - id: "outlined-helpertext"
                    - label: "Last name:"
                    - defaultValue: "Your last name"
                    - required
    - Mui component: Grid
        - container spacing={2}
        - MUI Component: Grid
            - size={{ xs: 6, md: 4 }}
            - MUI component: Item
                - MUI component: DateField
                    - label: "Date:"
                    - value: current date
                    - views={['day']}
                    - Locale fallback logic 'fi' → 'de' → 'en'
                    - required        
        - MUI Component: Grid
            - size={{ xs: 6, md: 4 }}
            - MUI component: Item
                - MUI component: TimePicker
                    - label: "Start time:"
                    - format="HH:mm"
                    - value: current time
                    - Locale fallback logic 'fi' → 'de' → 'en'
                    - required
        - MUI Component: Grid
            - size={{ xs: 6, md: 4 }}
            - MUI component: Item                    
              - MUI component: TimePicker
                  - label: "End time:"
                  - format="HH:mm"
                  - value: current time
                  - Locale fallback logic 'fi' → 'de' → 'en'
                  - required            
    - MUI component: Box
        - MUI component: ButtonGroup
          - Button: "Confirm"
          - Button: "Cancel"
    - use theme where possible

**GAS modifications instructions:**
- Refactor GAS function `registerCoachForSession_(payload)` to 
    - implement concurrent operation lock and release of the lock at the end of the operation.
    - in case of session_type is 'free/sparring session' check also for matching or overlapping start and end times
        - overlapping date and time check flow:
            1. find session_type from rows' of `coach_registration` sheet that have a matching date
            2. check `weekly_schedule` sheet for matching active session_type(s) and compare `start_time` and `end_time`values
                - sessions overlap when
                    - they have the same date and new session's start_time is
                        - after or same time as existing session's start_time and before as existing session's end_time OR
                        - end_time is after the existing session's start_time and before the existing session's end_time
                - if overlapping then return error `overlapping_session` with earlier registered session's date, start_time and end_time
- Create GAS function to update `last_activity` value in `coach_login` sheet for a coach
    - set current datetime in ISO-8601 format into coach's row's `last_activity` cell

**Data Handling:**
- See [SKILL.wire-react-to-gas.md](skills/SKILL.wire-react-to-gas.md) for `registerCoachForSession (OQM-0008)`

**User Feedback:**
Messages shown to the user:
- Toast message: "Registration ongoing. Please wait." when registration operation starts
- Spinner while backend operation ongoing.
- Success: "Registration successful!"
- Error: "Registration failed. Please try again."
- already_taken error: "Session already has a registered coach. Refresh page."
- unknown_coach error: "Unknown coach. Contact system administrator."
- overlapping_session error: "Overlapping session found on {date} {start_time} - {end_time}. Adjust your registration."
- concurrent_request error: "Concurrent operation ongoing. Refresh page before trying again."
- Cancel: "Registration cancelled."
- After succesful registration and 
    - the session date is within the date span currently shown on Coach Page, a new session card is shown for the user with coach and session information 
    - the new session falls outside the date span currently shown on Coach Page, then message "New session is registered and visible when within shown date span."
- "Confirm" button is disabled a long as required information is not provided
- also other appropriate messages inherited from features mentioned in `** Data Handling**` section that are missing here

**Test Cases:**  
- Successful Registration
    - Coach registers for a session with valid data; session card appears if within date span.
- Session Date Outside Span
    - Coach registers for a session outside current date span; receives correct message.
- Duplicate Registration
    - Attempt to register for overlapping session; receives "Session already has a registered coach" error.
- Unknown Coach
    - Attempt registration with invalid coach info; receives "Unknown coach" error.
- Cancel Registration
    - Coach cancels registration; receives "Registration cancelled" toast.
- Validation Errors
    - Submit with missing/invalid fields; receives validation error.
- Loading State
    - Spinner appears during registration operation.
- Accessibility
    - All dialogs/buttons are accessible via keyboard and screen reader.
- API Failure
    - Simulate network/API failure; receives "Registration failed. Please try again."
- Concurrent Registration
    - Two coaches attempt to register for overlapping sessions simultaneously; one receives "concurrent_request" error.    

**Acceptance Criteria:**  
Coach can register for a free/sparring session via Coach Page (implemented).
Registration dialog pre-fills coach info if logged in via PIN (implemented).
All required fields are validated; errors shown for invalid input (implemented).
Registration operation shows spinner/loading indicator (implemented).
Success, error, and cancellation messages are shown as specified (implemented).
Session card appears only if session date is within current date span (implemented).
Accessibility requirements are met (keyboard, ARIA, screen reader) (implemented).
API handles concurrent operations and overlapping sessions (implemented).
Locale fallback logic is implemented for date/time fields (implemented).
Locale fallback logic includes 'fi', 'de', and 'en' (implemented).


**Linked Files/Branches:**  
- [CoachPage.tsx](web/src/pages/Coach/CoachPage.tsx)
- [ConfirmCoachRegistrationDialog.tsx](web/src/features/coach/components/ConfirmCoachRegistrationDialog.tsx)
- [coach_registrations sheet schema](skills/SKILL.sheet-schema.md)  
- [coach_login sheet schema](skills/SKILL.sheet-schema.md)
- GAS API implementation ([Code.gs](gas/Code.gs))
- [SKILL.wire-react-to-gas.md](skills/SKILL.wire-react-to-gas.md)
