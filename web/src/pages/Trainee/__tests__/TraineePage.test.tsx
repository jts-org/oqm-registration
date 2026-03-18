/**
 * @copyright 2026 Jouni Sipola by OQM. All rights reserved.
 * Permission granted for personal/internal use only. Commercial
 * use prohibited except by copyright holder. See LICENSE for details.
 */

/**
 * @description Tests for TraineePage registration flow (OQM-0015).
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import '../../../lib/i18n';
import { TraineePage } from '../TraineePage';
import { getTraineeSessions } from '../../../features/trainee/api/trainee.api';
import { registerTraineeForSession } from '../../../features/trainee/api/trainee.api';
import type { TraineeSessionItem } from '../../../features/trainee/types';
import toast from 'react-hot-toast';

vi.mock('../../../features/trainee/api/trainee.api', () => ({
  getTraineeSessions: vi.fn(),
  registerTraineeForSession: vi.fn(),
}));

vi.mock('react-hot-toast', () => {
  const toastFn = Object.assign(vi.fn(), {
    success: vi.fn(),
    error: vi.fn(),
  });
  return { default: toastFn };
});

const mockGetTraineeSessions = vi.mocked(getTraineeSessions);
const mockRegisterTraineeForSession = vi.mocked(registerTraineeForSession);
const mockToast = vi.mocked(toast);

const mockSession: TraineeSessionItem = {
  id: 'ws-1_2026-03-17',
  session_type: 'basic',
  session_type_alias: 'Basic',
  date: '2026-03-17',
  start_time: '18:00',
  end_time: '19:00',
  location: '',
  coach_firstname: '',
  coach_lastname: '',
  camp_instructor_name: '',
  is_free_sparring: false,
};

describe('TraineePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetTraineeSessions.mockResolvedValue([mockSession]);
    mockRegisterTraineeForSession.mockResolvedValue('reg-1');
  });

  it('shows warning alert when trainee is not logged in and has login/register pin buttons', async () => {
    render(<TraineePage onBack={vi.fn()} />);
    await screen.findByText('Basic');

    expect(screen.getByText('You are not logged in.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Register PIN' })).toBeInTheDocument();
  });

  it('shows fetching toast and renders training session cards', async () => {
    render(<TraineePage onBack={vi.fn()} />);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith('Fetching training sessions. Please wait.');
    });

    expect(await screen.findByText('Basic')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Register' })).toBeInTheDocument();
  });

  it('opens manual dialog on Register and confirm dialog after pressing Ok', async () => {
    render(<TraineePage onBack={vi.fn()} />);

    await screen.findByText('Basic');
    await userEvent.click(screen.getByRole('button', { name: 'Register' }));

    expect(screen.getByRole('heading', { name: 'Fill your information' })).toBeInTheDocument();
    await userEvent.type(screen.getByLabelText('First name:'), 'Jane');
    await userEvent.type(screen.getByLabelText('Last name:'), 'Doe');
    await userEvent.click(screen.getByRole('button', { name: 'Ok' }));

    expect(screen.getByText('Do you register as trainee for this session?')).toBeInTheDocument();
  });

  it('registers trainee successfully, updates card state and toggles logout button', async () => {
    render(<TraineePage onBack={vi.fn()} />);

    await screen.findByText('Basic');
    await userEvent.click(screen.getByRole('button', { name: 'Register' }));

    await userEvent.type(screen.getByLabelText('First name:'), 'Jane');
    await userEvent.type(screen.getByLabelText('Last name:'), 'Doe');
    await userEvent.click(screen.getByRole('button', { name: 'Ok' }));

    const confirmDialog = await screen.findByRole('dialog', { name: 'Confirm Registration' });
    await userEvent.click(within(confirmDialog).getByRole('button', { name: 'Ok' }));

    await waitFor(() => {
      expect(mockToast.success).toHaveBeenCalledWith('Registration successfull.');
    });

    expect(screen.getByText('Logged in: Jane Doe.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Log out', hidden: true })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Unregister', hidden: true })).toBeInTheDocument();
  });

  it('marks session as registered when backend returns already_registered', async () => {
    mockRegisterTraineeForSession.mockRejectedValue(new Error('already_registered'));
    render(<TraineePage onBack={vi.fn()} />);

    await screen.findByText('Basic');
    await userEvent.click(screen.getByRole('button', { name: 'Register' }));

    await userEvent.type(screen.getByLabelText('First name:'), 'Harri');
    await userEvent.type(screen.getByLabelText('Last name:'), 'Harrastaja');
    await userEvent.click(screen.getByRole('button', { name: 'Ok' }));

    const confirmDialog = await screen.findByRole('dialog', { name: 'Confirm Registration' });
    await userEvent.click(within(confirmDialog).getByRole('button', { name: 'Ok' }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Unregister', hidden: true })).toBeInTheDocument();
    });
    expect(screen.getByText('Logged in: Harri Harrastaja.')).toBeInTheDocument();
  });

  it('clears pending trainee state on Log out', async () => {
    render(<TraineePage onBack={vi.fn()} />);

    await screen.findByText('Basic');
    await userEvent.click(screen.getByRole('button', { name: 'Register' }));
    await userEvent.type(screen.getByLabelText('First name:'), 'Jane');
    await userEvent.type(screen.getByLabelText('Last name:'), 'Doe');
    await userEvent.click(screen.getByRole('button', { name: 'Ok' }));
    await userEvent.click(screen.getByRole('button', { name: 'Ok' }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Log out' })).toBeInTheDocument();
    });

    await userEvent.click(screen.getByRole('button', { name: 'Log out' }));

    expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument();
    expect(screen.getByText('You are not logged in.')).toBeInTheDocument();
  });

  it('calls onBack and clears trainee state when Back to main is clicked', async () => {
    const onBack = vi.fn();
    render(<TraineePage onBack={onBack} />);

    await userEvent.click(screen.getByRole('button', { name: 'Back to main' }));
    expect(onBack).toHaveBeenCalledOnce();
  });
});
