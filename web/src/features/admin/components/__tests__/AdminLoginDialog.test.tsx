/**
 * @copyright 2026 Jouni Sipola by OQM
 * @description Tests for AdminLoginDialog — modal for admin password login.
 *   Written before implementation (TDD).
 */
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import '../../../../lib/i18n';
import { AdminLoginDialog } from '../AdminLoginDialog';

vi.mock('../../api/admin.api', () => ({
  adminLogin: vi.fn().mockResolvedValue({
    sessionToken: 'admin-session-token',
    role: 'admin',
    expiresInSeconds: 28800,
  }),
}));

import { adminLogin } from '../../api/admin.api';
const mockAdminLogin = vi.mocked(adminLogin);

const defaultProps = {
  open: true,
  onLoginSuccess: vi.fn(),
  onCancel: vi.fn(),
};

describe('AdminLoginDialog', () => {
  it('does not render when open=false', () => {
    render(<AdminLoginDialog {...defaultProps} open={false} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders when open=true', () => {
    render(<AdminLoginDialog {...defaultProps} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('displays title "Admin login"', () => {
    render(<AdminLoginDialog {...defaultProps} />);
    expect(screen.getByText('Admin login')).toBeInTheDocument();
  });

  it('renders "Enter password" input', () => {
    render(<AdminLoginDialog {...defaultProps} />);
    expect(screen.getByLabelText('Enter password')).toBeInTheDocument();
  });

  it('renders Login button', () => {
    render(<AdminLoginDialog {...defaultProps} />);
    expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument();
  });

  it('renders Cancel button', () => {
    render(<AdminLoginDialog {...defaultProps} />);
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  it('Login button is disabled when password field is empty', () => {
    render(<AdminLoginDialog {...defaultProps} />);
    expect(screen.getByRole('button', { name: 'Login' })).toBeDisabled();
  });

  it('Login button is enabled when at least one character is entered', async () => {
    render(<AdminLoginDialog {...defaultProps} />);
    await userEvent.type(screen.getByLabelText('Enter password'), 'x');
    expect(screen.getByRole('button', { name: 'Login' })).toBeEnabled();
  });

  it('clicking Login with correct password calls onLoginSuccess', async () => {
    const onLoginSuccess = vi.fn();
    render(<AdminLoginDialog {...defaultProps} onLoginSuccess={onLoginSuccess} />);
    await userEvent.type(screen.getByLabelText('Enter password'), 'adminPass');
    await userEvent.click(screen.getByRole('button', { name: 'Login' }));
    await waitFor(() => expect(mockAdminLogin).toHaveBeenCalledWith('adminPass'));
    expect(onLoginSuccess).toHaveBeenCalledWith('admin-session-token');
  });

  it('clicking Login with wrong password shows error message', async () => {
    mockAdminLogin.mockRejectedValueOnce(new Error('invalid_credentials'));
    render(<AdminLoginDialog {...defaultProps} />);
    await userEvent.type(screen.getByLabelText('Enter password'), 'wrong');
    await userEvent.click(screen.getByRole('button', { name: 'Login' }));
    await waitFor(() => expect(screen.getByText('Incorrect password. Try again.')).toBeInTheDocument());
  });

  it('dialog stays open after wrong password', async () => {
    mockAdminLogin.mockRejectedValueOnce(new Error('invalid_credentials'));
    render(<AdminLoginDialog {...defaultProps} />);
    await userEvent.type(screen.getByLabelText('Enter password'), 'wrong');
    await userEvent.click(screen.getByRole('button', { name: 'Login' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('calls onCancel when Cancel is clicked', async () => {
    const onCancel = vi.fn();
    render(<AdminLoginDialog {...defaultProps} onCancel={onCancel} />);
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onCancel).toHaveBeenCalledOnce();
  });
});
