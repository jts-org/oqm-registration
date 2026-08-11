# Feature Request

## Summary
Add feedback functionality so those users that have registered PIN code can send feedback on usability and a bug report to the application support.

A new card `Feedback` is added on the Home page under `User manuals` card. When user clicks the card a PIN request dialog is shown to the user (similar to `TraineeLoginDialog.tsx`). If PIN code is verified succesfully a modal dialog for feedback is opened.

On the `Feedback dialog` the user selects if the message contains `Feedback` or `Bug report`. The dialog has above mentioned selections (MUI Radio buttons), `From` field that contains the name of the sender (fetched from GAS during PIN code verification and unmodifiable), `To` field that contains text 'OQM Support' (cannot be modified) and message field that holds maximum of 500 characters (enforced client and server side), `Cancel` button and `Send` button. Character counter should be also shown to the user.

If feedback is of type `Bug report`, the message field contains hint text: 'Describe in what section you were, what were you going to do, date and time when the problem occurred and what was the outcome. Be as accurate as you can'.

GAS sends an email notification to the support address 'webmaster@oulunkickboxing.fi' via `MailApp.sendEmail` as a secondary side-effect, stores the row into `Messages` sheet primarily and must succeed atomically before sending the email to support address.

## User Story
_As a user, I want to send feedback or bug report to OQM support so that the application can be improved or fixed._

## Acceptance Criteria

### Home page
- [ ] A `Feedback` RoleCard is visible on the Home page, placed below the `User manuals` card.
- [ ] Clicking the card opens a PIN verification dialog (reusing or mirroring `TraineeLoginDialog.tsx` behaviour).
- [ ] An invalid or unrecognised PIN shows an inline error and does not open the Feedback dialog.

### PIN verification
- [ ] The `verifyTraineePin` route is used; coach PINs fall back correctly (existing backend behaviour).
- [ ] The verified sender's full name is carried into the Feedback dialog and is not editable.

### Feedback dialog
- [ ] Two mutually-exclusive type options are offered via MUI Radio buttons: `Feedback` and `Bug report`.
- [ ] `From` field is pre-populated with the verified sender name and is read-only.
- [ ] `To` field displays `OQM Support` and is read-only.
- [ ] Message field accepts up to 500 characters; a character counter or hard limit is enforced.
- [ ] When `Bug report` is selected, the message field shows hint text: *"Describe in what section you were, what were you going to do, date and time when the problem occurred and what was the outcome. Be as accurate as you can"*.
- [ ] `Cancel` closes the dialog without submitting and dismisses it cleanly.
- [ ] `Send` is disabled while the network request is in flight.
- [ ] On success, the dialog closes and a success toast is shown.
- [ ] On failure, an error toast or inline alert is shown; the dialog stays open so the user can retry.

### Backend — `sendFeedback` route
- [ ] A new POST route `sendFeedback` is added to `Code.gs` with payload `{ type: "feedback"|"bug_report", from: string, message: string }`.
- [ ] The route validates `type`, `from` (non-empty), and `message` (1–500 characters), returning `{ ok: false, error: "validation_error" }` on failure.
- [ ] Accepted submissions are written atomically to the `Messages` sheet with columns: `id`, `timestamp`, `type`, `from`, `message`.
- [ ] After a successful atomic write, a notification email is sent to `webmaster@oulunkickboxing.fi` via `MailApp.sendEmail`; email failure does not roll back the stored row.
- [ ] The route does not require a `sessionToken` (no authenticated session needed beyond PIN verification for the sender name).
- [ ] Backend returns `{ ok: true }` on success.

### i18n
- [ ] All new UI labels (card title/description, dialog title, field labels, radio options, hint text, button labels, toast messages) have keys in both `en.json` and `fi.json`.

### Sheet schema
- [ ] A `Messages` sheet schema entry is added or documented in `.github/skills/sheet-schema/SKILL.md`.

### Tests
- [ ] Unit test for `sendFeedback` backend handler covering: happy path, validation_error (bad type, empty from, message too long), email sent after successful write.
- [ ] Frontend tests covering: card renders on HomePage, PIN dialog opens on click, Feedback dialog opens after successful PIN, Send calls API, Cancel closes dialog, character limit enforced.

### General
- [ ] No TypeScript or ESLint errors introduced.
- [ ] `learnings.md` updated if needed.

## Relevant Skills

- API Contract  
  @see .github/skills/wire-react-to-gas/SKILL.md

- Frontend Architecture  
  @see .github/skills/frontend-architecture/SKILL.md

- UX & Accessibility  
  @see .github/skills/frontend-ux-and-accessibility/SKILL.md

- Responsive Design  
  @see .github/skills/frontend-responsive-design/SKILL.md

- i18n  
  @see .github/skills/frontend-i18n/SKILL.md

- Backend Logic  
  @see .github/skills/gas-sheet-operations/SKILL.md  
  @see .github/skills/gas-validation-rules/SKILL.md  
  @see .github/skills/gas-date-and-time/SKILL.md  
  @see .github/skills/gas-id-generation/SKILL.md

- Continuous learning  
  @see .github/skills/continuous-learning/SKILL.md

## Additional Notes

- The PIN dialog should reuse or closely mirror `TraineeLoginDialog.tsx` to keep the UX consistent. Consider extracting a shared `PinVerificationDialog` if duplication becomes excessive.
- The `verifyTraineePin` backend function already falls back to `coach_login`, so coaches with a registered PIN can also send feedback without any backend changes.
- The `sendFeedback` route does **not** need a `sessionToken` — the sender's name comes from the PIN verification response, not from an admin/coach session. Ensure this is noted in `gas-route-registry`.
- Feedback is stored in the `Messages` sheet. Column order: `id`, `timestamp`, `type`, `from`, `message`.
- After the atomic row write, `MailApp.sendEmail` sends a notification to `webmaster@oulunkickboxing.fi`. Email failure is logged but must not roll back the sheet write.
- Character limit of 500 must be enforced both client-side (disable Send / show counter) and server-side (validation_error).
- All hint text and placeholder strings must be i18n keys — no hard-coded strings in components.
