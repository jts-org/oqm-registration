/**
 * @copyright 2026 Jouni Sipola by OQM. All rights reserved.
 * Permission granted for personal/internal use only. Commercial
 * use prohibited except by copyright holder. See LICENSE for details.
 */

/**
 * @description Tests for ConfirmCoachRegistrationDialog — real registration confirmation dialog (OQM-0008).
 *   Written before implementation (TDD).
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import '../../../../lib/i18n';
import { ConfirmCoachRegistrationDialog } from '../ConfirmCoachRegistrationDialog';
import type { SessionItem, CoachData } from '../../types';

vi.mock('../../api/coach.api', () => ({
  registerCoachForSession: vi.fn(),
}));

import { registerCoachForSession } from '../../api/coach.api';
const mockRegisterCoachForSession = vi.mocked(registerCoachForSession);

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

const mockCoachData: CoachData = {
  id: 'coach-1',
  firstname: 'John',
  lastname: 'Doe',
  alias: 'JD',
  pin: '1234',
  created_at: '2026-01-01T00:00:00Z',
  last_activity: '',
};

const defaultProps = {
  open: true,
  session: mockSession,
  coachData: mockCoachData,
  onSuccess: vi.fn(),
  onCancel: vi.fn(),
};

describe('ConfirmCoachRegistrationDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not render when open=false', () => {
    render(<ConfirmCoachRegistrationDialog {...defaultProps} open={false} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders when open=true', () => {
    render(<ConfirmCoachRegistrationDialog {...defaultProps} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('renders title "Confirm Registration"', () => {
    render(<ConfirmCoachRegistrationDialog {...defaultProps} />);
    expect(screen.getByText('Confirm Registration')).toBeInTheDocument();
  });

  it('renders confirmation question', () => {
    render(<ConfirmCoachRegistrationDialog {...defaultProps} />);
    expect(screen.getByText(/Do you register as coach for this session\?/i)).toBeInTheDocument();
  });

  it('renders session type alias', () => {
    render(<ConfirmCoachRegistrationDialog {...defaultProps} />);
    expect(screen.getByText(/Nyrkkeilyharjoitus/i)).toBeInTheDocument();
  });

  it('renders session date', () => {
    render(<ConfirmCoachRegistrationDialog {...defaultProps} />);
    expect(screen.getByText(/09\.03\.2026/)).toBeInTheDocument();
  });

  it('renders session time', () => {
    render(<ConfirmCoachRegistrationDialog {...defaultProps} />);
    expect(screen.getByText(/18:00/)).toBeInTheDocument();
  });

  it('renders coach alias', () => {
    render(<ConfirmCoachRegistrationDialog {...defaultProps} />);
    expect(screen.getByText(/JD/)).toBeInTheDocument();
  });

  it('renders Confirm button', () => {
    render(<ConfirmCoachRegistrationDialog {...defaultProps} />);
    expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument();
  });

  it('renders Cancel button', () => {
    render(<ConfirmCoachRegistrationDialog {...defaultProps} />);
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  it('calls onCancel when Cancel is clicked', async () => {
    const onCancel = vi.fn();
    render(<ConfirmCoachRegistrationDialog {...defaultProps} onCancel={onCancel} />);
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('calls registerCoachForSession with correct payload when Confirm is clicked', async () => {
    mockRegisterCoachForSession.mockResolvedValue('reg-123');
    render(<ConfirmCoachRegistrationDialog {...defaultProps} />);
    await userEvent.click(screen.getByRole('button', { name: 'Confirm' }));
    expect(mockRegisterCoachForSession).toHaveBeenCalledWith({
      firstname: 'John',
      lastname: 'Doe',
      session_type: 'Kickboxing',
      date: '2026-03-09',
    });
  });

  it('calls onSuccess with registrationId after successful registration', async () => {
    mockRegisterCoachForSession.mockResolvedValue('reg-123');
    const onSuccess = vi.fn();
    render(<ConfirmCoachRegistrationDialog {...defaultProps} onSuccess={onSuccess} />);
    await userEvent.click(screen.getByRole('button', { name: 'Confirm' }));
    await waitFor(() => expect(onSuccess).toHaveBeenCalledWith('reg-123'));
  });

  it('includes start_time and end_time for free/sparring sessions', async () => {
    const freeSession: SessionItem = { ...mockSession, session_type: 'free/sparring', is_free_sparring: true, start_time: '10:00', end_time: '11:30' };
    mockRegisterCoachForSession.mockResolvedValue('reg-456');
    render(<ConfirmCoachRegistrationDialog {...defaultProps} session={freeSession} />);
    await userEvent.click(screen.getByRole('button', { name: 'Confirm' }));
    expect(mockRegisterCoachForSession).toHaveBeenCalledWith(
      expect.objectContaining({ start_time: '10:00', end_time: '11:30' })
    );
  });

  it('disables Confirm button and shows loading overlay during API call', async () => {
    let resolveApi!: (id: string) => void;
    mockRegisterCoachForSession.mockImplementation(() => new Promise<string>(r => { resolveApi = r; }));
    render(<ConfirmCoachRegistrationDialog {...defaultProps} />);
    await userEvent.click(screen.getByRole('button', { name: 'Confirm' }));
    expect(screen.getByRole('button', { name: 'Confirm' })).toBeDisabled();
    resolveApi('reg-123');
  });

  it('does not call onSuccess on error', async () => {
    mockRegisterCoachForSession.mockRejectedValue(new Error('already_taken'));
    const onSuccess = vi.fn();
    render(<ConfirmCoachRegistrationDialog {...defaultProps} onSuccess={onSuccess} />);
    await userEvent.click(screen.getByRole('button', { name: 'Confirm' }));
    await waitFor(() => expect(mockRegisterCoachForSession).toHaveBeenCalled());
    expect(onSuccess).not.toHaveBeenCalled();
  });
});

