/**
 * @copyright 2026 Jouni Sipola by OQM
 * @description Administrator page — dummy implementation.
 *   Shown after the admin successfully authenticates.
 */
import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './AdminPage.module.css';

export interface AdminPageProps {
  /** Navigates back to the main view. */
  onBack: () => void;
}

/** Full-page dummy admin view with a back button. */
export function AdminPage({ onBack }: AdminPageProps) {
  const { t } = useTranslation();

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>{t('adminView.title')}</h1>
      <div className={styles.footer}>
        <button onClick={onBack}>{t('adminView.backToMain')}</button>
      </div>
    </div>
  );
}
