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

## Validation Rules
- Event, event alias, instructor name, start date, and end date are required.
- End date must be same as or after start date.
- At least one schedule row is required.
- Every schedule row requires all fields.
- Schedule row date must be within event date range.
- Schedule row end time must be same as or after start time.

## Error and Recovery
- Concurrent operation ongoing. Please try again.
  - Wait and submit again.
- Session expired. Please log in again.
  - Return to main view, log in again, and retry.
- Submission failed.
  - Verify data, then submit again.
