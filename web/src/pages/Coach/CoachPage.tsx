/**
 * @copyright 2026 Jouni Sipola by OQM. All rights reserved.
 * Permission granted for personal/internal use only. Commercial
 * use prohibited except by copyright holder. See LICENSE for details.
 */

/**
 * @description Coach page — shown after the coach successfully authenticates via PIN.
 *   Receives and holds the verified coach's data for the duration of the session.
 *   State is cleared when the user navigates away (component unmounts).
 *   Uses MUI components for accessible and consistent UI.
 *   @see skills/SKILL.wire-react-to-gas.md
 */
import React from 'react';
import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import type { CoachData } from '../../features/coach/types';

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
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', p: 4 }}>
      <Typography variant="h4" component="h1" align="center" gutterBottom>
        {t('coachRegistration.title')}
      </Typography>
      {coachData && (
        <Typography align="center" color="text.secondary" sx={{ mb: 'auto' }}>
          {coachData.firstname} {coachData.lastname}
        </Typography>
      )}
      <Box sx={{ display: 'flex', justifyContent: 'center', pt: 2 }}>
        <Button variant="outlined" onClick={onBack}>
          {t('coachRegistration.backToMain')}
        </Button>
      </Box>
    </Box>
  );
}
