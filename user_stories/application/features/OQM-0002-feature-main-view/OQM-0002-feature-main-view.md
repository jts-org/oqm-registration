# Feature: Main View
Main view is shown after application startup
- Main view is full page view
- user should see three (3) buttons in a row to select if the user wants to register him/herself as a trainee or coach into a training session or as an admin
- Button labels: 'Trainees', 'Coaches', 'Admin' (use translation keys)

## Main view structure

|      placeholder message     |
--------------------------------
| 'Trainees' 'Coaches' 'Admin' |
|                              |

## 'Trainees' button
when user clicks 'Trainees' button a Trainee registration view opens

### Trainee Registration view
- Full-page view
- Title: 'Trainee registration' (use translation key)
- at this point only a dummy implementation but a button to return to main view should be provided
- Button label: 'Back to Main' (use translation key)

### Trainee registration view structure
|    'Trainee registration'    |
--------------------------------
|                              |
|                              |
|         'Back to main'       |

## 'Coaches' button
when user clicks 'Coaches' button a modal coach password/pin enquiry dialog is shown

### Coach password/PIN enquiry dialog  
- modal
- Title: 'Coach login' (use translation key)
- Button labels: 'Verify', 'Login', 'Cancel' (use translation key)
- Input field titles: 'Enter PIN code', 'Enter password' (use translation key)
- Link text: 'Register new PIN code' (use translation key)
- Enter PIN code input field and verify button:
    * 'Verify' button is located on the same row as the 'Enter PIN code' input field.
    * a valid PIN code should be 4-6 characters long and can contain only numbers.
    * 'Verify' button should be active only when at least four numbers have been provided by the user
    * verify PIN code against registered PIN code from backend and actual login will be implemented later.
    * For now when any valid (at least four number) PIN code is provided and 'Verify' button is clicked by the user, a Coach Registration View is shown
- Register new PIN code link
    * the link should be visible under 'Enter PIN code' input field
    * when user clicks the link a modal Register new pin code dialog is shown.
- Enter password input field:
    * 'Login' button should be visible on the same row as the 'Enter password' input field and should be active only when at least one character has been provided by the user
    * When user provides a password it is compared to settings data's 'coach_pwd' parameter value
        * if passwords match a Coach Registration view is opened
        * if passwords do not match then a modal popup alert for failed login
        * when user closes the modal popup alert the Coach password/PIN enquiry dialog stays open for another try until 'Cancel' button is clicked

#### Coach password/PIN enquiry dialog structure
|      'Coach login'     |
--------------------------------
|                              |
| 'Enter PIN code'    'Verify' |
| 'Register new PIN code'      |
|                              |
| 'Enter password'  'Login'    |
|                              |
|         'Cancel'             |


#### Register new PIN code dialog
- Modal dialog
- Title: 'Register new PIN code' (use translation key)
- Input field titles: 'Enter new PIN code', 'Enter PIN again' (use translation key)
- Button labels: 'Register', 'Cancel' (use translation key)
- a valid PIN code should be 4-6 characters long and can contain only numbers.
- 'Register' button should be active only when user has provided identical and valid PIN codes to both input fields
    * register PIN code to backend be implemented later.
    * when 'Register' button is clicked, the valid PIN code is transferred to Coach password/PIN enquiry dialog's 'Enter PIN code' field and this dialog is closed
- when 'Cancel' button is clicked the user returns to Coach password/PIN enquiry dialog
- This dialog should be implemented as reusable as possible since it will be used for registering a new PIN code for trainee later

##### Register new PIN code dialog structure
|   'Register new PIN code'    |
--------------------------------
|                              |
|     'Enter new PIN code'     |
|                              |
|      'Enter PIN again'       |
|                              |
|   'Register'  'Cancel'       |

### Coach registration view
- Full-page view
- Title: 'Coach registration' (use translation key)
- at this point only a dummy implementation but a button to return to main view should be provided
- Button label: 'Back to Main' (use translation key)

#### Coach registration view structure
|    'Coach registration'    |
--------------------------------
|                              |
|                              |
|         'Back to main'       |

## 'Admin' button
- when user clicks 'Admin' button a modal admin password enquiry dialog is shown

### Admin password dialog
- a modal dialog
- Title: 'Admin login' (use translation key)
- Input field titles: 'Enter password' (use translation key)
- Button labels: 'Login', 'Cancel' (use translation key)
- Failed login message: 'Incorrect password. Try again' (use translation key)
- When user provides a password it is compared to settings data's 'admin_pwd' parameter value
    * if passwords match a Admin view is opened
    * if passwords do not match then a modal popup alert for failed login
    * after failed login attempt the dialog stays open for another try

#### Admin password enquiry dialog structure
|      'Admin login'     |
--------------------------------
|                              |
|     'Enter password'         |
|                              |
|    'Login'    'Cancel'       |


### Admin view
- Full-page view
- Title: 'Administrator' (use translation key)
- at this point only a dummy implementation but a button to return to main view should be provided
- Button label: 'Back to Main' (use translation key)

#### Admin view structure
|    'Administrator'    |
--------------------------------
|                              |
|                              |
|         'Back to main'       |

Acceptance Criteria:
- Dialogs and views with specified components are shown to the user when buttons are clicked
- Dialogs should be modal and block interaction with the main view until closed.
- User can return to previous view or dialog by closing the component
- All user-facing text should support localization (English/Finnish).
- All interactive elements should be accessible via keyboard and screen reader
- Errors are handled gracefully and surfaced to the user
- Network or unexpected errors should be shown as toast notifications.

References:
- See copilot-instructions.md and frontend.instructions.md
