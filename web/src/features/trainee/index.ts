/**
 * @copyright 2026 Jouni Sipola by OQM. All rights reserved.
 * Permission granted for personal/internal use only. Commercial
 * use prohibited except by copyright holder. See LICENSE for details.
 */

/**
 * @description Public exports for the trainee feature (OQM-0014).
 */
export { registerTraineePin } from './api/trainee.api';
export { verifyTraineePin } from './api/trainee.api';
export { registerTraineeForSession } from './api/trainee.api';
export { getTraineeSessions } from './api/trainee.api';
export type {
	RegisterTraineePinData,
	RegisterTraineeForSessionPayload,
	TraineeData,
	TraineeSessionItem,
	PendingTraineeData,
} from './types';
