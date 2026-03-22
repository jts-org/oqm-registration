/**
 * @copyright 2026 Jouni Sipola by OQM. All rights reserved.
 * Permission granted for personal/internal use only. Commercial
 * use prohibited except by copyright holder. See LICENSE for details.
 */

/**
 * @description Tests for CoachLoginDialog — modal for coach PIN / password login.
 *   Written before implementation (TDD).
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import '../../../../lib/i18n';
import { CoachLoginDialog } from '../CoachLoginDialog';

vi.mock('../../api/coach.api', () => ({
  registerCoachPin: vi.fn().mockResolvedValue(undefined),
  coachLoginWithPin: vi.fn().mockResolvedValue({
    session: { sessionToken: 'coach-session-token', role: 'coach', expiresInSeconds: 28800 },
    coachData: {
      id: '1', firstname: 'John', lastname: 'Doe', alias: '', pin: '1234',
      created_at: '2026-01-01T00:00:00Z', last_activity: '',
    },
  }),
  coachLoginWithPassword: vi.fn().mockResolvedValue({
    session: { sessionToken: 'coach-session-token', role: 'coach', expiresInSeconds: 28800 },
    coachData: null,
  }),
}));

vi.mock('react-hot-toast', () => {
  const toastFn = vi.fn();
  return {
    default: Object.assign(toastFn, {
      error: vi.fn(),
      success: vi.fn(),
    }),
  };
});

import toast from 'react-hot-toast';
import { coachLoginWithPassword, coachLoginWithPin, registerCoachPin } from '../../api/coach.api';

const mockRegisterCoachPin = vi.mocked(registerCoachPin);
const mockCoachLoginWithPin = vi.mocked(coachLoginWithPin);
const mockCoachLoginWithPassword = vi.mocked(coachLoginWithPassword);
const mockToast = vi.mocked(toast);

const defaultProps = {
  open: true,
  onLoginSuccess: vi.fn(),
  onCancel: vi.fn(),
};

describe('CoachLoginDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRegisterCoachPin.mockResolvedValue({
      id: '1', firstname: 'John', lastname: 'Doe', alias: '', pin: '1234',
      created_at: '2026-01-01T00:00:00Z', last_activity: '',
    });
    mockCoachLoginWithPin.mockResolvedValue({
      session: { sessionToken: 'coach-session-token', role: 'coach', expiresInSeconds: 28800 },
      coachData: {
        id: '1', firstname: 'John', lastname: 'Doe', alias: '', pin: '1234',
        created_at: '2026-01-01T00:00:00Z', last_activity: '',
      },
    });
    mockCoachLoginWithPassword.mockResolvedValue({
      session: { sessionToken: 'coach-session-token', role: 'coach', expiresInSeconds: 28800 },
      coachData: null,
    });
  });
  it('does not render when open=false', () => {
    render(<CoachLoginDialog {...defaultProps} open={false} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders when open=true', () => {
    render(<CoachLoginDialog {...defaultProps} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('displays title "Coach login"', () => {
    render(<CoachLoginDialog {...defaultProps} />);
    expect(screen.getByText('Coach login')).toBeInTheDocument();
  });

  it('renders "Enter PIN code" input', () => {
    render(<CoachLoginDialog {...defaultProps} />);
    expect(screen.getByLabelText('Enter PIN code')).toBeInTheDocument();
  });

  it('renders Verify button', () => {
    render(<CoachLoginDialog {...defaultProps} />);
    expect(screen.getByRole('button', { name: 'Verify' })).toBeInTheDocument();
  });

  it('renders "Register new PIN code" link', () => {
    render(<CoachLoginDialog {...defaultProps} />);
    expect(screen.getByRole('button', { name: 'Register new PIN code' })).toBeInTheDocument();
  });

  it('renders "Enter password" input', () => {
    render(<CoachLoginDialog {...defaultProps} />);
    expect(screen.getByLabelText('Enter password')).toBeInTheDocument();
  });

  it('renders Login button', () => {
    render(<CoachLoginDialog {...defaultProps} />);
    expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument();
  });

  it('renders Cancel button', () => {
    render(<CoachLoginDialog {...defaultProps} />);
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  it('Verify button is disabled when PIN has fewer than 4 digits', async () => {
    render(<CoachLoginDialog {...defaultProps} />);
    await userEvent.type(screen.getByLabelText('Enter PIN code'), '123');
    expect(screen.getByRole('button', { name: 'Verify' })).toBeDisabled();
  });

  it('Verify button is enabled when PIN has 4+ digits', async () => {
    render(<CoachLoginDialog {...defaultProps} />);
    await userEvent.type(screen.getByLabelText('Enter PIN code'), '1234');
    expect(screen.getByRole('button', { name: 'Verify' })).toBeEnabled();
  });

  it('Verify button is disabled when PIN contains non-numeric characters', async () => {
    render(<CoachLoginDialog {...defaultProps} />);
    await userEvent.type(screen.getByLabelText('Enter PIN code'), 'abc1');
    expect(screen.getByRole('button', { name: 'Verify' })).toBeDisabled();
  });

  it('clicking Verify with valid PIN calls onLoginSuccess with coach data', async () => {
    const onLoginSuccess = vi.fn();
    render(<CoachLoginDialog {...defaultProps} onLoginSuccess={onLoginSuccess} />);
    await userEvent.type(screen.getByLabelText('Enter PIN code'), '1234');
    await userEvent.click(screen.getByRole('button', { name: 'Verify' }));
    await waitFor(() => expect(onLoginSuccess).toHaveBeenCalledOnce());
    expect(onLoginSuccess).toHaveBeenCalledWith(
      expect.objectContaining({
        sessionToken: 'coach-session-token',
        coachData: expect.objectContaining({ id: '1', firstname: 'John', lastname: 'Doe' }),
      })
    );
  });

  it('calls coachLoginWithPin API when Verify is clicked with valid PIN', async () => {
    render(<CoachLoginDialog {...defaultProps} />);
    await userEvent.type(screen.getByLabelText('Enter PIN code'), '1234');
    await userEvent.click(screen.getByRole('button', { name: 'Verify' }));
    await waitFor(() => expect(mockCoachLoginWithPin).toHaveBeenCalledWith('1234'));
  });

  it('shows toast on successful PIN verification', async () => {
    render(<CoachLoginDialog {...defaultProps} />);
    await userEvent.type(screen.getByLabelText('Enter PIN code'), '1234');
    await userEvent.click(screen.getByRole('button', { name: 'Verify' }));
    await waitFor(() => expect(mockToast.success).toHaveBeenCalledWith('Successfully logged in as a coach'));
  });

  it('shows inline error when PIN not found', async () => {
    mockCoachLoginWithPin.mockRejectedValue(new Error('no_match_found'));
    render(<CoachLoginDialog {...defaultProps} />);
    await userEvent.type(screen.getByLabelText('Enter PIN code'), '9999');
    await userEvent.click(screen.getByRole('button', { name: 'Verify' }));
    await waitFor(() =>
      expect(screen.getByText('Invalid PIN. Try again.')).toBeInTheDocument()
    );
  });

  it('clears input fields after no_match_found error', async () => {
    mockCoachLoginWithPin.mockRejectedValue(new Error('no_match_found'));
    render(<CoachLoginDialog {...defaultProps} />);
    await userEvent.type(screen.getByLabelText('Enter PIN code'), '9999');
    await userEvent.type(screen.getByLabelText('Enter password'), 'secret');
    await userEvent.click(screen.getByRole('button', { name: 'Verify' }));
    await waitFor(() =>
      expect(screen.getByText('Invalid PIN. Try again.')).toBeInTheDocument()
    );
    expect(screen.getByLabelText('Enter PIN code')).toHaveValue('');
    expect(screen.getByLabelText('Enter password')).toHaveValue('');
  });

  it('dialog stays open after no_match_found error', async () => {
    mockCoachLoginWithPin.mockRejectedValue(new Error('no_match_found'));
    render(<CoachLoginDialog {...defaultProps} />);
    await userEvent.type(screen.getByLabelText('Enter PIN code'), '9999');
    await userEvent.click(screen.getByRole('button', { name: 'Verify' }));
    await waitFor(() =>
      expect(screen.getByText('Invalid PIN. Try again.')).toBeInTheDocument()
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('Login button is disabled when password field is empty', () => {
    render(<CoachLoginDialog {...defaultProps} />);
    expect(screen.getByRole('button', { name: 'Login' })).toBeDisabled();
  });

  it('Login button is enabled when at least one character is entered', async () => {
    render(<CoachLoginDialog {...defaultProps} />);
    await userEvent.type(screen.getByLabelText('Enter password'), 'x');
    expect(screen.getByRole('button', { name: 'Login' })).toBeEnabled();
  });

  it('clicking Login with correct password calls onLoginSuccess', async () => {
    const onLoginSuccess = vi.fn();
    render(<CoachLoginDialog {...defaultProps} onLoginSuccess={onLoginSuccess} />);
    await userEvent.type(screen.getByLabelText('Enter password'), 'secret');
    await userEvent.click(screen.getByRole('button', { name: 'Login' }));
    await waitFor(() => expect(onLoginSuccess).toHaveBeenCalledOnce());
    expect(onLoginSuccess).toHaveBeenCalledWith({ sessionToken: 'coach-session-token' });
  });

  it('clicking Login with wrong password shows error message', async () => {
    mockCoachLoginWithPassword.mockRejectedValue(new Error('invalid_credentials'));
    render(<CoachLoginDialog {...defaultProps} />);
    await userEvent.type(screen.getByLabelText('Enter password'), 'wrong');
    await userEvent.click(screen.getByRole('button', { name: 'Login' }));
    await waitFor(() => expect(screen.getByText('Incorrect password. Try again.')).toBeInTheDocument());
  });

  it('dialog stays open after wrong password', async () => {
    mockCoachLoginWithPassword.mockRejectedValue(new Error('invalid_credentials'));
    render(<CoachLoginDialog {...defaultProps} />);
    await userEvent.type(screen.getByLabelText('Enter password'), 'wrong');
    await userEvent.click(screen.getByRole('button', { name: 'Login' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('calls onCancel when Cancel is clicked', async () => {
    const onCancel = vi.fn();
    render(<CoachLoginDialog {...defaultProps} onCancel={onCancel} />);
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('clicking "Register new PIN code" opens the RegisterPinDialog', async () => {
    render(<CoachLoginDialog {...defaultProps} />);
    await userEvent.click(screen.getByRole('button', { name: 'Register new PIN code' }));
    // When RegisterPinDialog (second modal) opens, MUI sets aria-hidden on the first modal.
    // Use { hidden: true } to query all dialog roles including aria-hidden ones.
    expect(screen.getAllByRole('dialog', { hidden: true }).length).toBeGreaterThan(1);
    // The RegisterPinDialog title heading should be present (active modal)
    expect(screen.getByRole('heading', { name: 'Register new PIN code' })).toBeInTheDocument();
  });

  it('after registering a PIN, the PIN field is filled with that value', async () => {
    render(<CoachLoginDialog {...defaultProps} />);
    await userEvent.click(screen.getByRole('button', { name: 'Register new PIN code' }));
    // Fill in all required fields in RegisterPinDialog
    await userEvent.type(screen.getByLabelText('Firstname'), 'John');
    await userEvent.type(screen.getByLabelText('Lastname'), 'Doe');
    await userEvent.type(screen.getByLabelText('Enter new PIN code'), '9876');
    await userEvent.type(screen.getByLabelText('Enter PIN again'), '9876');
    await userEvent.click(screen.getByRole('button', { name: 'Register' }));
    // Wait for async registration to complete and dialog to close
    await waitFor(() =>
      expect(screen.queryByRole('button', { name: 'Register' })).not.toBeInTheDocument()
    );
    expect(screen.getByLabelText('Enter PIN code')).toHaveValue('9876');
  });

  // ── Loading overlay (OQM-0005) ────────────────────────────────────────────

  it('shows loading overlay while coachLoginWithPin is in progress', async () => {
    let resolveVerify!: (value: unknown) => void;
    const pendingVerify = new Promise(res => { resolveVerify = res; });
    mockCoachLoginWithPin.mockReturnValue(pendingVerify as ReturnType<typeof mockCoachLoginWithPin>);

    render(<CoachLoginDialog {...defaultProps} />);
    await userEvent.type(screen.getByLabelText('Enter PIN code'), '1234');
    await userEvent.click(screen.getByRole('button', { name: 'Verify' }));

    expect(screen.getByRole('status')).toBeInTheDocument();

    resolveVerify({
      session: { sessionToken: 'coach-session-token', role: 'coach', expiresInSeconds: 28800 },
      coachData: { id: '1', firstname: 'John', lastname: 'Doe', alias: '', pin: '1234', created_at: '', last_activity: '' },
    });
  });

  it('hides loading overlay after coachLoginWithPin completes successfully', async () => {
    let resolveVerify!: (value: unknown) => void;
    const pendingVerify = new Promise(res => { resolveVerify = res; });
    mockCoachLoginWithPin.mockReturnValue(pendingVerify as ReturnType<typeof mockCoachLoginWithPin>);

    render(<CoachLoginDialog {...defaultProps} />);
    await userEvent.type(screen.getByLabelText('Enter PIN code'), '1234');
    await userEvent.click(screen.getByRole('button', { name: 'Verify' }));

    resolveVerify({
      session: { sessionToken: 'coach-session-token', role: 'coach', expiresInSeconds: 28800 },
      coachData: { id: '1', firstname: 'John', lastname: 'Doe', alias: '', pin: '1234', created_at: '', last_activity: '' },
    });
    await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument());
  });

  it('hides loading overlay after coachLoginWithPin fails', async () => {
    let rejectVerify!: (err: Error) => void;
    const pendingVerify = new Promise((_res, rej) => { rejectVerify = rej; });
    mockCoachLoginWithPin.mockReturnValue(pendingVerify as ReturnType<typeof mockCoachLoginWithPin>);

    render(<CoachLoginDialog {...defaultProps} />);
    await userEvent.type(screen.getByLabelText('Enter PIN code'), '9999');
    await userEvent.click(screen.getByRole('button', { name: 'Verify' }));

    rejectVerify(new Error('no_match_found'));
    await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument());
  });
});
