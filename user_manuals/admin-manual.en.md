# Admin User Manual (English)

## Purpose
This manual helps administrators use the Admin view and create customer events with schedule rows.

## Prerequisites
- You can open the application main view.
- You have a valid administrator password.

## Change UI Language
1. Go to the application main view (HomePage).
2. Use the language buttons above the title:
   - English
   - Suomi
3. Select your preferred language.

Expected result:
- UI text changes immediately.
- Language selection stays active for the current browser session.

## Open Admin View
1. Open the app main view.
2. Select Admin.
3. Enter password in the login dialog.
4. Select Login.

Expected result:
- Admin shell opens with dashboard cards and left drawer navigation.

## Open Events Section
You can open Events in two ways.

1. Dashboard card path:
- On Dashboard, find card Customer events and select Open.

2. Drawer path:
- Select Events from the left drawer.

Expected result:
- Events section opens.
- Customer events card is visible.

## Open Account Management Section
You can open Account management in two ways.

1. Dashboard card path:
- On Dashboard, find card User management and select Open.

2. Drawer path:
- Select Account management from the left drawer.

Expected result:
- Account management section opens.
- Separate tables for Coach accounts and Trainee accounts are visible.

## Create Customer Event and Schedule
1. In Events section, select Add on the Customer events card.
2. Fill Customer Event Info:
- Event
- Event alias
- Instructor name
- Start date
- End date
3. In Customer event schedule, fill at least one schedule row:
- Session name
- Session name alias
- Date
- Start time
- End time
4. Use Add session to add more rows.
5. Use row remove action to delete unnecessary rows.
6. Select Submit.

Expected result:
- Request is sent as one operation.
- Result summary is shown with:
  - Customer event created count
  - Total schedule rows
  - Added schedule rows
  - Rejected schedule rows
- If schedule rows are rejected, row-level reasons are shown.

## Manage Coach and Trainee Accounts
1. In Account management, select one of the create actions:
- Create coach account
- Create trainee account
2. Fill required fields and select Save.
3. To edit an existing account, select the row edit action, update fields, and select Save.
4. To delete an account, select the row delete action and confirm deletion.

Expected result:
- A success message is shown after create, update, or delete.
- Account tables refresh automatically after each successful operation.

## Validation Rules
- Event, event alias, instructor name, start date, and end date are required.
- End date must be same as or after start date.
- At least one schedule row is required.
- Every schedule row requires all fields.
- Schedule row date must be within event date range.
- Schedule row end time must be same as or after start time.

Account management:
- Coach create/update requires first name, last name, and PIN.
- Trainee create/update requires first name, last name, age, and PIN.
- PIN must be unique across both coach and trainee accounts.
- Delete and first/last-name updates are blocked when related registrations exist.

## Error and Recovery
- Concurrent operation ongoing. Please try again.
  - Wait and submit again.
- Session expired. Please log in again.
  - Return to main view, log in again, and retry.
- Submission failed.
  - Verify data, then submit again.
- PIN code reserved. Choose a different PIN code.
  - Enter a different PIN and submit again.
- Account was not found. Refresh and try again.
  - Select Refresh, then repeat the operation.
- This account cannot be changed because related registrations exist.
  - Keep first/last name unchanged or keep the account and do not delete it.
- Account operation failed. Please try again.
  - Retry once. If the issue continues, refresh and try again.
