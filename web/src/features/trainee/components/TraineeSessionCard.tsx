/**
 * @copyright 2026 Jouni Sipola by OQM. All rights reserved.
 * Permission granted for personal/internal use only. Commercial
 * use prohibited except by copyright holder. See LICENSE for details.
 */

/**
 * @description Card for trainee session registration actions.
 *   Mirrors coach card layout while applying trainee-specific labels and state.
 *   @see skills/SKILL.wire-react-to-gas.md
 */
import React from 'react';
import DoneIcon from '@mui/icons-material/Done';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import type { TraineeSessionItem } from '../types';

export interface TraineeSessionCardProps {
  session: TraineeSessionItem;
  onRegister: (session: TraineeSessionItem) => void;
}

/** Display one trainee session with registration action and metadata labels. */
export function TraineeSessionCard({ session, onRegister }: TraineeSessionCardProps) {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const isRegistered = Boolean(session.trainee_registered);
  const displayName = i18n.resolvedLanguage?.startsWith('en')
    ? session.session_type
    : session.session_type_alias || session.session_type;

  return (
    <Card
      sx={{
        backgroundColor: isRegistered ? theme.palette.success.main : theme.palette.secondary.main,
        mb: 1,
        color: '#fff',
        border: `2px solid ${theme.palette.common.white}`,
        width: '340px',
        minHeight: '120px',
        position: 'relative',
      }}
    >
      {isRegistered && (
        <DoneIcon
          fontSize="small"
          sx={{ position: 'absolute', top: 8, right: 8 }}
          aria-label={t('traineeRegistration.registeredIconLabel')}
        />
      )}
      <Box sx={{ display: 'flex', flexDirection: 'row', height: '100%' }}>
        <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', pb: 0 }}>
          <Typography variant="subtitle1" fontWeight="bold">
            {displayName}
          </Typography>
          <Typography variant="body2">
            {session.start_time} - {session.end_time}
          </Typography>
          {session.location && <Typography variant="body2">{session.location}</Typography>}
          <Stack spacing={0.25} mt={0.5}>
            {session.is_free_sparring && (session.coach_firstname || session.coach_lastname) && (
              <Typography variant="body2">
                {t('traineeRegistration.coachLabel')}: {session.coach_firstname} {session.coach_lastname}
              </Typography>
            )}
            {session.camp_instructor_name && (
              <Typography variant="body2">
                {t('traineeRegistration.campInstructorLabel')}: {session.camp_instructor_name}
              </Typography>
            )}
          </Stack>
        </CardContent>
        <CardActions sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', height: '100%' }}>
          <Button
            size="small"
            variant="contained"
            color={isRegistered ? 'warning' : 'primary'}
            onClick={() => onRegister(session)}
            sx={{ border: '1px solid #000' }}
          >
            {isRegistered ? t('traineeRegistration.unregister') : t('traineeRegistration.register')}
          </Button>
        </CardActions>
      </Box>
    </Card>
  );
}
