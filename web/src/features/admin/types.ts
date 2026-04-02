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

/** Session types supported by admin batch trainee feed. */
export type BatchSessionType = 'advanced' | 'basic' | 'fitness' | 'free/sparring' | 'camp';

/** One trainee registration row for admin batch submission. */
export interface BatchTraineeRegistrationRow {
  first_name: string;
  last_name: string;
  age_group: 'adult' | 'underage';
  underage_age?: string | number;
  session_type: BatchSessionType;
  camp_session_id?: string;
  dates: string[];
  start_time?: string;
  end_time?: string;
}

/** Batch request payload sent to GAS. */
export interface BatchTraineeRegistrationRequest {
  rows: BatchTraineeRegistrationRow[];
}

/** Row-level processing result for batch submission. */
export interface BatchTraineeRegistrationResult {
  rowIndex: number;
  status: 'added' | 'rejected';
  id?: string;
  reason?: string;
}

/** Batch submission summary returned by GAS. */
export interface BatchTraineeRegistrationResponse {
  totalRows: number;
  addedCount: number;
  rejectedCount: number;
  results: BatchTraineeRegistrationResult[];
}
