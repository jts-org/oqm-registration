import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

import '../../../lib/i18n';
import { i18n } from '../../../lib/i18n';
import { resolveSessionSelector, verifyTraineePin } from '../../../features/trainee/api/trainee.api';
import { RegisterPage } from '../RegisterPage';

vi.mock('../../../features/trainee/api/trainee.api', () => ({
  resolveSessionSelector: vi.fn(),
  verifyTraineePin: vi.fn(),
}));

const mockedResolveSessionSelector = vi.mocked(resolveSessionSelector);
const mockedVerifyTraineePin = vi.mocked(verifyTraineePin);

function renderRegisterPage(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <RegisterPage />
    </MemoryRouter>,
  );
}

describe('RegisterPage language variants', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await i18n.changeLanguage('en');
    mockedResolveSessionSelector.mockResolvedValue({
      selector: 'sparring',
      session: {
        id: 'session-1',
        date: '2026-08-23',
        start_time: '18:00',
        end_time: '19:00',
        session_type: 'Sparring',
        session_type_alias: 'Sparring',
        location: '',
        coach_firstname: '',
        coach_lastname: '',
        camp_instructor_name: '',
        is_free_sparring: true,
      },
      resolved_session_type: 'Sparring',
      date: '2026-08-23',
    });
  });

  it('renders English QR text for an explicit English URL variant', async () => {
    renderRegisterPage('/register?session=sparring&language=EN');

    expect(await screen.findByRole('heading', { name: 'Register via QR' })).toBeInTheDocument();
  });

  it('renders Finnish QR text for an explicit Finnish URL variant', async () => {
    renderRegisterPage('/register?session=sparring&language=fi');

    expect(await screen.findByRole('heading', { name: 'Rekisteröidy QR-koodin kautta' })).toBeInTheDocument();
  });

  it('preserves the existing language when the URL has no language parameter', async () => {
    await i18n.changeLanguage('fi');

    renderRegisterPage('/register?session=sparring');

    expect(await screen.findByRole('heading', { name: 'Rekisteröidy QR-koodin kautta' })).toBeInTheDocument();
  });

  it('preserves the existing language for an unsupported URL language', async () => {
    await i18n.changeLanguage('fi');

    renderRegisterPage('/register?session=sparring&language=sv');

    expect(await screen.findByRole('heading', { name: 'Rekisteröidy QR-koodin kautta' })).toBeInTheDocument();
  });

  it('opens the PIN dialog before identity fields after Continue', async () => {
    const user = userEvent.setup();
    renderRegisterPage('/register?session=sparring');

    await user.click(await screen.findByRole('button', { name: 'Continue' }));

    expect(screen.getByRole('heading', { name: 'Enter your PIN to register' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Fill your information' })).not.toBeInTheDocument();
  });

  it('uses verified trainee information without asking for names again', async () => {
    const user = userEvent.setup();
    mockedVerifyTraineePin.mockResolvedValue({
      id: 'trainee-1',
      firstname: 'Aino',
      lastname: 'Example',
      age: '22',
      pin: '1234',
      created_at: '',
      last_activity: '',
    });
    renderRegisterPage('/register?session=sparring');

    await user.click(await screen.findByRole('button', { name: 'Continue' }));
    await user.type(screen.getByLabelText('Enter PIN code'), '1234');
    await user.click(screen.getByRole('button', { name: 'Verify' }));

    expect(await screen.findByRole('heading', { name: 'Confirm Registration' })).toBeInTheDocument();
    expect(screen.getByText('Aino Example')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Fill your information' })).not.toBeInTheDocument();
  });

  it('preserves verified underage age 16 in QR confirmation', async () => {
    const user = userEvent.setup();
    mockedVerifyTraineePin.mockResolvedValue({
      id: 'trainee-1', firstname: 'Aino', lastname: 'Example', age: '16', pin: '1234', created_at: '', last_activity: '',
    });
    renderRegisterPage('/register?session=sparring');

    await user.click(await screen.findByRole('button', { name: 'Continue' }));
    await user.type(screen.getByLabelText('Enter PIN code'), '1234');
    await user.click(screen.getByRole('button', { name: 'Verify' }));

    expect(await screen.findByText('16')).toBeInTheDocument();
  });

  it('treats verified adult age sentinel 0 as adult in QR confirmation', async () => {
    const user = userEvent.setup();
    mockedVerifyTraineePin.mockResolvedValue({
      id: 'trainee-1', firstname: 'Aino', lastname: 'Example', age: '0', pin: '1234', created_at: '', last_activity: '',
    });
    renderRegisterPage('/register?session=sparring');

    await user.click(await screen.findByRole('button', { name: 'Continue' }));
    await user.type(screen.getByLabelText('Enter PIN code'), '1234');
    await user.click(screen.getByRole('button', { name: 'Verify' }));

    expect(await screen.findByRole('heading', { name: 'Confirm Registration' })).toBeInTheDocument();
    expect(screen.queryByText('Age: 0')).not.toBeInTheDocument();
  });

  it('allows invalid PIN verification to fall back to manual entry', async () => {
    const user = userEvent.setup();
    mockedVerifyTraineePin.mockRejectedValue(new Error('no_match_found'));
    renderRegisterPage('/register?session=sparring');

    await user.click(await screen.findByRole('button', { name: 'Continue' }));
    await user.type(screen.getByLabelText('Enter PIN code'), '1234');
    await user.click(screen.getByRole('button', { name: 'Verify' }));
    expect(await screen.findByText('Invalid PIN. Try again.')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Enter information manually' }));
    expect(await screen.findByRole('heading', { name: 'Fill your information' })).toBeInTheDocument();
  });

  it('rejects blank manual names before confirmation', async () => {
    const user = userEvent.setup();
    renderRegisterPage('/register?session=sparring');

    await user.click(await screen.findByRole('button', { name: 'Continue' }));
    await user.click(screen.getByRole('button', { name: 'Enter information manually' }));

    expect(screen.getByRole('button', { name: 'Ok' })).toBeDisabled();
    expect(screen.queryByRole('heading', { name: 'Confirm Registration' })).not.toBeInTheDocument();
  });
});