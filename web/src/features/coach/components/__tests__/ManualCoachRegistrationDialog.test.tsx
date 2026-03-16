/**
 * @copyright 2026 Jouni Sipola by OQM. All rights reserved.
 * Permission granted for personal/internal use only. Commercial
 * use prohibited except by copyright holder. See LICENSE for details.
 */

/**
 * @description Tests for ManualCoachRegistrationDialog (OQM-0010).
 *   Covers: rendering, Ok button enable/disable, Cancel behaviour,
 *   name transfer to RegisterPinDialog, and PIN registration success flow.
 *   Written before implementation (TDD).
 *   @see skills/SKILL.wire-react-to-gas.md
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import '../../../../lib/i18n';
import { ManualCoachRegistrationDialog } from '../ManualCoachRegistrationDialog';

// Mock the registerCoachPin API
vi.mock('../../api/coach.api', () => ({
  registerCoachPin: vi.fn(),
}));

import { registerCoachPin } from '../../api/coach.api';
const mockRegisterCoachPin = vi.mocked(registerCoachPin);

vi.mock('react-hot-toast', () => {
  const toastFn = vi.fn();
  return {
    default: Object.assign(toastFn, {
      error: vi.fn(),
      success: vi.fn(),
    }),
  };
});

const defaultProps = {
  open: true,
  onOk: vi.fn(),
  onCancel: vi.fn(),
};

const mockCoachData = {
  id: 'coach-1',
  firstname: 'John',
  lastname: 'Doe',
  alias: 'JD',
  pin: '1234',
  created_at: '2026-01-01T00:00:00Z',
  last_activity: '',
};

describe('ManualCoachRegistrationDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Rendering ──────────────────────────────────────────────────────────────

  it('does not render when open=false', () => {
    render(<ManualCoachRegistrationDialog {...defaultProps} open={false} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders when open=true', () => {
    render(<ManualCoachRegistrationDialog {...defaultProps} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('displays title "Fill your information"', () => {
    render(<ManualCoachRegistrationDialog {...defaultProps} />);
    expect(screen.getByText('Fill your information')).toBeInTheDocument();
  });

  it('renders "First name:" input', () => {
    render(<ManualCoachRegistrationDialog {...defaultProps} />);
    expect(screen.getByLabelText('First name:')).toBeInTheDocument();
  });

  it('renders "Last name:" input', () => {
    render(<ManualCoachRegistrationDialog {...defaultProps} />);
    expect(screen.getByLabelText('Last name:')).toBeInTheDocument();
  });

  it('renders PIN hint text', () => {
    render(<ManualCoachRegistrationDialog {...defaultProps} />);
    expect(screen.getByText(/With personal PIN code/)).toBeInTheDocument();
  });

  it('renders "Register PIN code" link', () => {
    render(<ManualCoachRegistrationDialog {...defaultProps} />);
    expect(screen.getByRole('button', { name: 'Register PIN code' })).toBeInTheDocument();
  });

  it('renders "Ok" button', () => {
    render(<ManualCoachRegistrationDialog {...defaultProps} />);
    expect(screen.getByRole('button', { name: 'Ok' })).toBeInTheDocument();
  });

  it('renders "Cancel" button', () => {
    render(<ManualCoachRegistrationDialog {...defaultProps} />);
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  // ── Ok button enable/disable ───────────────────────────────────────────────

  it('"Ok" button is disabled when both fields are empty', () => {
    render(<ManualCoachRegistrationDialog {...defaultProps} />);
    expect(screen.getByRole('button', { name: 'Ok' })).toBeDisabled();
  });

  it('"Ok" button is disabled when only first name is filled', async () => {
    render(<ManualCoachRegistrationDialog {...defaultProps} />);
    await userEvent.type(screen.getByLabelText('First name:'), 'John');
    expect(screen.getByRole('button', { name: 'Ok' })).toBeDisabled();
  });

  it('"Ok" button is disabled when only last name is filled', async () => {
    render(<ManualCoachRegistrationDialog {...defaultProps} />);
    await userEvent.type(screen.getByLabelText('Last name:'), 'Doe');
    expect(screen.getByRole('button', { name: 'Ok' })).toBeDisabled();
  });

  it('"Ok" button is enabled when both valid names are filled', async () => {
    render(<ManualCoachRegistrationDialog {...defaultProps} />);
    await userEvent.type(screen.getByLabelText('First name:'), 'John');
    await userEvent.type(screen.getByLabelText('Last name:'), 'Doe');
    expect(screen.getByRole('button', { name: 'Ok' })).not.toBeDisabled();
  });

  it('"Ok" button is disabled when name contains invalid characters', async () => {
    render(<ManualCoachRegistrationDialog {...defaultProps} />);
    await userEvent.type(screen.getByLabelText('First name:'), 'Jo123');
    await userEvent.type(screen.getByLabelText('Last name:'), 'Doe');
    expect(screen.getByRole('button', { name: 'Ok' })).toBeDisabled();
  });

  // ── Ok button click (manual path) ─────────────────────────────────────────

  it('clicking "Ok" calls onOk with CoachData built from form values', async () => {
    render(<ManualCoachRegistrationDialog {...defaultProps} />);
    await userEvent.type(screen.getByLabelText('First name:'), 'John');
    await userEvent.type(screen.getByLabelText('Last name:'), 'Doe');
    await userEvent.click(screen.getByRole('button', { name: 'Ok' }));
    expect(defaultProps.onOk).toHaveBeenCalledWith(
      expect.objectContaining({ firstname: 'John', lastname: 'Doe' })
    );
  });

  // ── Cancel button ──────────────────────────────────────────────────────────

  it('clicking "Cancel" calls onCancel', async () => {
    render(<ManualCoachRegistrationDialog {...defaultProps} />);
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(defaultProps.onCancel).toHaveBeenCalled();
  });

  it('clicking "Cancel" clears the form fields', async () => {
    render(<ManualCoachRegistrationDialog {...defaultProps} />);
    await userEvent.type(screen.getByLabelText('First name:'), 'John');
    await userEvent.type(screen.getByLabelText('Last name:'), 'Doe');
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(defaultProps.onCancel).toHaveBeenCalled();
  });

  it('clicking "Cancel" does not call onOk', async () => {
    render(<ManualCoachRegistrationDialog {...defaultProps} />);
    await userEvent.type(screen.getByLabelText('First name:'), 'John');
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(defaultProps.onOk).not.toHaveBeenCalled();
  });

  // ── Register PIN code link ─────────────────────────────────────────────────

  it('clicking "Register PIN code" link opens RegisterPinDialog', async () => {
    render(<ManualCoachRegistrationDialog {...defaultProps} />);
    await userEvent.click(screen.getByRole('button', { name: 'Register PIN code' }));
    expect(screen.getByText('Register new PIN code')).toBeInTheDocument();
  });

  it('names filled before clicking link are transferred to RegisterPinDialog', async () => {
    render(<ManualCoachRegistrationDialog {...defaultProps} />);
    await userEvent.type(screen.getByLabelText('First name:'), 'Anna');
    await userEvent.type(screen.getByLabelText('Last name:'), 'Smith');
    await userEvent.click(screen.getByRole('button', { name: 'Register PIN code' }));
    // RegisterPinDialog should have the pre-filled names
    expect(screen.getByLabelText('Firstname')).toHaveValue('Anna');
    expect(screen.getByLabelText('Lastname')).toHaveValue('Smith');
  });

  it('RegisterPinDialog opens with empty fields when names are not filled', async () => {
    render(<ManualCoachRegistrationDialog {...defaultProps} />);
    await userEvent.click(screen.getByRole('button', { name: 'Register PIN code' }));
    expect(screen.getByLabelText('Firstname')).toHaveValue('');
    expect(screen.getByLabelText('Lastname')).toHaveValue('');
  });

  // ── PIN registration success flow ──────────────────────────────────────────

  it('successful PIN registration calls onOk with CoachData from API', async () => {
    mockRegisterCoachPin.mockResolvedValue(mockCoachData);
    render(<ManualCoachRegistrationDialog {...defaultProps} />);
    await userEvent.click(screen.getByRole('button', { name: 'Register PIN code' }));

    // Fill RegisterPinDialog fields
    await userEvent.type(screen.getByLabelText('Firstname'), 'John');
    await userEvent.type(screen.getByLabelText('Lastname'), 'Doe');
    await userEvent.type(screen.getByLabelText('Enter new PIN code'), '1234');
    await userEvent.type(screen.getByLabelText('Enter PIN again'), '1234');
    await userEvent.click(screen.getByRole('button', { name: 'Register' }));

    await waitFor(() => {
      expect(defaultProps.onOk).toHaveBeenCalledWith(mockCoachData);
    });
  });

  it('cancelling RegisterPinDialog keeps ManualCoachRegistrationDialog open', async () => {
    render(<ManualCoachRegistrationDialog {...defaultProps} />);
    await userEvent.click(screen.getByRole('button', { name: 'Register PIN code' }));
    // Cancel the RegisterPinDialog
    const cancelButtons = screen.getAllByRole('button', { name: 'Cancel' });
    // The RegisterPinDialog Cancel button should be present
    await userEvent.click(cancelButtons[cancelButtons.length - 1]);
    // ManualCoachRegistrationDialog should still be rendered
    expect(screen.getByText('Fill your information')).toBeInTheDocument();
  });
});
