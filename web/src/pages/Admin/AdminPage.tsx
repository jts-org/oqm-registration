/**
 * @copyright 2026 Jouni Sipola by OQM. All rights reserved.
 * Permission granted for personal/internal use only. Commercial
 * use prohibited except by copyright holder. See LICENSE for details.
 */

/**
 * @description Administrator page — dummy implementation.
 *   Shown after the admin successfully authenticates.
 *   Uses MUI components for accessible and consistent UI.
 */
import React from 'react';
import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

export interface AdminPageProps {
  /** Navigates back to the main view. */
  onBack: () => void;
}

/** Full-page dummy admin view with a back button. */
export function AdminPage({ onBack }: AdminPageProps) {
  const { t } = useTranslation();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', p: 4 }}>
      <Typography variant="h4" component="h1" align="center" sx={{ mb: 'auto' }}>
        {t('adminView.title')}
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'center', pt: 2 }}>
        <Button variant="outlined" onClick={onBack}>
          {t('adminView.backToMain')}
        </Button>
      </Box>
    </Box>
  );
}
