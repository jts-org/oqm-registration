/**
 * @copyright 2026 Jouni Sipola by OQM. All rights reserved.
 * Permission granted for personal/internal use only. Commercial
 * use prohibited except by copyright holder. See LICENSE for details.
 * @description Tests for RegisterPinDialog — refactored reusable modal for registering a PIN code.
 *   Covers name fields, PIN validation, inline notifications, API call, and error handling.
 *   Written before implementation (TDD).
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import '../../../../lib/i18n';
import { RegisterPinDialog } from '../RegisterPinDialog';

vi.mock('react-hot-toast', () => ({
  default: { error: vi.fn(), success: vi.fn() },
}));

import toast from 'react-hot-toast';
const mockToast = vi.mocked(toast);

const defaultProps = {
  open: true,
  onRegister: vi.fn().mockResolvedValue(undefined),
  onSuccess: vi.fn(),
  onCancel: vi.fn(),
};

/** Helper: fill all required fields with valid data. */
async function fillValidForm(pin = '1234') {
  await userEvent.type(screen.getByLabelText('Firstname'), 'John');
  await userEvent.type(screen.getByLabelText('Lastname'), 'Doe');
  await userEvent.type(screen.getByLabelText('Enter new PIN code'), pin);
  await userEvent.type(screen.getByLabelText('Enter PIN again'), pin);
}

describe('RegisterPinDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    defaultProps.onRegister.mockResolvedValue(undefined);
  });

  // ── Rendering ──────────────────────────────────────────────────────────────

  it('does not render when open=false', () => {
    render(<RegisterPinDialog {...defaultProps} open={false} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders when open=true', () => {
    render(<RegisterPinDialog {...defaultProps} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('displays title "Register new PIN code"', () => {
    render(<RegisterPinDialog {...defaultProps} />);
    expect(screen.getByText('Register new PIN code')).toBeInTheDocument();
  });

  // ── Field rendering ────────────────────────────────────────────────────────

  it('renders "Firstname" input', () => {
    render(<RegisterPinDialog {...defaultProps} />);
    expect(screen.getByLabelText('Firstname')).toBeInTheDocument();
  });

  it('renders "Lastname" input', () => {
    render(<RegisterPinDialog {...defaultProps} />);
    expect(screen.getByLabelText('Lastname')).toBeInTheDocument();
  });

  it('renders "Alias" input when showAlias is true (default)', () => {
    render(<RegisterPinDialog {...defaultProps} />);
    expect(screen.getByLabelText('Alias')).toBeInTheDocument();
  });

  it('does NOT render "Alias" input when showAlias=false', () => {
    render(<RegisterPinDialog {...defaultProps} showAlias={false} />);
    expect(screen.queryByLabelText('Alias')).not.toBeInTheDocument();
  });

  it('renders "Enter new PIN code" input', () => {
    render(<RegisterPinDialog {...defaultProps} />);
    expect(screen.getByLabelText('Enter new PIN code')).toBeInTheDocument();
  });

  it('"Enter new PIN code" input type is "password"', () => {
    render(<RegisterPinDialog {...defaultProps} />);
    expect(screen.getByLabelText('Enter new PIN code')).toHaveAttribute('type', 'password');
  });

  it('renders "Enter PIN again" input', () => {
    render(<RegisterPinDialog {...defaultProps} />);
    expect(screen.getByLabelText('Enter PIN again')).toBeInTheDocument();
  });

  it('"Enter PIN again" input type is "password"', () => {
    render(<RegisterPinDialog {...defaultProps} />);
    expect(screen.getByLabelText('Enter PIN again')).toHaveAttribute('type', 'password');
  });

  it('renders Register button', () => {
    render(<RegisterPinDialog {...defaultProps} />);
    expect(screen.getByRole('button', { name: 'Register' })).toBeInTheDocument();
  });

  it('renders Cancel button', () => {
    render(<RegisterPinDialog {...defaultProps} />);
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  // ── Register button enabled/disabled ──────────────────────────────────────

  it('Register button is disabled when all inputs are empty', () => {
    render(<RegisterPinDialog {...defaultProps} />);
    expect(screen.getByRole('button', { name: 'Register' })).toBeDisabled();
  });

  it('Register button is disabled when firstname is missing', async () => {
    render(<RegisterPinDialog {...defaultProps} />);
    await userEvent.type(screen.getByLabelText('Lastname'), 'Doe');
    await userEvent.type(screen.getByLabelText('Enter new PIN code'), '1234');
    await userEvent.type(screen.getByLabelText('Enter PIN again'), '1234');
    expect(screen.getByRole('button', { name: 'Register' })).toBeDisabled();
  });

  it('Register button is disabled when lastname is missing', async () => {
    render(<RegisterPinDialog {...defaultProps} />);
    await userEvent.type(screen.getByLabelText('Firstname'), 'John');
    await userEvent.type(screen.getByLabelText('Enter new PIN code'), '1234');
    await userEvent.type(screen.getByLabelText('Enter PIN again'), '1234');
    expect(screen.getByRole('button', { name: 'Register' })).toBeDisabled();
  });

  it('Register button is disabled when PIN has fewer than 4 digits', async () => {
    render(<RegisterPinDialog {...defaultProps} />);
    await userEvent.type(screen.getByLabelText('Firstname'), 'John');
    await userEvent.type(screen.getByLabelText('Lastname'), 'Doe');
    await userEvent.type(screen.getByLabelText('Enter new PIN code'), '123');
    await userEvent.type(screen.getByLabelText('Enter PIN again'), '123');
    expect(screen.getByRole('button', { name: 'Register' })).toBeDisabled();
  });

  it('Register button is disabled when PINs do not match', async () => {
    render(<RegisterPinDialog {...defaultProps} />);
    await userEvent.type(screen.getByLabelText('Firstname'), 'John');
    await userEvent.type(screen.getByLabelText('Lastname'), 'Doe');
    await userEvent.type(screen.getByLabelText('Enter new PIN code'), '1234');
    await userEvent.type(screen.getByLabelText('Enter PIN again'), '5678');
    expect(screen.getByRole('button', { name: 'Register' })).toBeDisabled();
  });

  it('Register button is disabled when PIN contains non-numeric characters', async () => {
    render(<RegisterPinDialog {...defaultProps} />);
    await userEvent.type(screen.getByLabelText('Firstname'), 'John');
    await userEvent.type(screen.getByLabelText('Lastname'), 'Doe');
    await userEvent.type(screen.getByLabelText('Enter new PIN code'), 'abc1');
    await userEvent.type(screen.getByLabelText('Enter PIN again'), 'abc1');
    expect(screen.getByRole('button', { name: 'Register' })).toBeDisabled();
  });

  it('Register button is disabled when PIN has more than 6 digits', async () => {
    render(<RegisterPinDialog {...defaultProps} />);
    await userEvent.type(screen.getByLabelText('Firstname'), 'John');
    await userEvent.type(screen.getByLabelText('Lastname'), 'Doe');
    await userEvent.type(screen.getByLabelText('Enter new PIN code'), '1234567');
    await userEvent.type(screen.getByLabelText('Enter PIN again'), '1234567');
    expect(screen.getByRole('button', { name: 'Register' })).toBeDisabled();
  });

  it('Register button is enabled when firstname, lastname, and valid matching PINs are provided', async () => {
    render(<RegisterPinDialog {...defaultProps} />);
    await fillValidForm();
    expect(screen.getByRole('button', { name: 'Register' })).toBeEnabled();
  });

  it('Register button is enabled when alias is empty (alias is optional)', async () => {
    render(<RegisterPinDialog {...defaultProps} />);
    await userEvent.type(screen.getByLabelText('Firstname'), 'John');
    await userEvent.type(screen.getByLabelText('Lastname'), 'Doe');
    await userEvent.type(screen.getByLabelText('Enter new PIN code'), '1234');
    await userEvent.type(screen.getByLabelText('Enter PIN again'), '1234');
    // alias left empty
    expect(screen.getByRole('button', { name: 'Register' })).toBeEnabled();
  });

  it('Register button is disabled when firstname contains numbers', async () => {
    render(<RegisterPinDialog {...defaultProps} />);
    await userEvent.type(screen.getByLabelText('Firstname'), 'John1');
    await userEvent.type(screen.getByLabelText('Lastname'), 'Doe');
    await userEvent.type(screen.getByLabelText('Enter new PIN code'), '1234');
    await userEvent.type(screen.getByLabelText('Enter PIN again'), '1234');
    expect(screen.getByRole('button', { name: 'Register' })).toBeDisabled();
  });

  it('Register button is enabled when firstname has a hyphen between letters (e.g. "Ukko-Pekka")', async () => {
    render(<RegisterPinDialog {...defaultProps} />);
    await userEvent.type(screen.getByLabelText('Firstname'), 'Ukko-Pekka');
    await userEvent.type(screen.getByLabelText('Lastname'), 'Nurmi');
    await userEvent.type(screen.getByLabelText('Enter new PIN code'), '1234');
    await userEvent.type(screen.getByLabelText('Enter PIN again'), '1234');
    expect(screen.getByRole('button', { name: 'Register' })).toBeEnabled();
  });

  it('Register button is enabled when lastname has a space (e.g. "von Kuckelkören")', async () => {
    render(<RegisterPinDialog {...defaultProps} />);
    await userEvent.type(screen.getByLabelText('Firstname'), 'August');
    await userEvent.type(screen.getByLabelText('Lastname'), 'von Kuckelkören');
    await userEvent.type(screen.getByLabelText('Enter new PIN code'), '1234');
    await userEvent.type(screen.getByLabelText('Enter PIN again'), '1234');
    expect(screen.getByRole('button', { name: 'Register' })).toBeEnabled();
  });

  // ── Inline validation notifications ───────────────────────────────────────

  it('does NOT show "Mandatory" for firstname before the field is touched', () => {
    render(<RegisterPinDialog {...defaultProps} />);
    expect(screen.queryByText('Mandatory')).not.toBeInTheDocument();
  });

  it('shows "Mandatory" for firstname after typing and clearing the field', async () => {
    render(<RegisterPinDialog {...defaultProps} />);
    await userEvent.type(screen.getByLabelText('Firstname'), 'J');
    await userEvent.clear(screen.getByLabelText('Firstname'));
    expect(screen.getByText('Mandatory')).toBeInTheDocument();
  });

  it('shows "Mandatory" for lastname after typing and clearing the field', async () => {
    render(<RegisterPinDialog {...defaultProps} />);
    await userEvent.type(screen.getByLabelText('Lastname'), 'D');
    await userEvent.clear(screen.getByLabelText('Lastname'));
    expect(screen.getByText('Mandatory')).toBeInTheDocument();
  });

  it('shows "PIN codes don\'t match" when both PIN fields have content but differ', async () => {
    render(<RegisterPinDialog {...defaultProps} />);
    await userEvent.type(screen.getByLabelText('Enter new PIN code'), '1234');
    await userEvent.type(screen.getByLabelText('Enter PIN again'), '5678');
    expect(screen.getByText("PIN codes don't match")).toBeInTheDocument();
  });

  it('does NOT show PIN mismatch when only one PIN field has content', async () => {
    render(<RegisterPinDialog {...defaultProps} />);
    await userEvent.type(screen.getByLabelText('Enter new PIN code'), '1234');
    expect(screen.queryByText("PIN codes don't match")).not.toBeInTheDocument();
  });

  it('does NOT show PIN mismatch when both PIN fields are empty', () => {
    render(<RegisterPinDialog {...defaultProps} />);
    expect(screen.queryByText("PIN codes don't match")).not.toBeInTheDocument();
  });

  // ── Register action: success ───────────────────────────────────────────────

  it('calls onRegister with correct data when Register is clicked', async () => {
    render(<RegisterPinDialog {...defaultProps} />);
    await fillValidForm('4321');
    await userEvent.click(screen.getByRole('button', { name: 'Register' }));
    expect(defaultProps.onRegister).toHaveBeenCalledWith({
      firstname: 'John',
      lastname: 'Doe',
      alias: '',
      pin: '4321',
    });
  });

  it('calls onSuccess with the PIN after successful registration', async () => {
    render(<RegisterPinDialog {...defaultProps} />);
    await fillValidForm('4321');
    await userEvent.click(screen.getByRole('button', { name: 'Register' }));
    await waitFor(() => expect(defaultProps.onSuccess).toHaveBeenCalledWith('4321'));
  });

  it('calls toast.success after successful registration', async () => {
    render(<RegisterPinDialog {...defaultProps} />);
    await fillValidForm();
    await userEvent.click(screen.getByRole('button', { name: 'Register' }));
    await waitFor(() => expect(mockToast.success).toHaveBeenCalled());
  });

  it('includes alias value in onRegister call when alias is provided', async () => {
    render(<RegisterPinDialog {...defaultProps} />);
    await userEvent.type(screen.getByLabelText('Firstname'), 'John');
    await userEvent.type(screen.getByLabelText('Lastname'), 'Doe');
    await userEvent.type(screen.getByLabelText('Alias'), 'JD');
    await userEvent.type(screen.getByLabelText('Enter new PIN code'), '1234');
    await userEvent.type(screen.getByLabelText('Enter PIN again'), '1234');
    await userEvent.click(screen.getByRole('button', { name: 'Register' }));
    expect(defaultProps.onRegister).toHaveBeenCalledWith(
      expect.objectContaining({ alias: 'JD' })
    );
  });

  // ── Register action: pin_reserved error ───────────────────────────────────

  it('shows pin_reserved modal when onRegister throws "pin_reserved"', async () => {
    defaultProps.onRegister.mockRejectedValue(new Error('pin_reserved'));
    render(<RegisterPinDialog {...defaultProps} />);
    await fillValidForm();
    await userEvent.click(screen.getByRole('button', { name: 'Register' }));
    await waitFor(() =>
      expect(screen.getByText('PIN code reserved. Choose different PIN code.')).toBeInTheDocument()
    );
  });

  it('dismissing pin_reserved modal clears PIN fields but keeps name fields', async () => {
    defaultProps.onRegister.mockRejectedValue(new Error('pin_reserved'));
    render(<RegisterPinDialog {...defaultProps} />);
    await userEvent.type(screen.getByLabelText('Firstname'), 'John');
    await userEvent.type(screen.getByLabelText('Lastname'), 'Doe');
    await userEvent.type(screen.getByLabelText('Enter new PIN code'), '1234');
    await userEvent.type(screen.getByLabelText('Enter PIN again'), '1234');
    await userEvent.click(screen.getByRole('button', { name: 'Register' }));
    await waitFor(() =>
      expect(screen.getByText('PIN code reserved. Choose different PIN code.')).toBeInTheDocument()
    );
    // Close the pin_reserved modal using the Cancel button inside it
    const cancelButtons = screen.getAllByRole('button', { name: 'Cancel' });
    // The last Cancel button belongs to the pin_reserved modal
    await userEvent.click(cancelButtons[cancelButtons.length - 1]);
    expect(screen.getByLabelText('Firstname')).toHaveValue('John');
    expect(screen.getByLabelText('Lastname')).toHaveValue('Doe');
    expect(screen.getByLabelText('Enter new PIN code')).toHaveValue('');
    expect(screen.getByLabelText('Enter PIN again')).toHaveValue('');
  });

  // ── Register action: network error ────────────────────────────────────────

  it('calls toast.error on network/unexpected error', async () => {
    defaultProps.onRegister.mockRejectedValue(new Error('Network error'));
    render(<RegisterPinDialog {...defaultProps} />);
    await fillValidForm();
    await userEvent.click(screen.getByRole('button', { name: 'Register' }));
    await waitFor(() => expect(mockToast.error).toHaveBeenCalled());
  });

  // ── Cancel ────────────────────────────────────────────────────────────────

  it('calls onCancel when Cancel is clicked', async () => {
    render(<RegisterPinDialog {...defaultProps} />);
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(defaultProps.onCancel).toHaveBeenCalledOnce();
  });
});
