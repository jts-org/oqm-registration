/**
 * @copyright 2026 Jouni Sipola by OQM. All rights reserved.
 * Permission granted for personal/internal use only. Commercial
 * use prohibited except by copyright holder. See LICENSE for details.
 */

/**
 * @description Tests for TraineeSessionCard language-specific session type rendering.
 */
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material';

import '../../../../lib/i18n';
import { i18n } from '../../../../lib/i18n';
import { TraineeSessionCard } from '../TraineeSessionCard';
import type { TraineeSessionItem } from '../../types';

const theme = createTheme();

const baseSession: TraineeSessionItem = {
  id: 'ws-1_2026-03-17',
  session_type: 'Kickboxing',
  session_type_alias: 'Nyrkkeilyharjoitus',
  date: '2026-03-17',
  start_time: '18:00',
  end_time: '19:00',
  location: 'Gym A',
  coach_firstname: '',
  coach_lastname: '',
  camp_instructor_name: '',
  is_free_sparring: false,
};

function renderCard(session: TraineeSessionItem = baseSession) {
  return render(
    <ThemeProvider theme={theme}>
      <TraineeSessionCard session={session} onRegister={vi.fn()} />
    </ThemeProvider>
  );
}

describe('TraineeSessionCard', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('en');
  });

  it('renders session_type when selected language is English', () => {
    renderCard();
    expect(screen.getByText('Kickboxing')).toBeInTheDocument();
  });

  it('renders session_type_alias when selected language is Finnish', async () => {
    await i18n.changeLanguage('fi');
    renderCard();
    expect(screen.getByText('Nyrkkeilyharjoitus')).toBeInTheDocument();
  });
});
