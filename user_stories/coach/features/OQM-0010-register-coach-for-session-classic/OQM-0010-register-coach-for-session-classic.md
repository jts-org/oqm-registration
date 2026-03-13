**Title:**
Register Coach For a Session Using Classic Method

**Description:**  
Enable a coach logged-in using password to register for an available session via Coach Page. Registration is confirmed through a dialog and the result is communicated to the user.

**User Story:**  
As a coach, I want to register for a session when I have logged-in using password, so that my participation is recorded and confirmed.

**Preconditions:**  
- User is logged in to Coach Page using password
- At least one Session card with no registered coach are available

**Operation Flow:**  
1. User clicks "Register" button on a Session card
2. Manual Coach Registration Dialog opens
    - User fills required information and clicks "Ok" → Confirm Coach Registration Dialog opens with coach and session info
    - User clicks "Cancel" → dialog closes
    - If user clicks "Register PIN code" link
        - Register Pin Dialog opens
        - if user has filled first name and last name fields, these transfer to dialog's fields
        - If PIN code registration operation was succesfull
            - Manual Coach Registration Dialog closes
            - Confirm Coach Registration Dialog open with coach and session info
3. In Confirm Coach Registration Dialog
    - User clicks "Confirm" → registration data sent to backend, result shown
    - User clicks "Cancel" → dialog closes, cancellation toast shown

**Dialog/Page Content:**
- Manual Coach Registration Dialog
    - Title text: "Fill your information"
    - Mui component: Stack
        - MUI component: TextField
            - id: "outlined-helpertext"
            - label: "First name:"
            - defaultValue: "Your first name"
            - required
        - MUI component: TextField
            - id: "outlined-helpertext"
            - label: "Last name:"
            - defaultValue: "Your last name"
            - required
    - MUI component: Box
        - Hint text: "With personal PIN code, you speed up and simplify your registration."
        - MUI component: Link
            - component="button"
            - variant="body2"
            - Text: "Register PIN code"
    - MUI component: Box
        - MUI component: ButtonGroup
          - Button: "Confirm"
          - Button: "Cancel"
    - use theme where possible

**Data Handling:**
- See [SKILL.wire-react-to-gas.md](skills/SKILL.wire-react-to-gas.md) for
    - PIN code registration data handling as described in `registerCoachPin (OQM-0003)` and `verifyCoachPin (OQM-0004)`
    - Registration Coach For Session data handling as described in `registerCoachForSession (OQM-0008)`

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
- also other appropriate messages inherited from features mentioned in `** Data Handling**` section that are missing here

**Test Cases:**  
- "OK" button of Manual Coach Registration Dialog is disabled as long as all required fields are filled
- User clicks "Cancel" button of Manual Coach Registration Dialog at any point before clicking "OK" button
    - dialog fields are cleared
    - dialog closes
    - coach is not registered to a session
    - cancellation notification is shown to the user
- User fills first and last name fields of Manual Coach Registration Dialog and clicks the link
    - first and last names are transfered to opened Register Pin Dialog
- User doesn not fill any fields of Manual Coach Registration Dialog and clicks the link
    - Register Pin Dialog opened with empty fields
- User clicks "Register" button of Register Pin Dialog
    - Coach PIN code registration data sent to backend and the result is shown
    - When PIN code is successfully registered: Register Pin Dialog and Manual Coach Registration Dialog closes and Confirm Coach Registration Dialog opens with coach and session info
- [Define how the feature/bug will be tested.]

**Acceptance Criteria:**  
- Coach can register for a session via the Coach Page when logged in with a password.
- "Register" button is visible only for sessions without a registered coach.
- Manual Coach Registration Dialog opens when "Register" is clicked.
- "OK" button in the dialog is disabled until all required fields are filled.
- "Cancel" button closes the dialog, clears fields, and shows a cancellation notification.
- "Register PIN code" link opens Register Pin Dialog; filled name fields transfer to the dialog.
- Successful PIN registration closes Manual Coach Registration Dialog and opens Confirm Coach Registration Dialog.
- Confirm Coach Registration Dialog displays correct coach and session info.
- "Confirm" button sends registration to backend; user sees "Registration ongoing" toast.
- On success, user sees "Registration successful" toast, Session Card updates (green background, "Remove" button, coach name shown).
- On error, user sees appropriate error toast ("Registration failed", "Session already has a registered coach", "Unknown coach").
- "Cancel" in Confirm dialog closes dialog and shows cancellation toast.
- Data handling follows backend contract in [SKILL.wire-react-to-gas.md](skills/SKILL.wire-react-to-gas.md).

**Linked Files/Branches:**  
- [CoachPage.tsx](web/src/pages/Coach/CoachPage.tsx)
- [ConfirmCoachRegistrationDialog.tsx](web/src/features/coach/components/ConfirmCoachRegistrationDialog.tsx)
- [RegisterPinDialog.tsx](web/src/shared/components/RegisterPinDialog/RegisterPinDialog.tsx)
- [SessionCard.tsx](web/src/features/coach/components/SessionCard.tsx)
- [coach_registrations sheet schema](skills/SKILL.sheet-schema.md)  
- GAS API implementation ([Code.gs](gas/Code.gs))
- [SKILL.wire-react-to-gas.md](skills/SKILL.wire-react-to-gas.md)

**Additional Context:**  
- Refactor GAS functions `registerCoachPin_(payload)` and `registerCoachForSession_(payload)` to handle concurrency.
