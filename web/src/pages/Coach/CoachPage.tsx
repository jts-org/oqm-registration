/**
 * @copyright 2026 Jouni Sipola by OQM
 * @description Coach registration page — dummy implementation.
 *   Shown after the coach successfully authenticates.
 */
import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './CoachPage.module.css';

export interface CoachPageProps {
  /** Navigates back to the main view. */
  onBack: () => void;
}

/** Full-page dummy coach registration view with a back button. */
export function CoachPage({ onBack }: CoachPageProps) {
  const { t } = useTranslation();

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>{t('coachRegistration.title')}</h1>
      <div className={styles.footer}>
        <button onClick={onBack}>{t('coachRegistration.backToMain')}</button>
      </div>
    </div>
  );
}
