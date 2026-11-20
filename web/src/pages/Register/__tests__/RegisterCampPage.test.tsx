import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import toast from 'react-hot-toast';
import { i18n } from '../../../lib/i18n';
import * as api from '../../../features/trainee/api/trainee.api';
import { RegisterCustomerEventPage } from '../RegisterCustomerEventPage';

vi.mock('../../../features/trainee/api/trainee.api');
vi.mock('react-hot-toast', () => ({ default: { success: vi.fn(), error: vi.fn() } }));

const event = {
  id: 'camp 1', event: 'Camp', event_alias: 'Camp', instructor: 'Coach',
  start_date: '2026-04-01', end_date: '2026-04-02', realized: true, created_at: '', updated_at: '',
};
const sessions = ['First', 'Second'].map((name, index) => ({
  id: `s${index + 1}`, event_id: event.id, session_name: name, session_name_alias: '',
  date: `2026-04-0${index + 1}`, start_time: '10:00', end_time: '11:00',
  realized: true, created_at: '', updated_at: '',
}));

function renderCamp() {
  return render(<MemoryRouter initialEntries={['/register?camp=camp%201']}>
    <RegisterCustomerEventPage camp />
  </MemoryRouter>);
}

beforeEach(async () => {
  vi.resetAllMocks();
  await i18n.changeLanguage('en');
});

describe('camp registration', () => {
  it('does not display sharing controls and submits only the explicitly confirmed subset', async () => {
    vi.mocked(api.resolveCamp).mockResolvedValue({ event, sessions });
    vi.mocked(api.registerTraineeBatchForCamp).mockResolvedValue({ registrations: [] });
    const user = userEvent.setup();
    renderCamp();
    expect(await screen.findByText('Select training sessions')).toBeInTheDocument();
    expect(screen.queryByText('Share this camp registration link')).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /register\?camp=/i })).not.toBeInTheDocument();
    expect(screen.queryByTitle('QR code for the camp registration link')).not.toBeInTheDocument();
    expect(api.resolveCamp).toHaveBeenCalledWith('camp 1');
    await user.click(screen.getByRole('button', { name: 'Deselect all' }));
    await user.type(screen.getByLabelText('First name'), 'Jane');
    await user.type(screen.getByLabelText('Last name'), 'Doe');
    expect(screen.getByRole('button', { name: 'Confirm Registration' })).toBeDisabled();
    await user.click(screen.getByRole('checkbox', { name: /First/ }));
    await user.click(screen.getByRole('button', { name: 'Confirm Registration' }));
    expect(api.registerTraineeBatchForCamp).not.toHaveBeenCalled();
    expect(screen.getByRole('checkbox', { name: /First/ })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Submit Registration' }));
    await waitFor(() => expect(api.registerTraineeBatchForCamp).toHaveBeenCalledWith({
      camp: 'camp 1', schedule_ids: ['s1'], first_name: 'Jane', last_name: 'Doe', age_group: 'adult',
      schedules: [{ id: 's1', session_name: 'First', date: '2026-04-01', start_time: '10:00', end_time: '11:00' }],
    }));
    expect(api.registerTraineeBatchForCustomerEvent).not.toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalled();
  });

  it('shows an invalid camp or empty schedule without a registration form', async () => {
    vi.mocked(api.resolveCamp).mockRejectedValueOnce(new Error('validation_failed'));
    const first = renderCamp();
    expect(await screen.findByText(/This camp is invalid/)).toBeInTheDocument();
    first.unmount();
    vi.mocked(api.resolveCamp).mockResolvedValueOnce({ event, sessions: [] });
    renderCamp();
    expect(await screen.findByText(/No training sessions are available for this camp/)).toBeInTheDocument();
    expect(screen.queryByLabelText('First name')).not.toBeInTheDocument();
  });

  it('shows duplicate registration errors inline', async () => {
    vi.mocked(api.resolveCamp).mockResolvedValue({ event, sessions: [sessions[0]] });
    vi.mocked(api.registerTraineeBatchForCamp).mockRejectedValue(new Error('already_registered'));
    const user = userEvent.setup();
    renderCamp();
    await user.type(await screen.findByLabelText('First name'), 'Jane');
    await user.type(screen.getByLabelText('Last name'), 'Doe');
    await user.click(screen.getByRole('button', { name: 'Confirm Registration' }));
    await user.click(screen.getByRole('button', { name: 'Submit Registration' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/already registered/i);
  });
});
