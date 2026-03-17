/**
 * @copyright 2026 Jouni Sipola by OQM. All rights reserved.
 * Permission granted for personal/internal use only. Commercial
 * use prohibited except by copyright holder. See LICENSE for details.
 */

/**
 * @description TypeScript interfaces for the trainee feature (OQM-0014).
 *   @see skills/SKILL.wire-react-to-gas.md
 *   @see skills/SKILL.sheet-schema.md
 */

/**
 * Payload for registering a trainee for a specific session.
 * Maps to the registerTraineeForSession GAS backend route.
 * @see skills/SKILL.wire-react-to-gas.md
 */
export interface RegisterTraineeForSessionPayload {
  /** Trainee's first name (required). */
  first_name: string;
  /** Trainee's last name (required). */
  last_name: string;
  /** 'adult' or 'underage' (required). */
  age_group: 'adult' | 'underage';
  /** Trainee's age — required when age_group is 'underage'. */
  underage_age?: number;
  /** Session type the trainee is registering to (required). */
  session_type: string;
  /** ID from camp_schedules sheet, or omitted for non-camp sessions. */
  camp_session_id?: string;
  /** Date in 'YYYY-MM-DD' format (required). */
  date: string;
  /** Start time in 'HH:MM' format (required). */
  start_time: string;
  /** End time in 'HH:MM' format (required). */
  end_time: string;
}
