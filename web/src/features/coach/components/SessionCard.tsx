/**
 * @copyright 2026 Jouni Sipola by OQM. All rights reserved.
 * Permission granted for personal/internal use only. Commercial
 * use prohibited except by copyright holder. See LICENSE for details.
 */

/**
 * @description MUI Card displaying a single session instance.
 *   Background is accent-secondary when no coach is assigned; light-green when assigned.
 *   Shows Register button (no coach) or Remove button (coach assigned).
 *   @see skills/SKILL.wire-react-to-gas.md
 */
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import type { SessionItem } from '../types';

export interface SessionCardProps {
  session: SessionItem;
  onRegister: (session: SessionItem) => void;
  onRemove: (session: SessionItem) => void;
  cardStyle?: React.CSSProperties;
}

/** MUI Card for one session — shows type, time, location, coach and action button. */
export function SessionCard({ session, onRegister, onRemove, cardStyle }: SessionCardProps) {
  const { t, i18n } = useTranslation();
  const theme = useTheme();

  const hasCoach = Boolean(session.coach_alias || session.coach_firstname);
  const isCampSession = session.id.startsWith('camp_');

  const backgroundColor = hasCoach
    ? theme.palette.success.main
    : theme.palette.secondary.main;

  const displayName = i18n.resolvedLanguage?.startsWith('en')
    ? session.session_type
    : session.session_type_alias || session.session_type;

  /** Register button is disabled for free/sparring sessions that have no coach assigned. */
  const isRegisterDisabled = !hasCoach && session.is_free_sparring;

  return (
    <Card sx={{ backgroundColor, mb: 1, color: '#fff', border: `2px solid ${theme.palette.common.white}`, ...cardStyle }}>
      <Box sx={{ display: 'flex', flexDirection: 'row', height: '100%' }}>
        <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', pb: 0 }}>
          <Typography variant="subtitle1" fontWeight="bold">
            {displayName}
          </Typography>
          <Typography variant="body2">
            {session.start_time} - {session.end_time}
          </Typography>
          <Typography variant="body2">{session.location}</Typography>
          {hasCoach && (
            <Typography variant="body2">
              {t('coachQuickRegistration.coach', {
                alias: session.coach_alias || `${session.coach_firstname} ${session.coach_lastname}`,
              })}
            </Typography>
          )}
        </CardContent>
        {!isCampSession && (
          <CardActions sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', height: '100%' }}>
            {hasCoach ? (
              <Button
                size="small"
                variant="contained"
                color="error"
                onClick={() => onRemove(session)}
                sx={{ border: '1px solid #000' }}
              >
                {t('coachQuickRegistration.remove')}
              </Button>
            ) : (
              <Button
                size="small"
                variant="contained"
                color="primary"
                onClick={() => onRegister(session)}
                disabled={isRegisterDisabled}
                sx={{ border: '1px solid #000' }}
              >
                {t('coachQuickRegistration.register')}
              </Button>
            )}
          </CardActions>
        )}
      </Box>
    </Card>
  );
}
