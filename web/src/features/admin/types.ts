/**
 * @copyright 2026 Jouni Sipola by OQM
 * @description TypeScript interfaces for the admin feature.
 */

/** Props for the AdminLoginDialog component. */
export interface AdminLoginDialogProps {
  /** Whether the dialog is visible. */
  open: boolean;
  /** The admin password from settings (admin_pwd). */
  adminPassword: string;
  /** Called when login succeeds. */
  onLoginSuccess: () => void;
  /** Called when the user clicks Cancel. */
  onCancel: () => void;
}
