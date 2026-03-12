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

/**
 * A single session instance returned from the GAS backend for the 21-day window.
 * Used by CoachQuickRegistrationPage to build session cards.
 * @see skills/SKILL.wire-react-to-gas.md
 */
export interface SessionItem {
  /** Unique identifier: schedule_id + date */
  id: string;
  /** English session type name */
  session_type: string;
  /** Localized session type name (Finnish or other) */
  session_type_alias: string;
  /** Date in 'YYYY-MM-DD' format */
  date: string;
  /** Start time in 'HH:MM' format */
  start_time: string;
  /** End time in 'HH:MM' format */
  end_time: string;
  /** Training location */
  location: string;
  /** Assigned coach first name, empty if none */
  coach_firstname: string;
  /** Assigned coach last name, empty if none */
  coach_lastname: string;
  /** Assigned coach alias from coach_login, empty if none */
  coach_alias: string;
  /** ID of the coach_registrations row if a coach is registered, empty if none */
  registration_id: string;
  /** True if this is a free/sparring session (has custom start/end times) */
  is_free_sparring: boolean;
}

/**
 * Payload for registering a coach for a specific session.
 * @see skills/SKILL.wire-react-to-gas.md
 */
export interface RegisterCoachForSessionPayload {
  firstname: string;
  lastname: string;
  session_type: string;
  /** Date in 'YYYY-MM-DD' format */
  date: string;
  /** Start time 'HH:MM' — only for free/sparring sessions */
  start_time?: string;
  /** End time 'HH:MM' — only for free/sparring sessions */
  end_time?: string;
}

/**
 * Payload for removing a coach from a specific session (OQM-0009).
 * @see skills/SKILL.wire-react-to-gas.md
 */
export interface RemoveCoachFromSessionPayload {
  firstname: string;
  lastname: string;
  session_type: string;
  /** Date in 'YYYY-MM-DD' format */
  date: string;
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
