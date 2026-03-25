/**
 * @copyright 2026 Jouni Sipola by OQM. All rights reserved.
 * Permission granted for personal/internal use only. Commercial
 * use prohibited except by copyright holder. See LICENSE for details.
 */

/**
 * @description Tests for SessionCard — MUI card showing a single session instance.
 *   Written before implementation (TDD).
 */
import React from 'react';
import { beforeEach, describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider, createTheme } from '@mui/material';

import '../../../../lib/i18n';
import { i18n } from '../../../../lib/i18n';
import { SessionCard } from '../SessionCard';
import type { SessionItem } from '../../types';

const theme = createTheme();

const baseSession: SessionItem = {
  id: 'ws-1_2026-03-09',
  session_type: 'Kickboxing',
  session_type_alias: 'Nyrkkeilyharjoitus',
  date: '2026-03-09',
  start_time: '18:00',
  end_time: '19:30',
  location: 'Gym A',
  coach_firstname: '',
  coach_lastname: '',
  coach_alias: '',
  registration_id: '',
  is_free_sparring: false,
};

const sessionWithCoach: SessionItem = {
  ...baseSession,
  coach_firstname: 'John',
  coach_lastname: 'Doe',
  coach_alias: 'JD',
  registration_id: 'reg-1',
};

function renderCard(session: SessionItem, onRegister = vi.fn(), onRemove = vi.fn()) {
  return render(
    <ThemeProvider theme={theme}>
      <SessionCard session={session} onRegister={onRegister} onRemove={onRemove} />
    </ThemeProvider>
  );
}

describe('SessionCard', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('en');
  });

  it('renders session type when selected language is English', () => {
    renderCard(baseSession);
    expect(screen.getByText('Kickboxing')).toBeInTheDocument();
  });

  it('renders session type alias when selected language is Finnish', async () => {
    await i18n.changeLanguage('fi');
    renderCard(baseSession);
    expect(screen.getByText('Nyrkkeilyharjoitus')).toBeInTheDocument();
  });

  it('renders start and end time', () => {
    renderCard(baseSession);
    expect(screen.getByText('18:00 - 19:30')).toBeInTheDocument();
  });

  it('renders location', () => {
    renderCard(baseSession);
    expect(screen.getByText('Gym A')).toBeInTheDocument();
  });

  it('renders Register button when no coach assigned', () => {
    renderCard(baseSession);
    expect(screen.getByRole('button', { name: 'Register' })).toBeInTheDocument();
  });

  it('does not render Remove button when no coach assigned', () => {
    renderCard(baseSession);
    expect(screen.queryByRole('button', { name: 'Remove' })).not.toBeInTheDocument();
  });

  it('renders Remove button when coach is assigned', () => {
    renderCard(sessionWithCoach);
    expect(screen.getByRole('button', { name: 'Remove' })).toBeInTheDocument();
  });

  it('does not render Register button when coach is assigned', () => {
    renderCard(sessionWithCoach);
    expect(screen.queryByRole('button', { name: 'Register' })).not.toBeInTheDocument();
  });

  it('renders coach alias when coach is assigned', () => {
    renderCard(sessionWithCoach);
    expect(screen.getByText(/JD/)).toBeInTheDocument();
  });

  it('calls onRegister with session when Register is clicked', async () => {
    const onRegister = vi.fn();
    renderCard(baseSession, onRegister);
    await userEvent.click(screen.getByRole('button', { name: 'Register' }));
    expect(onRegister).toHaveBeenCalledWith(baseSession);
  });

  it('calls onRemove with session when Remove is clicked', async () => {
    const onRemove = vi.fn();
    renderCard(sessionWithCoach, vi.fn(), onRemove);
    await userEvent.click(screen.getByRole('button', { name: 'Remove' }));
    expect(onRemove).toHaveBeenCalledWith(sessionWithCoach);
  });

  it('disables Register button when no coach and session is free/sparring', () => {
    const freeSparringSession: SessionItem = { ...baseSession, session_type: 'free/sparring', is_free_sparring: true };
    renderCard(freeSparringSession);
    expect(screen.getByRole('button', { name: 'Register' })).toBeDisabled();
  });

  it('enables Register button when no coach and session is not free/sparring', () => {
    renderCard(baseSession);
    expect(screen.getByRole('button', { name: 'Register' })).not.toBeDisabled();
  });

  it('does not render Remove button for camp session even when coach is assigned', () => {
    const campSessionWithCoach: SessionItem = {
      ...sessionWithCoach,
      id: 'camp_1_2026-03-09',
    };

    renderCard(campSessionWithCoach);

    expect(screen.getByText('Kickboxing')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Remove' })).not.toBeInTheDocument();
  });

  it('does not render Register button for camp session when coach is not assigned', () => {
    const campSessionWithoutCoach: SessionItem = {
      ...baseSession,
      id: 'camp_2_2026-03-09',
    };

    renderCard(campSessionWithoutCoach);

    expect(screen.getByText('Kickboxing')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Register' })).not.toBeInTheDocument();
  });

  it('keeps non-camp Remove behavior unchanged when coach is assigned', () => {
    renderCard(sessionWithCoach);
    expect(screen.getByRole('button', { name: 'Remove' })).toBeInTheDocument();
  });
});
