**Title:**
OQM-0019 Register Trainee PIN Code - part 2

**Description:**
Connect trainee PIN registration flow to the trainee UI so a trainee can register and become logged in from TraineePage.

**User Story:**
As a trainee, I want to register my personal PIN code so that I can log in and register for training sessions more easily.

**Scope:**
- Integrate Register PIN button behavior on TraineePage.
- Open and submit RegisterPinDialog using trainee registration API.
- Handle success and known backend errors.
- Update trainee login state and button states after successful registration and on logout.

**Preconditions:**
- User is on TraineePage.
- RegisterPinDialog component is available.
- API function registerTraineePin is available from trainee API feature.

**Main Flow (Register PIN):**
1. User clicks Button label: 'Register PIN'.
2. RegisterPinDialog opens.
3. If pendingTraineeData exists, map values to dialog initial props:
    - pendingTraineeData.first_name -> initialFirstName
    - pendingTraineeData.last_name -> initialLastName
    - pendingTraineeData.underage_age -> initialAge
    - initialIsUnderage is:
      - false when pendingTraineeData.underage_age is missing
      - true when pendingTraineeData.underage_age exists
4. showAlias is always false when opening from TraineePage.
5. User fills dialog fields and clicks Button label: 'Register'.
6. UI sends registration data via registerTraineePin.
7. While request is running, show toast: "Registration ongoing. Please wait.", loading spinner and block repeated actions.
8. On success:
    - show success message: "PIN code registered successfully"
    - close RegisterPinDialog
    - set trainee state on TraineePage with dialog data
    - show alert: "Logged in: {{first_name}} {{last_name}}."
    - disable Button label: 'Register PIN'
    - disable Button label: 'Login'
    - enable Button label: 'Logout'

**Alternative Flows:**
1. Cancel registration:
    - User clicks Button label: 'Cancel'.
    - RegisterPinDialog closes.
    - TraineePage state remains unchanged.
2. Backend returns concurrent_request:
    - show: "Concurrent operation ongoing. Please try again."
    - keep dialog open for retry.
3. Backend returns pin_reserved:
    - show: "PIN code reserved. Choose different PIN code."
    - keep dialog open for correction.
4. Backend returns name_already_exists:
    - show: "Trainee with the same name already exists. Try adding your second first name initial into your first name, for example: 'John J.', and try again."
    - keep dialog open for correction.

**Logout Flow:**
1. If user is logged in and clicks Button label: 'Logout' on TraineePage:
    - clear trainee data from state
    - enable Button label: 'Login'
    - disable Button label: 'Logout'
    - enable Button label: 'Register PIN'
    - show alert: "You are not logged in."

**User Feedback Messages:**
- Progress: "Registration ongoing. Please wait."
- Success: "PIN code registered successfully"
- Error (concurrent_request): "Concurrent operation ongoing. Please try again."
- Error (pin_reserved): "PIN code reserved. Choose different PIN code."
- Error (name_already_exists): "Trainee with the same name already exists. Try adding your second first name initial into your first name, for example: 'John J.', and try again."
- Alert success: "Logged in: {{first_name}} {{last_name}}."
- Alert warning: "You are not logged in."

**Test Cases:**
- Component: clicking Register PIN opens RegisterPinDialog.
- Component: pendingTraineeData is mapped to initial dialog props correctly.
- Component: showAlias is always false when dialog is opened from TraineePage.
- Component: clicking Cancel closes dialog and does not mutate TraineePage trainee state.
- Component/API: clicking Register triggers registerTraineePin with expected payload.
- Component: progress toast is shown while registration request is pending.
- Component: loading spinner is shown while registration request is pending.
- Component: success response closes dialog, updates trainee state, and updates button enabled/disabled states.
- Component: concurrent_request shows correct message and keeps dialog open.
- Component: pin_reserved shows correct message and keeps dialog open.
- Component: name_already_exists shows correct message and keeps dialog open.
- Component: clicking Logout clears trainee state and resets button states.

**Acceptance Criteria:**
- Register PIN flow is available from TraineePage through RegisterPinDialog.
- pendingTraineeData prefill behavior works exactly as defined in this issue.
- registerTraineePin is called on register submit and known backend errors are handled with correct user-facing messages.
- Successful registration logs trainee in at UI state level and updates button states as defined.
- Cancel does not change trainee state.
- Logout clears trainee state and restores pre-login button states.
- Automated tests cover main flow, cancel flow, success flow, and known backend error flows.

**Linked Files/Branches:**
- [TraineePage.tsx](web/src/pages/Trainee/TraineePage.tsx)
- [RegisterPinDialog.tsx](web/src/shared/components/RegisterPinDialog/RegisterPinDialog.tsx)
- [trainee.api.ts](web/src/features/trainee/api/trainee.api.ts)

**References:**
- [SKILL.wire-react-to-gas.md](skills/SKILL.wire-react-to-gas.md)
