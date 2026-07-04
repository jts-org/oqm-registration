/**
 * @copyright 2026 Jouni Sipola by OQM
 * @description Public exports for the admin feature.
 */
export { AdminLoginDialog } from './components/AdminLoginDialog';
export { AdminBatchFeedPanel } from './components/AdminBatchFeedPanel';
export { AdminSessionsSchedulePanel } from './components/AdminSessionsSchedulePanel';
export {
  adminLogin,
  registerTraineeBatchForSessions,
  listSessionsSchedule,
  addSessionSchedule,
  updateSessionSchedule,
  deleteSessionSchedule,
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
} from './types';
