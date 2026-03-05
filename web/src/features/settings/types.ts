/**
 * @copyright 2026 OQM Registration
 * @description TypeScript interfaces for the settings feature.
 *   Matches the `settings` sheet schema defined in SKILL.sheet-schema.md.
 */

/** A single row from the `settings` sheet. */
export interface Setting {
  id: string;
  parameter: string;
  value: string;
  created_at: string;
  updated_at: string;
  purpose: string;
}

/** Shape of the settings context value. */
export interface SettingsContextValue {
  settings: Setting[];
  loading: boolean;
  error: string | null;
  reload: () => void;
}
