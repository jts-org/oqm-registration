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
}));

vi.mock('react-hot-toast', () => ({
  default: { error: vi.fn(), success: vi.fn() },
}));

import { registerCoachPin } from '../../api/coach.api';

const mockRegisterCoachPin = vi.mocked(registerCoachPin);

const defaultProps = {
  open: true,
  coachPassword: 'secret',
  onLoginSuccess: vi.fn(),
  onCancel: vi.fn(),
};

describe('CoachLoginDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRegisterCoachPin.mockResolvedValue(undefined);
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

  it('clicking Verify with valid PIN calls onLoginSuccess', async () => {
    const onLoginSuccess = vi.fn();
    render(<CoachLoginDialog {...defaultProps} onLoginSuccess={onLoginSuccess} />);
    await userEvent.type(screen.getByLabelText('Enter PIN code'), '1234');
    await userEvent.click(screen.getByRole('button', { name: 'Verify' }));
    expect(onLoginSuccess).toHaveBeenCalledOnce();
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
    render(<CoachLoginDialog {...defaultProps} onLoginSuccess={onLoginSuccess} coachPassword="secret" />);
    await userEvent.type(screen.getByLabelText('Enter password'), 'secret');
    await userEvent.click(screen.getByRole('button', { name: 'Login' }));
    expect(onLoginSuccess).toHaveBeenCalledOnce();
  });

  it('clicking Login with wrong password shows error message', async () => {
    render(<CoachLoginDialog {...defaultProps} coachPassword="secret" />);
    await userEvent.type(screen.getByLabelText('Enter password'), 'wrong');
    await userEvent.click(screen.getByRole('button', { name: 'Login' }));
    expect(screen.getByText('Incorrect password. Try again.')).toBeInTheDocument();
  });

  it('dialog stays open after wrong password', async () => {
    render(<CoachLoginDialog {...defaultProps} coachPassword="secret" />);
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
    // A second dialog should now be visible (RegisterPinDialog)
    expect(screen.getAllByRole('dialog').length).toBeGreaterThan(1);
    // The RegisterPinDialog title heading should be present
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
});
