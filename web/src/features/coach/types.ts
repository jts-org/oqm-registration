/**
 * @copyright 2026 Jouni Sipola by OQM
 * @description TypeScript interfaces for the coach feature.
 */

/** Coach data returned from the GAS backend on successful PIN verification. */
export interface CoachData {
  id: string;
  firstname: string;
  lastname: string;
  alias: string;
  pin: string;
  created_at: string;
  last_activity: string;
}

/** Props for the CoachLoginDialog component. */
export interface CoachLoginDialogProps {
  /** Whether the dialog is visible. */
  open: boolean;
  /** The coach password from settings (coach_pwd). */
  coachPassword: string;
  /** Called when login succeeds. PIN login passes CoachData; password login passes undefined. */
  onLoginSuccess: (coachData?: CoachData) => void;
  /** Called when the user clicks Cancel. */
  onCancel: () => void;
}
