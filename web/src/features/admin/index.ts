/**
 * @copyright 2026 Jouni Sipola by OQM
 * @description Public exports for the admin feature.
 */
export { AdminLoginDialog } from './components/AdminLoginDialog';
export { AdminBatchFeedPanel } from './components/AdminBatchFeedPanel';
export { AdminSessionsSchedulePanel } from './components/AdminSessionsSchedulePanel';
export { AdminAccountListPanel } from './components/AdminAccountListPanel';
export {
  adminLogin,
  registerTraineeBatchForSessions,
  listSessionsSchedule,
  addSessionSchedule,
  updateSessionSchedule,
  deleteSessionSchedule,
  listCoachAccounts,
  listTraineeAccounts,
  createCoachAccount,
  createTraineeAccount,
  updateCoachAccount,
  updateTraineeAccount,
  deleteCoachAccount,
  deleteTraineeAccount,
} from './api/admin.api';
export type {
  AdminLoginDialogProps,
  BatchSessionType,
  BatchTraineeRegistrationRequest,
  BatchTraineeRegistrationResponse,
  BatchTraineeRegistrationResult,
  BatchTraineeRegistrationRow,
  SessionScheduleRecord,
  SessionSchedulePayload,
  ListSessionsScheduleResponse,
  CoachAccountRecord,
  TraineeAccountRecord,
  ListCoachAccountsResponse,
  ListTraineeAccountsResponse,
  CreateCoachAccountPayload,
  CreateTraineeAccountPayload,
  UpdateCoachAccountPayload,
  UpdateTraineeAccountPayload,
  CoachAccountWriteResponse,
  TraineeAccountWriteResponse,
  DeleteAccountResponse,
} from './types';
