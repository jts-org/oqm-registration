/**
 * @copyright 2026 Jouni Sipola by OQM
 * @description Trainee registration page — dummy implementation.
 *   Shown after the user selects the Trainees flow from the main view.
 */
import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './TraineePage.module.css';

export interface TraineePageProps {
  /** Navigates back to the main view. */
  onBack: () => void;
}

/** Full-page dummy trainee registration view with a back button. */
export function TraineePage({ onBack }: TraineePageProps) {
  const { t } = useTranslation();

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>{t('traineeRegistration.title')}</h1>
      <div className={styles.footer}>
        <button onClick={onBack}>{t('traineeRegistration.backToMain')}</button>
      </div>
    </div>
  );
}
