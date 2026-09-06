/**
 * @copyright 2026 Jouni Sipola by OQM. All rights reserved.
 * Permission granted for personal/internal use only. Commercial
 * use prohibited except by copyright holder. See LICENSE for details.
 */

/**
 * @description Session selector component for multi-session customer event registration (OQM-0050).
 *   Allows trainees to select a non-empty subset of available sessions with accessible controls.
 *   @see .github/skills/frontend-ux-and-accessibility/SKILL.md
 *   @see .github/skills/frontend-responsive-design/SKILL.md
 */
import React from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';
import { formatDateDisplay, formatTimeDisplay } from '../../../shared/utils/formatters';
import type { CustomerEventSession } from '../types';

export interface SessionSelectorProps {
  sessions: CustomerEventSession[];
  selectedSessionIds: string[];
  onToggleSession: (sessionId: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  disabled?: boolean;
}

export function SessionSelector({
  sessions,
  selectedSessionIds,
  onToggleSession,
  onSelectAll,
  onDeselectAll,
  disabled = false,
}: SessionSelectorProps) {
  const { t, i18n } = useTranslation();

  const selectedCount = selectedSessionIds.length;
  const totalCount = sessions.length;
  const noneSelected = selectedCount === 0;

  return (
    <Card variant="outlined" sx={{ width: '100%' }}>
      <CardContent>
        <Stack spacing={2}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'space-between',
              alignItems: { xs: 'flex-start', sm: 'center' },
              gap: 1,
            }}
          >
            <div>
              <Typography variant="h6" component="h2">
                {t('customerEventRegister.selectSessionsTitle')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('customerEventRegister.selectedSessionsCount', {
                  count: selectedCount,
                  total: totalCount,
                })}
              </Typography>
            </div>

            <Stack direction="row" spacing={1} sx={{ width: { xs: '100%', sm: 'auto' } }}>
              <Button
                size="small"
                variant="outlined"
                onClick={onSelectAll}
                disabled={disabled || selectedCount === totalCount}
                sx={{ flex: { xs: 1, sm: 'initial' } }}
              >
                {t('customerEventRegister.selectAll')}
              </Button>
              <Button
                size="small"
                variant="outlined"
                onClick={onDeselectAll}
                disabled={disabled || noneSelected}
                sx={{ flex: { xs: 1, sm: 'initial' } }}
              >
                {t('customerEventRegister.deselectAll')}
              </Button>
            </Stack>
          </Box>

          {noneSelected && (
            <Alert severity="warning" sx={{ width: '100%' }}>
              {t('customerEventRegister.noSessionsSelectedError')}
            </Alert>
          )}

          <FormGroup role="group" aria-label={t('customerEventRegister.selectSessionsTitle')}>
            <Stack spacing={1.5}>
              {sessions.map(session => {
                const isSelected = selectedSessionIds.includes(session.id);
                const sessionTitle = i18n.resolvedLanguage?.startsWith('en')
                  ? session.session_name
                  : session.session_name_alias || session.session_name;

                return (
                  <Card
                    key={session.id}
                    variant="outlined"
                    sx={{
                      backgroundColor: isSelected ? 'action.selected' : 'background.paper',
                      borderColor: isSelected ? 'primary.main' : 'divider',
                      borderWidth: isSelected ? 2 : 1,
                      transition: 'all 0.15s ease-in-out',
                    }}
                  >
                    <CardActionArea
                      component="div"
                      onClick={() => !disabled && onToggleSession(session.id)}
                      disabled={disabled}
                      sx={{ p: 1.5 }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          justifyContent: 'space-between',
                          gap: 1.5,
                        }}
                      >
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={isSelected}
                              onChange={() => onToggleSession(session.id)}
                              disabled={disabled}
                              inputProps={{
                                'aria-label': `${sessionTitle} ${formatDateDisplay(session.date)} ${formatTimeDisplay(session.start_time)}-${formatTimeDisplay(session.end_time)}`,
                              }}
                            />
                          }
                          label={
                            <Box sx={{ ml: 0.5 }}>
                              <Typography variant="subtitle1" fontWeight="bold">
                                {sessionTitle}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                <strong>{t('customerEventRegister.dateLabel')}:</strong> {formatDateDisplay(session.date)}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                <strong>{t('customerEventRegister.timeLabel')}:</strong> {formatTimeDisplay(session.start_time)} - {formatTimeDisplay(session.end_time)}
                              </Typography>
                            </Box>
                          }
                          sx={{ m: 0, width: '100%', alignItems: 'flex-start' }}
                          onClick={e => e.stopPropagation()}
                        />
                      </Box>
                    </CardActionArea>
                  </Card>
                );
              })}
            </Stack>
          </FormGroup>
        </Stack>
      </CardContent>
    </Card>
  );
}
