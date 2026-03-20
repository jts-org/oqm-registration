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
import { registerTraineePin } from '../../../features/trainee/api/trainee.api';
import { verifyTraineePin } from '../../../features/trainee/api/trainee.api';
import type { TraineeSessionItem } from '../../../features/trainee/types';
import toast from 'react-hot-toast';

vi.mock('../../../features/trainee/api/trainee.api', () => ({
  getTraineeSessions: vi.fn(),
  registerTraineeForSession: vi.fn(),
  registerTraineePin: vi.fn(),
  verifyTraineePin: vi.fn(),
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
const mockRegisterTraineePin = vi.mocked(registerTraineePin);
const mockVerifyTraineePin = vi.mocked(verifyTraineePin);
const mockToast = vi.mocked(toast);

const mockSession: TraineeSessionItem = {
  id: 'ws-1_2026-03-17',
  session_type: 'Basic',
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
    mockVerifyTraineePin.mockResolvedValue({
      id: 'trainee-pin-1',
      firstname: 'Jane',
      lastname: 'Doe',
      age: '25',
      pin: '1234',
      created_at: '2026-01-01T00:00:00Z',
      last_activity: '',
    });
    mockRegisterTraineePin.mockResolvedValue({
      id: 'trainee-pin-1',
      firstname: 'Jane',
      lastname: 'Doe',
      age: '0',
      pin: '1234',
      created_at: '2026-01-01T00:00:00Z',
      last_activity: '',
    });
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

/** Helper: fill the RegisterPinDialog with valid data for Jane Doe. */
async function fillRegisterPinForm(firstname = 'Jane', pin = '1234') {
  await userEvent.type(screen.getByLabelText('Firstname'), firstname);
  await userEvent.type(screen.getByLabelText('Lastname'), 'Doe');
  await userEvent.type(screen.getByLabelText('Enter new PIN code'), pin);
  await userEvent.type(screen.getByLabelText('Enter PIN again'), pin);
}

describe('OQM-0019 — trainee PIN registration from TraineePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetTraineeSessions.mockResolvedValue([mockSession]);
    mockRegisterTraineeForSession.mockResolvedValue('reg-1');
    mockVerifyTraineePin.mockResolvedValue({
      id: 'trainee-pin-1',
      firstname: 'Jane',
      lastname: 'Doe',
      age: '25',
      pin: '1234',
      created_at: '2026-01-01T00:00:00Z',
      last_activity: '',
    });
    mockRegisterTraineePin.mockResolvedValue({
      id: 'trainee-pin-1',
      firstname: 'Jane',
      lastname: 'Doe',
      age: '0',
      pin: '1234',
      created_at: '2026-01-01T00:00:00Z',
      last_activity: '',
    });
  });

  it('opens RegisterPinDialog when Register PIN button is clicked', async () => {
    render(<TraineePage onBack={vi.fn()} />);
    await screen.findByText('Basic');

    await userEvent.click(screen.getByRole('button', { name: 'Register PIN' }));

    expect(screen.getByRole('dialog', { name: 'Register new PIN code' })).toBeInTheDocument();
  });

  it('Alias field is not shown in RegisterPinDialog opened from TraineePage', async () => {
    render(<TraineePage onBack={vi.fn()} />);
    await screen.findByText('Basic');
    await userEvent.click(screen.getByRole('button', { name: 'Register PIN' }));

    expect(screen.queryByLabelText('Alias')).not.toBeInTheDocument();
  });

  it('clicking Cancel closes RegisterPinDialog without changing trainee state', async () => {
    render(<TraineePage onBack={vi.fn()} />);
    await screen.findByText('Basic');
    await userEvent.click(screen.getByRole('button', { name: 'Register PIN' }));

    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Register new PIN code' })).not.toBeInTheDocument();
    });
    expect(screen.getByText('You are not logged in.')).toBeInTheDocument();
  });

  it('calls registerTraineePin with correct payload on Register submit', async () => {
    render(<TraineePage onBack={vi.fn()} />);
    await screen.findByText('Basic');
    await userEvent.click(screen.getByRole('button', { name: 'Register PIN' }));

    await fillRegisterPinForm();
    await userEvent.click(screen.getByRole('button', { name: 'Register' }));

    await waitFor(() => {
      expect(mockRegisterTraineePin).toHaveBeenCalledWith({
        firstname: 'Jane',
        lastname: 'Doe',
        age: '0',
        pin: '1234',
      });
    });
  });

  it('shows progress toast while registration request is pending', async () => {
    let resolveRegister!: () => void;
    mockRegisterTraineePin.mockReturnValue(
      new Promise(resolve => { resolveRegister = () => resolve({ id: 't1', firstname: 'Jane', lastname: 'Doe', age: '0', pin: '1234', created_at: '', last_activity: '' }); })
    );

    render(<TraineePage onBack={vi.fn()} />);
    await screen.findByText('Basic');
    await userEvent.click(screen.getByRole('button', { name: 'Register PIN' }));
    await fillRegisterPinForm();
    await userEvent.click(screen.getByRole('button', { name: 'Register' }));

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith('Registration ongoing. Please wait.');
    });

    resolveRegister();
  });

  it('shows loading overlay while registration request is pending', async () => {
    let resolveRegister!: () => void;
    mockRegisterTraineePin.mockReturnValue(
      new Promise(resolve => { resolveRegister = () => resolve({ id: 't1', firstname: 'Jane', lastname: 'Doe', age: '0', pin: '1234', created_at: '', last_activity: '' }); })
    );

    render(<TraineePage onBack={vi.fn()} />);
    await screen.findByText('Basic');
    await userEvent.click(screen.getByRole('button', { name: 'Register PIN' }));
    await fillRegisterPinForm();
    await userEvent.click(screen.getByRole('button', { name: 'Register' }));

    await waitFor(() => {
      expect(screen.getByRole('status', { name: 'Loading' })).toBeInTheDocument();
    });

    resolveRegister();
  });

  it('successful registration closes dialog, updates login state, and disables Register PIN and Login buttons', async () => {
    render(<TraineePage onBack={vi.fn()} />);
    await screen.findByText('Basic');
    await userEvent.click(screen.getByRole('button', { name: 'Register PIN' }));
    await fillRegisterPinForm();
    await userEvent.click(screen.getByRole('button', { name: 'Register' }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Register new PIN code' })).not.toBeInTheDocument();
    });
    expect(screen.getByText('Logged in: Jane Doe.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Register PIN' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Login' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Log out' })).not.toBeDisabled();
  });

  it('concurrent_request error keeps dialog open with correct message', async () => {
    mockRegisterTraineePin.mockRejectedValue(new Error('concurrent_request'));

    render(<TraineePage onBack={vi.fn()} />);
    await screen.findByText('Basic');
    await userEvent.click(screen.getByRole('button', { name: 'Register PIN' }));
    await fillRegisterPinForm();
    await userEvent.click(screen.getByRole('button', { name: 'Register' }));

    await waitFor(() => {
      expect(screen.getByText('Concurrent operation ongoing. Please try again.')).toBeInTheDocument();
    });
    expect(screen.getByRole('dialog', { name: 'Register new PIN code', hidden: true })).toBeInTheDocument();
  });

  it('pin_reserved error keeps dialog open with correct message', async () => {
    mockRegisterTraineePin.mockRejectedValue(new Error('pin_reserved'));

    render(<TraineePage onBack={vi.fn()} />);
    await screen.findByText('Basic');
    await userEvent.click(screen.getByRole('button', { name: 'Register PIN' }));
    await fillRegisterPinForm();
    await userEvent.click(screen.getByRole('button', { name: 'Register' }));

    await waitFor(() => {
      expect(screen.getByText('PIN code reserved. Choose different PIN code.')).toBeInTheDocument();
    });
    expect(screen.getByRole('dialog', { name: 'Register new PIN code', hidden: true })).toBeInTheDocument();
  });

  it('name_already_exists error keeps dialog open with correct message', async () => {
    mockRegisterTraineePin.mockRejectedValue(new Error('name_already_exists'));

    render(<TraineePage onBack={vi.fn()} />);
    await screen.findByText('Basic');
    await userEvent.click(screen.getByRole('button', { name: 'Register PIN' }));
    await fillRegisterPinForm();
    await userEvent.click(screen.getByRole('button', { name: 'Register' }));

    await waitFor(() => {
      expect(screen.getByText(/Trainee with the same name already exists/)).toBeInTheDocument();
    });
    expect(screen.getByRole('dialog', { name: 'Register new PIN code', hidden: true })).toBeInTheDocument();
  });

  it('Logout clears trainee state and re-enables Login and Register PIN buttons', async () => {
    render(<TraineePage onBack={vi.fn()} />);
    await screen.findByText('Basic');

    // Register a PIN to log in
    await userEvent.click(screen.getByRole('button', { name: 'Register PIN' }));
    await fillRegisterPinForm();
    await userEvent.click(screen.getByRole('button', { name: 'Register' }));
    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Register new PIN code' })).not.toBeInTheDocument();
    });
    expect(screen.getByText('Logged in: Jane Doe.')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Log out' }));

    expect(screen.getByText('You are not logged in.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Login' })).not.toBeDisabled();
    expect(screen.getByRole('button', { name: 'Register PIN' })).not.toBeDisabled();
    expect(screen.getByRole('button', { name: 'Log out' })).toBeDisabled();
  });

  it('prefills first and last name from pendingTraineeData when opening Register PIN dialog', async () => {
    render(<TraineePage onBack={vi.fn()} />);
    await screen.findByText('Basic');

    // Register for a session (sets pendingTraineeData) — Register PIN remains enabled
    await userEvent.click(screen.getByRole('button', { name: 'Register' }));
    await userEvent.type(screen.getByLabelText('First name:'), 'Jane');
    await userEvent.type(screen.getByLabelText('Last name:'), 'Doe');
    await userEvent.click(screen.getByRole('button', { name: 'Ok' }));
    const confirmDialog = await screen.findByRole('dialog', { name: 'Confirm Registration' });
    await userEvent.click(within(confirmDialog).getByRole('button', { name: 'Ok' }));
    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Confirm Registration' })).not.toBeInTheDocument();
    });
    expect(screen.getByText('Logged in: Jane Doe.')).toBeInTheDocument();

    // Register PIN should still be enabled (only disabled after PIN registration success)
    expect(screen.getByRole('button', { name: 'Register PIN' })).not.toBeDisabled();

    await userEvent.click(screen.getByRole('button', { name: 'Register PIN' }));
    await screen.findByRole('dialog', { name: 'Register new PIN code' });

    expect(screen.getByLabelText('Firstname')).toHaveValue('Jane');
    expect(screen.getByLabelText('Lastname')).toHaveValue('Doe');
  });
});

describe('OQM-0020 — trainee PIN login from TraineePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetTraineeSessions.mockResolvedValue([mockSession]);
    mockRegisterTraineeForSession.mockResolvedValue('reg-1');
    mockRegisterTraineePin.mockResolvedValue({
      id: 'trainee-pin-1',
      firstname: 'Jane',
      lastname: 'Doe',
      age: '25',
      pin: '1234',
      created_at: '2026-01-01T00:00:00Z',
      last_activity: '',
    });
    mockVerifyTraineePin.mockResolvedValue({
      id: 'trainee-pin-1',
      firstname: 'Jane',
      lastname: 'Doe',
      age: '25',
      pin: '1234',
      created_at: '2026-01-01T00:00:00Z',
      last_activity: '',
    });
  });

  it('opens TraineeLoginDialog when Login button is clicked', async () => {
    render(<TraineePage onBack={vi.fn()} />);
    await screen.findByText('Basic');

    await userEvent.click(screen.getByRole('button', { name: 'Login' }));

    expect(screen.getByRole('dialog', { name: 'Trainee login' })).toBeInTheDocument();
  });

  it('Verify button is disabled when PIN has fewer than 4 digits', async () => {
    render(<TraineePage onBack={vi.fn()} />);
    await screen.findByText('Basic');
    await userEvent.click(screen.getByRole('button', { name: 'Login' }));

    const dialog = screen.getByRole('dialog', { name: 'Trainee login' });
    await userEvent.type(within(dialog).getByLabelText('Enter PIN code'), '123');

    expect(within(dialog).getByRole('button', { name: 'Verify' })).toBeDisabled();
  });

  it('Verify button is enabled after 4 digits are entered', async () => {
    render(<TraineePage onBack={vi.fn()} />);
    await screen.findByText('Basic');
    await userEvent.click(screen.getByRole('button', { name: 'Login' }));

    const dialog = screen.getByRole('dialog', { name: 'Trainee login' });
    await userEvent.type(within(dialog).getByLabelText('Enter PIN code'), '1234');

    expect(within(dialog).getByRole('button', { name: 'Verify' })).not.toBeDisabled();
  });

  it('Verify button becomes disabled again when digits are cleared below 4', async () => {
    render(<TraineePage onBack={vi.fn()} />);
    await screen.findByText('Basic');
    await userEvent.click(screen.getByRole('button', { name: 'Login' }));

    const dialog = screen.getByRole('dialog', { name: 'Trainee login' });
    const pinInput = within(dialog).getByLabelText('Enter PIN code');
    await userEvent.type(pinInput, '1234');
    await userEvent.clear(pinInput);
    await userEvent.type(pinInput, '12');

    expect(within(dialog).getByRole('button', { name: 'Verify' })).toBeDisabled();
  });

  it('shows progress toast while verification is pending', async () => {
    let resolve!: () => void;
    mockVerifyTraineePin.mockReturnValue(
      new Promise(res => { resolve = () => res({ id: 't1', firstname: 'Jane', lastname: 'Doe', age: '25', pin: '1234', created_at: '', last_activity: '' }); })
    );

    render(<TraineePage onBack={vi.fn()} />);
    await screen.findByText('Basic');
    await userEvent.click(screen.getByRole('button', { name: 'Login' }));

    const dialog = screen.getByRole('dialog', { name: 'Trainee login' });
    await userEvent.type(within(dialog).getByLabelText('Enter PIN code'), '1234');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Verify' }));

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith('PIN verification ongoing. Please wait.');
    });

    resolve();
  });

  it('shows loading overlay while verification is pending', async () => {
    let resolve!: () => void;
    mockVerifyTraineePin.mockReturnValue(
      new Promise(res => { resolve = () => res({ id: 't1', firstname: 'Jane', lastname: 'Doe', age: '25', pin: '1234', created_at: '', last_activity: '' }); })
    );

    render(<TraineePage onBack={vi.fn()} />);
    await screen.findByText('Basic');
    await userEvent.click(screen.getByRole('button', { name: 'Login' }));

    const dialog = screen.getByRole('dialog', { name: 'Trainee login' });
    await userEvent.type(within(dialog).getByLabelText('Enter PIN code'), '1234');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Verify' }));

    await waitFor(() => {
      expect(screen.getByRole('status', { name: 'Loading' })).toBeInTheDocument();
    });

    resolve();
  });

  it('successful verification closes dialog, sets trainee state, disables Login and Register PIN, enables Logout', async () => {
    render(<TraineePage onBack={vi.fn()} />);
    await screen.findByText('Basic');
    await userEvent.click(screen.getByRole('button', { name: 'Login' }));

    const dialog = screen.getByRole('dialog', { name: 'Trainee login' });
    await userEvent.type(within(dialog).getByLabelText('Enter PIN code'), '1234');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Verify' }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Trainee login' })).not.toBeInTheDocument();
    });

    expect(screen.getByText('Logged in: Jane Doe.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Login' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Register PIN' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Log out' })).not.toBeDisabled();
  });

  it('successful verification shows success toast', async () => {
    render(<TraineePage onBack={vi.fn()} />);
    await screen.findByText('Basic');
    await userEvent.click(screen.getByRole('button', { name: 'Login' }));

    const dialog = screen.getByRole('dialog', { name: 'Trainee login' });
    await userEvent.type(within(dialog).getByLabelText('Enter PIN code'), '1234');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Verify' }));

    await waitFor(() => {
      expect(mockToast.success).toHaveBeenCalledWith('PIN verified succesfully.');
    });
  });

  it('no_match_found keeps dialog open and shows error message', async () => {
    mockVerifyTraineePin.mockRejectedValue(new Error('no_match_found'));

    render(<TraineePage onBack={vi.fn()} />);
    await screen.findByText('Basic');
    await userEvent.click(screen.getByRole('button', { name: 'Login' }));

    const dialog = screen.getByRole('dialog', { name: 'Trainee login' });
    await userEvent.type(within(dialog).getByLabelText('Enter PIN code'), '1234');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Verify' }));

    await waitFor(() => {
      expect(screen.getByText('Invalid PIN. Try again.')).toBeInTheDocument();
    });
    expect(screen.getByRole('dialog', { name: 'Trainee login' })).toBeInTheDocument();
    expect(screen.getByText('You are not logged in.')).toBeInTheDocument();
  });

  it('Cancel closes TraineeLoginDialog without changing trainee state', async () => {
    render(<TraineePage onBack={vi.fn()} />);
    await screen.findByText('Basic');
    await userEvent.click(screen.getByRole('button', { name: 'Login' }));

    const dialog = screen.getByRole('dialog', { name: 'Trainee login' });
    await userEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Trainee login' })).not.toBeInTheDocument();
    });
    expect(screen.getByText('You are not logged in.')).toBeInTheDocument();
  });

  it('Cancel shows cancellation toast', async () => {
    render(<TraineePage onBack={vi.fn()} />);
    await screen.findByText('Basic');
    await userEvent.click(screen.getByRole('button', { name: 'Login' }));

    const dialog = screen.getByRole('dialog', { name: 'Trainee login' });
    await userEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }));

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith('Verification cancelled.');
    });
  });

  it('Logout after PIN login clears trainee state and re-enables Login and Register PIN', async () => {
    render(<TraineePage onBack={vi.fn()} />);
    await screen.findByText('Basic');
    await userEvent.click(screen.getByRole('button', { name: 'Login' }));

    const dialog = screen.getByRole('dialog', { name: 'Trainee login' });
    await userEvent.type(within(dialog).getByLabelText('Enter PIN code'), '1234');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Verify' }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Trainee login' })).not.toBeInTheDocument();
    });
    expect(screen.getByText('Logged in: Jane Doe.')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Log out' }));

    expect(screen.getByText('You are not logged in.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Login' })).not.toBeDisabled();
    expect(screen.getByRole('button', { name: 'Register PIN' })).not.toBeDisabled();
    expect(screen.getByRole('button', { name: 'Log out' })).toBeDisabled();
  });

  it('Logout after PIN login calls getTraineeSessions to refresh', async () => {
    render(<TraineePage onBack={vi.fn()} />);
    await screen.findByText('Basic');
    await userEvent.click(screen.getByRole('button', { name: 'Login' }));

    const dialog = screen.getByRole('dialog', { name: 'Trainee login' });
    await userEvent.type(within(dialog).getByLabelText('Enter PIN code'), '1234');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Verify' }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Trainee login' })).not.toBeInTheDocument();
    });

    const callsBefore = mockGetTraineeSessions.mock.calls.length;
    await userEvent.click(screen.getByRole('button', { name: 'Log out' }));

    await waitFor(() => {
      expect(mockGetTraineeSessions.mock.calls.length).toBeGreaterThan(callsBefore);
    });
  });
});
