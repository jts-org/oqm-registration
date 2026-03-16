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
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import SportsMmaIcon from '@mui/icons-material/SportsMma';
import SportsMartialArtsIcon from '@mui/icons-material/SportsMartialArts';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { CoachLoginDialog } from '../../features/coach/components/CoachLoginDialog';
import type { CoachData } from '../../features/coach/types';
import { AdminLoginDialog } from '../../features/admin/components/AdminLoginDialog';
import oqmCompactLogo from '../../assets/OQM_compact_logo.svg';
import reactLogo from '../../assets/logo.svg';
import okbLogo from '../../assets/okb_logo_transparent.png';
import viteLogo from '../../assets/500px-Vitejs-logo.svg.png';
import { RoleCard } from './RoleCard';

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

/** Main view with three role-selection cards. */
export function HomePage({ onGoTrainee, onGoCoach, onGoAdmin, coachPassword, adminPassword }: HomePageProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const [coachDialogOpen, setCoachDialogOpen] = useState(false);
  const [adminDialogOpen, setAdminDialogOpen] = useState(false);
  const currentYear = new Date().getFullYear();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        px: 2,
        py: 6,
        background: `linear-gradient(180deg, ${theme.palette.background.default} 0%, ${theme.palette.background.paper} 100%)`,
      }}
    >
      <Container maxWidth="sm" sx={{ flex: 1 }}>
        <Paper
          elevation={4}
          sx={{
            mb: 4,
            px: { xs: 2, sm: 3 },
            py: { xs: 1.5, sm: 2 },
            borderRadius: 3,
            display: 'flex',
            justifyContent: 'center',
            bgcolor: 'background.paper',
          }}
        >
          <Box
            component="img"
            src={okbLogo}
            alt={t('mainView.logoAlt')}
            sx={{ width: '100%', maxWidth: 260, height: 'auto' }}
          />
        </Paper>

        <Box textAlign="center" mt={2} mb={5}>
          <Typography variant="h3" gutterBottom>
            {t('app.title')}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            {t('mainView.subtitle')}
          </Typography>
        </Box>

        <Stack spacing={3}>
          <RoleCard
            icon={<SportsMmaIcon fontSize="large" />}
            title={t('mainView.trainees')}
            description={t('mainView.traineesDescription')}
            onClick={onGoTrainee}
          />
          <RoleCard
            icon={<SportsMartialArtsIcon fontSize="large" />}
            title={t('mainView.coaches')}
            description={t('mainView.coachesDescription')}
            onClick={() => setCoachDialogOpen(true)}
          />
          <RoleCard
            icon={<AdminPanelSettingsIcon fontSize="large" />}
            title={t('mainView.admin')}
            description={t('mainView.adminDescription')}
            onClick={() => setAdminDialogOpen(true)}
          />
        </Stack>
      </Container>

      <Container maxWidth="sm" sx={{ mt: 5 }}>
        <Paper
          elevation={4}
          sx={{
            px: { xs: 2, sm: 2.5 },
            py: { xs: 2, sm: 2.25 },
            borderRadius: 3,
            bgcolor: 'background.paper',
          }}
        >
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2.5}
            alignItems={{ xs: 'center', sm: 'flex-start' }}
            justifyContent="space-between"
          >
            <Stack spacing={1.25} alignItems={{ xs: 'center', sm: 'flex-start' }}>
              <Box
                component="img"
                src={oqmCompactLogo}
                alt={t('mainView.footerLogoAlt')}
                sx={{ width: 64, height: 64, objectFit: 'contain', alignSelf: 'center' }}
              />
              <Typography variant="body2" color="text.secondary" textAlign={{ xs: 'center', sm: 'left' }}>
                {t('mainView.footerCopyright', { year: currentYear })}<br />
                {t('mainView.footerCopyright2')}
              </Typography>
            </Stack>

            <Stack spacing={1} alignItems={{ xs: 'center', sm: 'flex-end' }} sx={{ alignSelf: { xs: 'center', sm: 'center' } }}>
              <Typography variant="body2" color="text.secondary">
                {t('mainView.footerPoweredBy')}
              </Typography>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Box
                  component="img"
                  src={reactLogo}
                  alt={t('mainView.reactLogoAlt')}
                  sx={{ width: 28, height: 28, objectFit: 'contain' }}
                />
                <Typography variant="body2" color="text.secondary">
                  React + Vite
                </Typography>
                <Box
                  component="img"
                  src={viteLogo}
                  alt={t('mainView.viteLogoAlt')}
                  sx={{ width: 28, height: 28, objectFit: 'contain' }}
                />
              </Stack>
            </Stack>
          </Stack>
        </Paper>
      </Container>

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
