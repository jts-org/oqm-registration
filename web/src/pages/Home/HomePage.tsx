/**
 * @copyright 2026 Jouni Sipola by OQM
 * @description Main view shown after application startup.
 *   Presents three entry-point buttons: Trainees, Coaches, Admin.
 *   Opens login dialogs for Coach and Admin flows.
 */
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CoachLoginDialog } from '../../features/coach/components/CoachLoginDialog';
import type { CoachData } from '../../features/coach/types';
import { AdminLoginDialog } from '../../features/admin/components/AdminLoginDialog';
import styles from './HomePage.module.css';

export interface HomePageProps {
  /** Navigates to the trainee registration page. */
  onGoTrainee: () => void;
  /** Navigates to the coach page after successful login, passing verified coach data. */
  onGoCoach: (coachData?: CoachData) => void;
  /** Navigates to the admin page after successful login. */
  onGoAdmin: () => void;
  /** Coach password from settings (coach_pwd). */
  coachPassword: string;
  /** Admin password from settings (admin_pwd). */
  adminPassword: string;
}

/** Main view with three role-selection buttons. */
export function HomePage({ onGoTrainee, onGoCoach, onGoAdmin, coachPassword, adminPassword }: HomePageProps) {
  const { t } = useTranslation();
  const [coachDialogOpen, setCoachDialogOpen] = useState(false);
  const [adminDialogOpen, setAdminDialogOpen] = useState(false);

  return (
    <div className={styles.page}>
      <p className={styles.placeholder}>{t('mainView.placeholder')}</p>

      <div className={styles.buttonRow}>
        <button onClick={onGoTrainee}>{t('mainView.trainees')}</button>
        <button onClick={() => setCoachDialogOpen(true)}>{t('mainView.coaches')}</button>
        <button onClick={() => setAdminDialogOpen(true)}>{t('mainView.admin')}</button>
      </div>

      <CoachLoginDialog
        open={coachDialogOpen}
        coachPassword={coachPassword}
        onLoginSuccess={(coachData) => {
          setCoachDialogOpen(false);
          onGoCoach(coachData);
        }}
        onCancel={() => setCoachDialogOpen(false)}
      />

      <AdminLoginDialog
        open={adminDialogOpen}
        adminPassword={adminPassword}
        onLoginSuccess={() => {
          setAdminDialogOpen(false);
          onGoAdmin();
        }}
        onCancel={() => setAdminDialogOpen(false)}
      />
    </div>
  );
}
