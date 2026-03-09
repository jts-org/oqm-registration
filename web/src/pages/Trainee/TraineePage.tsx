/**
 * @copyright 2026 Jouni Sipola by OQM. All rights reserved.
 * Permission granted for personal/internal use only. Commercial
 * use prohibited except by copyright holder. See LICENSE for details.
 */

/**
 * @description Trainee registration page — dummy implementation.
 *   Shown after the user selects the Trainees flow from the main view.
 *   Uses MUI components for accessible and consistent UI.
 */
import React from 'react';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

export interface TraineePageProps {
  /** Navigates back to the main view. */
  onBack: () => void;
}

/** Full-page dummy trainee registration view with a back button. */
export function TraineePage({ onBack }: TraineePageProps) {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', p: 4, background: theme.palette.background.default, color: theme.palette.text.primary }}>
      <Typography variant="h4" component="h1" align="center" sx={{ mb: 'auto' }}>
        {t('traineeRegistration.title')}
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'center', pt: 2 }}>
        <Button variant="outlined" onClick={onBack}>
          {t('traineeRegistration.backToMain')}
        </Button>
      </Box>
    </Box>
  );
}
