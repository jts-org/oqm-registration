/**
 * @copyright 2026 Jouni Sipola by OQM
 * @description TypeScript interfaces for the admin feature.
 */

/** Props for the AdminLoginDialog component. */
export interface AdminLoginDialogProps {
  /** Whether the dialog is visible. */
  open: boolean;
  /** Called when login succeeds. */
  onLoginSuccess: (sessionToken: string) => void;
  /** Called when the user clicks Cancel. */
  onCancel: () => void;
}
