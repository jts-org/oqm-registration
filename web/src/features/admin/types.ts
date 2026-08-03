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

/** One schedule row for customer event creation. */
export interface CustomerEventScheduleRow {
  session_name: string;
  session_name_alias: string;
  date: string;
  start_time: string;
  end_time: string;
}

/** Request payload for creating customer event and schedules. */
export interface CustomerEventWithScheduleRequest {
  event: string;
  event_alias: string;
  instructor: string;
  start_date: string;
  end_date: string;
  schedules: CustomerEventScheduleRow[];
}

/** Row-level processing result for customer event schedule rows. */
export interface CustomerEventScheduleResult {
  rowIndex: number;
  status: 'added' | 'rejected';
  id?: string;
  reason?: string;
}

/** Summary response for customer event creation. */
export interface CustomerEventWithScheduleResponse {
  customerEventInsertedCount: number;
  totalScheduleRows: number;
  scheduleInsertedCount: number;
  scheduleRejectedCount: number;
  results: CustomerEventScheduleResult[];
}

// ─── Sessions Schedule (OQM-0042) ────────────────────────────────────────────

/** One row from the sessions_schedule sheet. */
export interface SessionScheduleRecord {
  id: string;
  session_type: string;
  session_type_alias: string;
  start_date: string;
  end_date: string;
  /** Comma-separated day numbers, e.g. "0,2,4". Mon=0 … Sun=6. */
  weekdays_available: string;
  start_time: string;
  end_time: string;
  location: string;
  location_alias: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

/** Payload for addSessionSchedule (id omitted) and updateSessionSchedule (id required). */
export interface SessionSchedulePayload {
  /** Required for updateSessionSchedule, omitted for addSessionSchedule. */
  id?: string;
  session_type: string;
  session_type_alias: string;
  start_date: string;
  end_date: string;
  weekdays_available: string;
  start_time: string;
  end_time: string;
  location: string;
  location_alias: string;
  active: boolean;
}

/** Response shape for listSessionsSchedule. */
export interface ListSessionsScheduleResponse {
  schedules: SessionScheduleRecord[];
}

/** One row from coach_login exposed in admin account list. */
export interface CoachAccountRecord {
  id: string;
  firstname: string;
  lastname: string;
  alias: string;
  pin: string;
  created_at: string;
  last_activity: string;
}

/** One row from trainee_login exposed in admin account list. */
export interface TraineeAccountRecord {
  id: string;
  firstname: string;
  lastname: string;
  age: string;
  pin: string;
  created_at: string;
  last_activity: string;
}

/** Response shape for listCoachAccounts. */
export interface ListCoachAccountsResponse {
  accounts: CoachAccountRecord[];
}

/** Response shape for listTraineeAccounts. */
export interface ListTraineeAccountsResponse {
  accounts: TraineeAccountRecord[];
}

/** Payload for createCoachAccount route. */
export interface CreateCoachAccountPayload {
  firstname: string;
  lastname: string;
  alias: string;
  pin: string;
}

/** Payload for updateCoachAccount route. */
export interface UpdateCoachAccountPayload extends CreateCoachAccountPayload {
  id: string;
}

/** Payload for createTraineeAccount route. */
export interface CreateTraineeAccountPayload {
  firstname: string;
  lastname: string;
  age: string;
  pin: string;
}

/** Payload for updateTraineeAccount route. */
export interface UpdateTraineeAccountPayload extends CreateTraineeAccountPayload {
  id: string;
}

/** Response shape for createCoachAccount and updateCoachAccount. */
export interface CoachAccountWriteResponse {
  account: CoachAccountRecord;
}

/** Response shape for createTraineeAccount and updateTraineeAccount. */
export interface TraineeAccountWriteResponse {
  account: TraineeAccountRecord;
}

/** Response shape for delete account routes. */
export interface DeleteAccountResponse {
  id: string;
}
