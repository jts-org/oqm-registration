**Title:**
OQM-0020 Verify Trainee PIN Code - part 2

**Description:**
Connect PIN verification flow to the trainee UI so a trainee can log in from TraineePage

**User Story:**
As a trainee, I want to log in using my personal PIN code so that I can register for a training session more easily.

**Scope:**
- Create new TraineeLoginDialog
- integrate Verify button behaviour on TraineeLoginDialog
- Open and submit TraineeLoginDialog using trainee API.
- Integrate Login button behavior on TraineePage.
- Handle success and known backend errors.
- Unexpected backend or network errors show a generic error message, keep the dialog open, and do not change trainee login state.
- Update trainee login state and button states after successful PIN verification and on logout.

**TraineeLoginDialog Content:**
- See CoachLoginDialog as a reference for dialog outlook
- Dialog title: "Trainee login"
- Pin query TextField
- Verify and Cancel buttons

**Preconditions:**
- User is on TraineePage
- TraineeLoginDialog component is available
- API function verifyTraineePin is available

**Main Flow (Verify PIN):**
1. User clicks Button label: 'Login' on TraineePage.
2. TraineeLoginDialog opens.
3. User fills dialog field and clicks Button label: "Verify".
    - Verify button is enabled after four digits are entered into the field.
    - Verify button is disabled when user deletes digits from field and the PIN length is less than four.
4. UI sends verification data via verifyTraineePin.
5. While request is running, show toast: "PIN verification ongoing. Please wait.", loading spinner and block repeated actions.
6. On success:
    - show success message: "PIN verified successfully."
    - close TraineeLoginDialog
    - set trainee state on TraineePage with data returned from backend
        - Backend fields firstname and lastname are mapped into the existing trainee page state used for logged-in display and session registration.
    - show alert: "Logged in: {{first_name}} {{last_name}}."
    - disable Button label: 'Register PIN'
    - disable Button label: 'Login'
    - enable Button label: 'Logout'

**Alternative Flows:**
1. Cancel verification:
    - User clicks Button label: 'Cancel'.
    - Show toast: "Verification cancelled."
    - TraineeLoginDialog closes.
    - TraineePage state remains unchanged.
2. Backend returns no_match_found:
    - show: "Invalid PIN. Try again."
    - keep dialog open for retry.

**Logout Flow:**
1. If user is logged in and clicks Button label: 'Logout' on TraineePage:
    - clear trainee data from state
    - enable Button label: 'Login'
    - disable Button label: 'Logout'
    - enable Button label: 'Register PIN'
    - show alert: "You are not logged in."
    - refresh TraineePage content by calling getTraineeSessions API function

**User Feedback Messages:**
- Progress: "PIN verification ongoing. Please wait."
- Success: "PIN verified succesfully."
- Error (no_match_found): "Invalid PIN. Try again."
- Alert success: "Logged in: {{first_name}} {{last_name}}."
- Alert warning: "You are not logged in."

**Test Cases:**
- Open login dialog from TraineePage.
- Verify button validation for invalid and valid PIN input.
- Successful PIN verification updates page state and button states.
- no_match_found shows retryable error.
- Cancel leaves page state unchanged.
- Logout restores logged-out state.
- Loading overlay appears during verification.
- Localized strings exist in both locale files.
- Existing trainee page and trainee API tests still pass.

**Acceptance Criteria:**
- TraineePage opens TraineeLoginDialog from Login.
- Only a valid 4 to 6 digit numeric PIN can be submitted; invalid input keeps Verify disabled.
- TraineeLoginDialog verifies a 4 to 6 digit PIN through verifyTraineePin.
- Pending verification shows loading state and blocks repeated actions.
- Successful verification closes the dialog, stores trainee login state, updates the logged-in alert, disables Login and Register PIN, and enables Logout.
- no_match_found keeps the dialog open and shows an invalid PIN error.
- Cancel closes the dialog without side effects.
- Logout clears trainee state and restores the default button states.
- All new texts are localized in English and Finnish.
- Automated tests cover dialog behavior, TraineePage state transitions, and API integration boundaries.

**Linked Files/Branches:**
- [TraineePage.tsx](web/src/pages/Trainee/TraineePage.tsx)
- [CoachLoginDialog.tsx](web/src/features/coach/components/CoachLoginDialog.tsx)
- [HomePage.tsx](web/src/pages/Home/HomePage.tsx)
- [trainee.api.ts](web/src/features/trainee/api/trainee.api.ts)

**References:**
- [SKILL.wire-react-to-gas.md](skills/SKILL.wire-react-to-gas.md)
