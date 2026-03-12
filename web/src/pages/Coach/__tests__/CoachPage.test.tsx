/**
 * @copyright 2026 Jouni Sipola by OQM. All rights reserved.
 * Permission granted for personal/internal use only. Commercial
 * use prohibited except by copyright holder. See LICENSE for details.
 */

/**
 * @description Tests for CoachPage — Coach Quick Registration view showing sessions.
 *   Written before implementation (TDD).
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import '../../../lib/i18n';
import { CoachPage } from '../CoachPage';
import type { SessionItem } from '../../../features/coach/types';

vi.mock('../../../features/coach/api/coach.api', () => ({
  getCoachSessions: vi.fn(),
}));

vi.mock('react-hot-toast', () => ({
  default: vi.fn(),
  toast: vi.fn(),
}));

import { getCoachSessions } from '../../../features/coach/api/coach.api';
import toast from 'react-hot-toast';

const mockGetCoachSessions = vi.mocked(getCoachSessions);
const mockToast = vi.mocked(toast);

const mockSession: SessionItem = {
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

describe('CoachPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetCoachSessions.mockResolvedValue([]);
  });

  it('renders title "Coach Quick Registration"', async () => {
    render(<CoachPage onBack={vi.fn()} />);
    expect(screen.getByRole('heading', { name: 'Coach Quick Registration' })).toBeInTheDocument();
  });

  it('renders Back to main button', async () => {
    render(<CoachPage onBack={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Back to main' })).toBeInTheDocument();
  });

  it('renders Refresh data button', async () => {
    render(<CoachPage onBack={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Refresh data' })).toBeInTheDocument();
  });

  it('calls onBack when Back to main button is clicked', async () => {
    const onBack = vi.fn();
    render(<CoachPage onBack={onBack} />);
    await userEvent.click(screen.getByRole('button', { name: 'Back to main' }));
    expect(onBack).toHaveBeenCalledOnce();
  });

  it('shows "You are not registered" when no coachData provided', async () => {
    render(<CoachPage onBack={vi.fn()} />);
    expect(screen.getByText(/You are not registered/)).toBeInTheDocument();
  });

  it('shows logged-in coach alias when coachData with alias is provided', async () => {
    const coachData = {
      id: '1', firstname: 'John', lastname: 'Doe', alias: 'JD',
      pin: '1234', created_at: '', last_activity: '',
    };
    render(<CoachPage onBack={vi.fn()} coachData={coachData} />);
    expect(screen.getByText(/JD/)).toBeInTheDocument();
  });

  it('shows "No sessions found" when sessions list is empty', async () => {
    mockGetCoachSessions.mockResolvedValue([]);
    render(<CoachPage onBack={vi.fn()} />);
    await waitFor(() => {
      expect(screen.getByText('No sessions found')).toBeInTheDocument();
    });
  });

  it('shows error message when getCoachSessions rejects', async () => {
    mockGetCoachSessions.mockRejectedValue(new Error('Network error'));
    render(<CoachPage onBack={vi.fn()} />);
    await waitFor(() => {
      expect(screen.getByText('Failed to load sessions. Please try again.')).toBeInTheDocument();
    });
  });

  it('renders session cards grouped by date', async () => {
    mockGetCoachSessions.mockResolvedValue([mockSession]);
    render(<CoachPage onBack={vi.fn()} />);
    await waitFor(() => {
      expect(screen.getByText('Nyrkkeilyharjoitus')).toBeInTheDocument();
    });
  });

  it('shows ConfirmCoachRegistrationDialog when Register is clicked', async () => {
    mockGetCoachSessions.mockResolvedValue([mockSession]);
    render(<CoachPage onBack={vi.fn()} />);
    await waitFor(() => screen.getByRole('button', { name: 'Register' }));
    await userEvent.click(screen.getByRole('button', { name: 'Register' }));
    expect(screen.getByText('Confirm Registration')).toBeInTheDocument();
  });

  it('shows ConfirmRemoveCoachDialog when Remove is clicked', async () => {
    const sessionWithCoach = { ...mockSession, coach_alias: 'JD', coach_firstname: 'John', coach_lastname: 'Doe', registration_id: 'reg-1' };
    mockGetCoachSessions.mockResolvedValue([sessionWithCoach]);
    render(<CoachPage onBack={vi.fn()} />);
    await waitFor(() => screen.getByRole('button', { name: 'Remove' }));
    await userEvent.click(screen.getByRole('button', { name: 'Remove' }));
    expect(screen.getByText('Confirm Removal')).toBeInTheDocument();
  });

  it('passes selected session and coachData to ConfirmCoachRegistrationDialog', async () => {
    const coachData = { id: '1', firstname: 'John', lastname: 'Doe', alias: 'JD', pin: '1234', created_at: '', last_activity: '' };
    mockGetCoachSessions.mockResolvedValue([mockSession]);
    render(<CoachPage onBack={vi.fn()} coachData={coachData} />);
    await waitFor(() => screen.getByRole('button', { name: 'Register' }));
    await userEvent.click(screen.getByRole('button', { name: 'Register' }));
    // Dialog should open and show confirmation title
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Confirm Registration' })).toBeInTheDocument();
  });

  it('dismisses dialog and shows cancellation toast when cancel is clicked', async () => {
    mockGetCoachSessions.mockResolvedValue([mockSession]);
    render(<CoachPage onBack={vi.fn()} />);
    await waitFor(() => screen.getByRole('button', { name: 'Register' }));
    await userEvent.click(screen.getByRole('button', { name: 'Register' }));
    const cancelBtn = screen.getByRole('button', { name: 'Cancel' });
    await userEvent.click(cancelBtn);
    await waitFor(() => expect(mockToast).toHaveBeenCalledWith('Registration cancelled.'));
  });
});
