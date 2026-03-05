/**
 * @copyright 2026 Jouni Sipola by OQM
 * @description TypeScript interfaces for the coach feature.
 */

/** Props for the CoachLoginDialog component. */
export interface CoachLoginDialogProps {
  /** Whether the dialog is visible. */
  open: boolean;
  /** The coach password from settings (coach_pwd). */
  coachPassword: string;
  /** Called when login succeeds (via PIN or password). */
  onLoginSuccess: () => void;
  /** Called when the user clicks Cancel. */
  onCancel: () => void;
}
