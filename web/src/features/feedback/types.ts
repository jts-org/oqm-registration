/**
 * @copyright 2026 Jouni Sipola by OQM. All rights reserved.
 * Permission granted for personal/internal use only. Commercial
 * use prohibited except by copyright holder. See LICENSE for details.
 */

export type FeedbackType = 'feedback' | 'bug_report' | 'support_request';

export interface SendFeedbackPayload {
  type: FeedbackType;
  from: string;
  message: string;
}
