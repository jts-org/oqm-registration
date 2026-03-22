/**
 * @copyright 2026 Jouni Sipola by OQM. All rights reserved.
 * Permission granted for personal/internal use only. Commercial
 * use prohibited except by copyright holder. See LICENSE for details.
 */

/**
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

  it('renders trainee underage checkbox only when showAlias=false', () => {
    const { rerender } = render(<RegisterPinDialog {...defaultProps} />);
    expect(screen.queryByLabelText("I'm under 18 years old")).not.toBeInTheDocument();

    rerender(<RegisterPinDialog {...defaultProps} showAlias={false} />);
    expect(screen.getByLabelText("I'm under 18 years old")).toBeInTheDocument();
  });

  it('keeps trainee underage checkbox unchecked by default and hides the age field', () => {
    render(<RegisterPinDialog {...defaultProps} showAlias={false} />);
    expect(screen.getByLabelText("I'm under 18 years old")).not.toBeChecked();
    expect(screen.queryByLabelText('Age:')).not.toBeInTheDocument();
  });

  it('shows the age field with default age 15 when the underage checkbox is selected', async () => {
    render(<RegisterPinDialog {...defaultProps} showAlias={false} />);

    await userEvent.click(screen.getByLabelText("I'm under 18 years old"));

    expect(screen.getByLabelText('Age:')).toBeInTheDocument();
    expect(screen.getByLabelText('Age:')).toHaveValue(15);
  });

  it('prefills trainee underage controls from initialIsUnderage and initialAge', () => {
    render(
      <RegisterPinDialog
        {...defaultProps}
        showAlias={false}
        initialIsUnderage={true}
        initialAge={13}
      />
    );

    expect(screen.getByLabelText("I'm under 18 years old")).toBeChecked();
    expect(screen.getByLabelText('Age:')).toHaveValue(13);
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

  it('Register button is enabled when firstname contains a dot (e.g. "John J.")', async () => {
    render(<RegisterPinDialog {...defaultProps} showAlias={false} />);
    await userEvent.type(screen.getByLabelText('Firstname'), 'John J.');
    await userEvent.type(screen.getByLabelText('Lastname'), 'Doe');
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

  it('shows the ongoing registration toast before awaiting onRegister', async () => {
    let resolveRegister!: () => void;
    const pendingRegister = new Promise<void>(resolve => {
      resolveRegister = resolve;
    });
    defaultProps.onRegister.mockReturnValue(pendingRegister);

    render(<RegisterPinDialog {...defaultProps} />);
    await fillValidForm();
    await userEvent.click(screen.getByRole('button', { name: 'Register' }));

    expect(mockToast).toHaveBeenCalledWith('Registration ongoing. Please wait.');

    resolveRegister();
  });

  it('submits trainee underage payload when trainee mode is used', async () => {
    render(<RegisterPinDialog {...defaultProps} showAlias={false} />);

    await userEvent.type(screen.getByLabelText('Firstname'), 'John J.');
    await userEvent.type(screen.getByLabelText('Lastname'), 'Doe');
    await userEvent.click(screen.getByLabelText("I'm under 18 years old"));
    await userEvent.clear(screen.getByLabelText('Age:'));
    await userEvent.type(screen.getByLabelText('Age:'), '16');
    await userEvent.type(screen.getByLabelText('Enter new PIN code'), '4321');
    await userEvent.type(screen.getByLabelText('Enter PIN again'), '4321');
    await userEvent.click(screen.getByRole('button', { name: 'Register' }));

    expect(defaultProps.onRegister).toHaveBeenCalledWith({
      firstname: 'John J.',
      lastname: 'Doe',
      pin: '4321',
      isUnderage: true,
      age: 16,
    });
  });

  it('clears trainee age from the submitted payload when underage is unchecked again', async () => {
    render(<RegisterPinDialog {...defaultProps} showAlias={false} />);

    await userEvent.type(screen.getByLabelText('Firstname'), 'John');
    await userEvent.type(screen.getByLabelText('Lastname'), 'Doe');
    await userEvent.click(screen.getByLabelText("I'm under 18 years old"));
    await userEvent.click(screen.getByLabelText("I'm under 18 years old"));
    await userEvent.type(screen.getByLabelText('Enter new PIN code'), '4321');
    await userEvent.type(screen.getByLabelText('Enter PIN again'), '4321');
    await userEvent.click(screen.getByRole('button', { name: 'Register' }));

    expect(defaultProps.onRegister).toHaveBeenCalledWith({
      firstname: 'John',
      lastname: 'Doe',
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

  it('shows concurrent_request error message and preserves the filled form values', async () => {
    defaultProps.onRegister.mockRejectedValue(new Error('concurrent_request'));
    render(<RegisterPinDialog {...defaultProps} showAlias={false} />);

    await userEvent.type(screen.getByLabelText('Firstname'), 'John');
    await userEvent.type(screen.getByLabelText('Lastname'), 'Doe');
    await userEvent.type(screen.getByLabelText('Enter new PIN code'), '1234');
    await userEvent.type(screen.getByLabelText('Enter PIN again'), '1234');
    await userEvent.click(screen.getByRole('button', { name: 'Register' }));

    await waitFor(() => {
      expect(screen.getByText('Concurrent operation ongoing. Please try again.')).toBeInTheDocument();
    });

    expect(screen.getByLabelText('Firstname')).toHaveValue('John');
    expect(screen.getByLabelText('Lastname')).toHaveValue('Doe');
    expect(screen.getByLabelText('Enter new PIN code')).toHaveValue('1234');
    expect(screen.getByLabelText('Enter PIN again')).toHaveValue('1234');
  });

  it('shows name_already_exists error message and preserves the filled form values', async () => {
    defaultProps.onRegister.mockRejectedValue(new Error('name_already_exists'));
    render(<RegisterPinDialog {...defaultProps} showAlias={false} />);

    await userEvent.type(screen.getByLabelText('Firstname'), 'John J.');
    await userEvent.type(screen.getByLabelText('Lastname'), 'Doe');
    await userEvent.type(screen.getByLabelText('Enter new PIN code'), '1234');
    await userEvent.type(screen.getByLabelText('Enter PIN again'), '1234');
    await userEvent.click(screen.getByRole('button', { name: 'Register' }));

    await waitFor(() => {
      expect(
        screen.getByText(
          "Trainee with the same name already exists. Try adding your second first name initial into your first name, For example: 'John J.' and try again."
        )
      ).toBeInTheDocument();
    });

    expect(screen.getByLabelText('Firstname')).toHaveValue('John J.');
    expect(screen.getByLabelText('Lastname')).toHaveValue('Doe');
  });

  it('shows mismatching_aliases message when onRegister throws "mismatching_aliases"', async () => {
    defaultProps.onRegister.mockRejectedValue(new Error('mismatching_aliases'));
    render(<RegisterPinDialog {...defaultProps} />);

    await fillValidForm();
    await userEvent.type(screen.getByLabelText('Alias'), 'JD');
    await userEvent.click(screen.getByRole('button', { name: 'Register' }));

    await waitFor(() => {
      expect(
        screen.getByText('Coach with same name already registered but aliases differ.')
      ).toBeInTheDocument();
    });
  });

  it('shows already_registered message when onRegister throws "already_registered"', async () => {
    defaultProps.onRegister.mockRejectedValue(new Error('already_registered'));
    render(<RegisterPinDialog {...defaultProps} />);

    await fillValidForm();
    await userEvent.click(screen.getByRole('button', { name: 'Register' }));

    await waitFor(() => {
      expect(screen.getByText('You are already registered.')).toBeInTheDocument();
    });
  });

  it('shows pins_do_not_match message when onRegister throws "pins_do_not_match"', async () => {
    defaultProps.onRegister.mockRejectedValue(new Error('pins_do_not_match'));
    render(<RegisterPinDialog {...defaultProps} />);

    await fillValidForm();
    await userEvent.click(screen.getByRole('button', { name: 'Register' }));

    await waitFor(() => {
      expect(
        screen.getByText('Coach with the same name already registered but pins unmatch.')
      ).toBeInTheDocument();
    });
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
    expect(mockToast).toHaveBeenCalledWith('Registration cancelled');
    expect(defaultProps.onCancel).toHaveBeenCalledOnce();
  });

  it('reapplies initial names and underage state each time the dialog is reopened', async () => {
    const { rerender } = render(
      <RegisterPinDialog
        {...defaultProps}
        showAlias={false}
        initialFirstname="Jane"
        initialLastname="Doe"
        initialIsUnderage={true}
        initialAge={12}
      />
    );

    await userEvent.clear(screen.getByLabelText('Firstname'));
    await userEvent.type(screen.getByLabelText('Firstname'), 'Changed');
    await userEvent.clear(screen.getByLabelText('Age:'));
    await userEvent.type(screen.getByLabelText('Age:'), '17');
    await userEvent.type(screen.getByLabelText('Enter new PIN code'), '1234');

    rerender(
      <RegisterPinDialog
        {...defaultProps}
        open={false}
        showAlias={false}
        initialFirstname="Jane"
        initialLastname="Doe"
        initialIsUnderage={true}
        initialAge={12}
      />
    );
    rerender(
      <RegisterPinDialog
        {...defaultProps}
        showAlias={false}
        initialFirstname="Jane"
        initialLastname="Doe"
        initialIsUnderage={true}
        initialAge={12}
      />
    );

    expect(screen.getByLabelText('Firstname')).toHaveValue('Jane');
    expect(screen.getByLabelText('Lastname')).toHaveValue('Doe');
    expect(screen.getByLabelText("I'm under 18 years old")).toBeChecked();
    expect(screen.getByLabelText('Age:')).toHaveValue(12);
    expect(screen.getByLabelText('Enter new PIN code')).toHaveValue('');
    expect(screen.getByLabelText('Enter PIN again')).toHaveValue('');
  });

  // ── Loading overlay (OQM-0005) ────────────────────────────────────────────

  it('shows loading overlay while API call is in progress', async () => {
    let resolveRegister!: () => void;
    const pendingRegister = new Promise<void>(res => { resolveRegister = res; });
    defaultProps.onRegister.mockReturnValue(pendingRegister);

    render(<RegisterPinDialog {...defaultProps} />);
    await fillValidForm();
    await userEvent.click(screen.getByRole('button', { name: 'Register' }));

    expect(screen.getByRole('status')).toBeInTheDocument();

    resolveRegister();
  });

  it('hides loading overlay after API call completes', async () => {
    let resolveRegister!: () => void;
    const pendingRegister = new Promise<void>(res => { resolveRegister = res; });
    defaultProps.onRegister.mockReturnValue(pendingRegister);

    render(<RegisterPinDialog {...defaultProps} />);
    await fillValidForm();
    await userEvent.click(screen.getByRole('button', { name: 'Register' }));

    resolveRegister();
    await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument());
  });

  it('hides loading overlay after API call fails', async () => {
    let rejectRegister!: (err: Error) => void;
    const pendingRegister = new Promise<void>((_res, rej) => { rejectRegister = rej; });
    defaultProps.onRegister.mockReturnValue(pendingRegister);

    render(<RegisterPinDialog {...defaultProps} />);
    await fillValidForm();
    await userEvent.click(screen.getByRole('button', { name: 'Register' }));

    rejectRegister(new Error('Network error'));
    await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument());
  });
});
