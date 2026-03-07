/**
 * @copyright 2026 Jouni Sipola by OQM. All rights reserved.
 * Permission granted for personal/internal use only. Commercial
 * use prohibited except by copyright holder. See LICENSE for details.
 */

/**
 * @description Main view shown after application startup.
 *   Presents three entry-point buttons: Trainees, Coaches, Admin.
 *   Opens login dialogs for Coach and Admin flows.
 *   Uses MUI components for accessible and consistent UI.
 */
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { CoachLoginDialog } from '../../features/coach/components/CoachLoginDialog';
import type { CoachData } from '../../features/coach/types';
import { AdminLoginDialog } from '../../features/admin/components/AdminLoginDialog';

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
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
        p: 4,
      }}
    >
      <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary', textAlign: 'center' }}>
        {t('mainView.placeholder')}
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
        <Button variant="contained" onClick={onGoTrainee}>
          {t('mainView.trainees')}
        </Button>
        <Button variant="contained" onClick={() => setCoachDialogOpen(true)}>
          {t('mainView.coaches')}
        </Button>
        <Button variant="contained" onClick={() => setAdminDialogOpen(true)}>
          {t('mainView.admin')}
        </Button>
      </Box>

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
    </Box>
  );
}
