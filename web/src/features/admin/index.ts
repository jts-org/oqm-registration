/**
 * @copyright 2026 Jouni Sipola by OQM
 * @description Public exports for the admin feature.
 */
export { AdminLoginDialog } from './components/AdminLoginDialog';
export { AdminBatchFeedPanel } from './components/AdminBatchFeedPanel';
export { adminLogin, registerTraineeBatchForSessions } from './api/admin.api';
export type {
	AdminLoginDialogProps,
	BatchSessionType,
	BatchTraineeRegistrationRequest,
	BatchTraineeRegistrationResponse,
	BatchTraineeRegistrationResult,
	BatchTraineeRegistrationRow,
} from './types';
