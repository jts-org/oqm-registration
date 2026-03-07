/**
 * @copyright 2026 Jouni Sipola by OQM
 * @description Coach page — shown after the coach successfully authenticates via PIN.
 *   Receives and holds the verified coach's data for the duration of the session.
 *   State is cleared when the user navigates away (component unmounts).
 *   @see skills/SKILL.wire-react-to-gas.md
 */
import React from 'react';
import { useTranslation } from 'react-i18next';
import type { CoachData } from '../../features/coach/types';
import styles from './CoachPage.module.css';

export interface CoachPageProps {
  /** Navigates back to the main view. */
  onBack: () => void;
  /** Verified coach data returned from the backend on successful PIN login. */
  coachData?: CoachData;
}

/** Full-page coach view with a back button. Displays the logged-in coach's name. */
export function CoachPage({ onBack, coachData }: CoachPageProps) {
  const { t } = useTranslation();

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>{t('coachRegistration.title')}</h1>
      {coachData && (
        <p className={styles.coachName}>{coachData.firstname} {coachData.lastname}</p>
      )}
      <div className={styles.footer}>
        <button onClick={onBack}>{t('coachRegistration.backToMain')}</button>
      </div>
    </div>
  );
}
