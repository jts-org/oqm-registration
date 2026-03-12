/**
 * @copyright 2026 Jouni Sipola by OQM. All rights reserved.
 * Permission granted for personal/internal use only. Commercial
 * use prohibited except by copyright holder. See LICENSE for details.
 */

/**
 * @description Tests for ConfirmRemoveCoachDialog — real removal confirmation dialog (OQM-0009).
 *   Written before implementation (TDD).
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import '../../../../lib/i18n';
import { ConfirmRemoveCoachDialog } from '../ConfirmRemoveCoachDialog';
import type { SessionItem } from '../../types';

vi.mock('../../api/coach.api', () => ({
  removeCoachFromSession: vi.fn(),
}));

import { removeCoachFromSession } from '../../api/coach.api';
const mockRemoveCoachFromSession = vi.mocked(removeCoachFromSession);

const mockSession: SessionItem = {
  id: 'ws-1_2026-03-09',
  session_type: 'Kickboxing',
  session_type_alias: 'Nyrkkeilyharjoitus',
  date: '2026-03-09',
  start_time: '18:00',
  end_time: '19:30',
  location: 'Gym A',
  coach_firstname: 'John',
  coach_lastname: 'Doe',
  coach_alias: 'JD',
  registration_id: 'reg-1',
  is_free_sparring: false,
};

const defaultProps = {
  open: true,
  session: mockSession,
  onSuccess: vi.fn(),
  onCancel: vi.fn(),
};

describe('ConfirmRemoveCoachDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not render when open=false', () => {
    render(<ConfirmRemoveCoachDialog {...defaultProps} open={false} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders when open=true', () => {
    render(<ConfirmRemoveCoachDialog {...defaultProps} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('renders title "Confirm Removal"', () => {
    render(<ConfirmRemoveCoachDialog {...defaultProps} />);
    expect(screen.getByText('Confirm Removal')).toBeInTheDocument();
  });

  it('renders confirmation question text', () => {
    render(<ConfirmRemoveCoachDialog {...defaultProps} />);
    expect(screen.getByText('Remove a coach from this session?')).toBeInTheDocument();
  });

  it('renders notification about trainees', () => {
    render(<ConfirmRemoveCoachDialog {...defaultProps} />);
    expect(screen.getByText(/Trainees may have registered/)).toBeInTheDocument();
  });

  it('renders session type alias', () => {
    render(<ConfirmRemoveCoachDialog {...defaultProps} />);
    expect(screen.getByText(/Nyrkkeilyharjoitus/)).toBeInTheDocument();
  });

  it('renders session date', () => {
    render(<ConfirmRemoveCoachDialog {...defaultProps} />);
    expect(screen.getByText(/09\.03\.2026/)).toBeInTheDocument();
  });

  it('renders session time', () => {
    render(<ConfirmRemoveCoachDialog {...defaultProps} />);
    expect(screen.getByText(/18:00/)).toBeInTheDocument();
  });

  it('renders coach alias', () => {
    render(<ConfirmRemoveCoachDialog {...defaultProps} />);
    expect(screen.getByText(/JD/)).toBeInTheDocument();
  });

  it('renders Confirm button', () => {
    render(<ConfirmRemoveCoachDialog {...defaultProps} />);
    expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument();
  });

  it('renders Cancel button', () => {
    render(<ConfirmRemoveCoachDialog {...defaultProps} />);
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  it('calls onCancel when Cancel is clicked', async () => {
    const onCancel = vi.fn();
    render(<ConfirmRemoveCoachDialog {...defaultProps} onCancel={onCancel} />);
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('calls removeCoachFromSession with correct payload when Confirm is clicked', async () => {
    mockRemoveCoachFromSession.mockResolvedValue('reg-1');
    render(<ConfirmRemoveCoachDialog {...defaultProps} />);
    await userEvent.click(screen.getByRole('button', { name: 'Confirm' }));
    expect(mockRemoveCoachFromSession).toHaveBeenCalledWith({
      firstname: 'John',
      lastname: 'Doe',
      session_type: 'Kickboxing',
      date: '2026-03-09',
    });
  });

  it('calls onSuccess with registrationId after successful removal', async () => {
    mockRemoveCoachFromSession.mockResolvedValue('reg-1');
    const onSuccess = vi.fn();
    render(<ConfirmRemoveCoachDialog {...defaultProps} onSuccess={onSuccess} />);
    await userEvent.click(screen.getByRole('button', { name: 'Confirm' }));
    await waitFor(() => expect(onSuccess).toHaveBeenCalledWith('reg-1'));
  });

  it('disables Confirm button during API call', async () => {
    let resolveApi!: (id: string) => void;
    mockRemoveCoachFromSession.mockImplementation(() => new Promise<string>(r => { resolveApi = r; }));
    render(<ConfirmRemoveCoachDialog {...defaultProps} />);
    await userEvent.click(screen.getByRole('button', { name: 'Confirm' }));
    expect(screen.getByRole('button', { name: 'Confirm' })).toBeDisabled();
    resolveApi('reg-1');
  });

  it('does not call onSuccess on error', async () => {
    mockRemoveCoachFromSession.mockRejectedValue(new Error('registration_not_found'));
    const onSuccess = vi.fn();
    render(<ConfirmRemoveCoachDialog {...defaultProps} onSuccess={onSuccess} />);
    await userEvent.click(screen.getByRole('button', { name: 'Confirm' }));
    await waitFor(() => expect(mockRemoveCoachFromSession).toHaveBeenCalled());
    expect(onSuccess).not.toHaveBeenCalled();
  });
});
