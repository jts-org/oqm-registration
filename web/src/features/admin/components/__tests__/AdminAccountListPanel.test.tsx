/**
 * @copyright 2026 Jouni Sipola by OQM. All rights reserved.
 * Permission granted for personal/internal use only. Commercial
 * use prohibited except by copyright holder. See LICENSE for details.
 */

import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import '../../../../lib/i18n';
import { AdminAccountListPanel } from '../AdminAccountListPanel';

vi.mock('../../api/admin.api', () => ({
  listCoachAccounts: vi.fn().mockResolvedValue({ accounts: [] }),
  listTraineeAccounts: vi.fn().mockResolvedValue({ accounts: [] }),
  createCoachAccount: vi.fn().mockResolvedValue({ account: {} }),
  createTraineeAccount: vi.fn().mockResolvedValue({ account: {} }),
  updateCoachAccount: vi.fn().mockResolvedValue({ account: {} }),
  updateTraineeAccount: vi.fn().mockResolvedValue({ account: {} }),
  deleteCoachAccount: vi.fn().mockResolvedValue({ id: 'coach-1' }),
  deleteTraineeAccount: vi.fn().mockResolvedValue({ id: 'trainee-1' }),
}));

import {
  createCoachAccount,
  createTraineeAccount,
  deleteCoachAccount,
  deleteTraineeAccount,
  listCoachAccounts,
  listTraineeAccounts,
  updateCoachAccount,
  updateTraineeAccount,
} from '../../api/admin.api';

const mockListCoachAccounts = vi.mocked(listCoachAccounts);
const mockListTraineeAccounts = vi.mocked(listTraineeAccounts);
const mockCreateCoachAccount = vi.mocked(createCoachAccount);
const mockCreateTraineeAccount = vi.mocked(createTraineeAccount);
const mockUpdateCoachAccount = vi.mocked(updateCoachAccount);
const mockUpdateTraineeAccount = vi.mocked(updateTraineeAccount);
const mockDeleteCoachAccount = vi.mocked(deleteCoachAccount);
const mockDeleteTraineeAccount = vi.mocked(deleteTraineeAccount);

describe('AdminAccountListPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockListCoachAccounts.mockResolvedValue({ accounts: [] });
    mockListTraineeAccounts.mockResolvedValue({ accounts: [] });
    mockCreateCoachAccount.mockResolvedValue({
      account: {
        id: 'coach-new',
        firstname: 'New',
        lastname: 'Coach',
        alias: 'NC',
        pin: '1234',
        created_at: '2026-07-10T00:00:00.000Z',
        last_activity: '',
      },
    });
    mockCreateTraineeAccount.mockResolvedValue({
      account: {
        id: 'trainee-new',
        firstname: 'New',
        lastname: 'Trainee',
        age: '14',
        pin: '9876',
        created_at: '2026-07-10T00:00:00.000Z',
        last_activity: '',
      },
    });
    mockUpdateCoachAccount.mockResolvedValue({
      account: {
        id: 'coach-1',
        firstname: 'Aki',
        lastname: 'Korpi',
        alias: 'AK',
        pin: '1234',
        created_at: '2026-07-10T00:00:00.000Z',
        last_activity: '',
      },
    });
    mockUpdateTraineeAccount.mockResolvedValue({
      account: {
        id: 'trainee-1',
        firstname: 'Liisa',
        lastname: 'Maki',
        age: '12',
        pin: '4321',
        created_at: '2026-07-10T00:00:00.000Z',
        last_activity: '',
      },
    });
    mockDeleteCoachAccount.mockResolvedValue({ id: 'coach-1' });
    mockDeleteTraineeAccount.mockResolvedValue({ id: 'trainee-1' });
  });

  it('loads both account lists on mount', async () => {
    render(<AdminAccountListPanel sessionToken="token-1" />);

    await waitFor(() => expect(mockListCoachAccounts).toHaveBeenCalledWith('token-1'));
    await waitFor(() => expect(mockListTraineeAccounts).toHaveBeenCalledWith('token-1'));
  });

  it('creates a coach account and refreshes account lists', async () => {
    render(<AdminAccountListPanel sessionToken="token-1" />);

    await waitFor(() => expect(mockListCoachAccounts).toHaveBeenCalledTimes(1));

    await userEvent.click(screen.getByRole('button', { name: 'Create coach account' }));

    const dialog = screen.getByRole('dialog');
    await userEvent.type(within(dialog).getByRole('textbox', { name: 'First name' }), 'Aki');
    await userEvent.type(within(dialog).getByRole('textbox', { name: 'Last name' }), 'Korpi');
    await userEvent.type(within(dialog).getByRole('textbox', { name: 'Alias' }), 'AK');
    await userEvent.type(within(dialog).getByRole('textbox', { name: 'PIN' }), '1234');

    await userEvent.click(within(dialog).getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(mockCreateCoachAccount).toHaveBeenCalledWith('token-1', {
        firstname: 'Aki',
        lastname: 'Korpi',
        alias: 'AK',
        pin: '1234',
      });
    });

    await waitFor(() => expect(mockListCoachAccounts).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(screen.getByText('Coach account created successfully.')).toBeInTheDocument());
  });

  it('updates trainee account with edit dialog', async () => {
    mockListTraineeAccounts.mockResolvedValueOnce({
      accounts: [
        {
          id: 'trainee-1',
          firstname: 'Liisa',
          lastname: 'Maki',
          age: '12',
          pin: '4321',
          created_at: '2026-07-10T00:00:00.000Z',
          last_activity: '2026-07-10T01:00:00.000Z',
        },
      ],
    });

    render(<AdminAccountListPanel sessionToken="token-1" />);

    await waitFor(() => expect(screen.getByText('Liisa')).toBeInTheDocument());
    await userEvent.click(screen.getByRole('button', { name: 'Edit trainee account' }));

    const dialog = screen.getByRole('dialog');
    const firstNameField = within(dialog).getByRole('textbox', { name: 'First name' });
    await userEvent.clear(firstNameField);
    await userEvent.type(firstNameField, 'Liisa2');

    await userEvent.click(within(dialog).getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(mockUpdateTraineeAccount).toHaveBeenCalledWith('token-1', {
        id: 'trainee-1',
        firstname: 'Liisa2',
        lastname: 'Maki',
        age: '12',
        pin: '4321',
      });
    });
  });

  it('creates a trainee account and refreshes account lists', async () => {
    render(<AdminAccountListPanel sessionToken="token-1" />);

    await waitFor(() => expect(mockListTraineeAccounts).toHaveBeenCalledTimes(1));

    await userEvent.click(screen.getByRole('button', { name: 'Create trainee account' }));

    const dialog = screen.getByRole('dialog');
    await userEvent.type(within(dialog).getByRole('textbox', { name: 'First name' }), 'Liisa');
    await userEvent.type(within(dialog).getByRole('textbox', { name: 'Last name' }), 'Maki');
    await userEvent.type(within(dialog).getByRole('textbox', { name: 'Age' }), '12');
    await userEvent.type(within(dialog).getByRole('textbox', { name: 'PIN' }), '4321');

    await userEvent.click(within(dialog).getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(mockCreateTraineeAccount).toHaveBeenCalledWith('token-1', {
        firstname: 'Liisa',
        lastname: 'Maki',
        age: '12',
        pin: '4321',
      });
    });

    await waitFor(() => expect(mockListTraineeAccounts).toHaveBeenCalledTimes(2));
    await waitFor(() =>
      expect(screen.getByText('Trainee account created successfully.')).toBeInTheDocument()
    );
  });

  it('shows restriction feedback when coach update is forbidden', async () => {
    mockListCoachAccounts.mockResolvedValueOnce({
      accounts: [
        {
          id: 'coach-1',
          firstname: 'Aki',
          lastname: 'Korpi',
          alias: 'AK',
          pin: '1234',
          created_at: '2026-07-10T00:00:00.000Z',
          last_activity: '2026-07-10T01:00:00.000Z',
        },
      ],
    });
    mockUpdateCoachAccount.mockRejectedValueOnce(new Error('forbidden'));

    render(<AdminAccountListPanel sessionToken="token-1" />);

    await waitFor(() => expect(screen.getByText('Aki')).toBeInTheDocument());
    await userEvent.click(screen.getByRole('button', { name: 'Edit coach account' }));

    const dialog = screen.getByRole('dialog');
    const aliasField = within(dialog).getByRole('textbox', { name: 'Alias' });
    await userEvent.clear(aliasField);
    await userEvent.type(aliasField, 'AK2');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(
        within(dialog).getByText(
          'This account cannot be changed because related registrations exist.'
        )
      ).toBeInTheDocument();
    });
  });

  it('shows forbidden feedback and refreshes after restricted coach delete', async () => {
    mockListCoachAccounts.mockResolvedValueOnce({
      accounts: [
        {
          id: 'coach-1',
          firstname: 'Aki',
          lastname: 'Korpi',
          alias: 'AK',
          pin: '1234',
          created_at: '2026-07-10T00:00:00.000Z',
          last_activity: '2026-07-10T01:00:00.000Z',
        },
      ],
    });
    mockDeleteCoachAccount.mockRejectedValueOnce(new Error('forbidden'));

    render(<AdminAccountListPanel sessionToken="token-1" />);

    await waitFor(() => expect(screen.getByText('Aki')).toBeInTheDocument());

    await userEvent.click(screen.getByRole('button', { name: 'Delete coach account' }));
    expect(screen.getByText('Are you sure you want to delete this coach account?')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Delete account' }));

    await waitFor(() => {
      expect(screen.getAllByText('This account cannot be changed because related registrations exist.').length).toBeGreaterThan(0);
    });
    await waitFor(() => expect(mockListCoachAccounts).toHaveBeenCalledTimes(2));
  });

  it('shows list-specific error state and supports retry', async () => {
    mockListCoachAccounts.mockRejectedValueOnce(new Error('network_error'));
    render(<AdminAccountListPanel sessionToken="token-1" />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load coach accounts. Please try again.')).toBeInTheDocument();
    });

    await userEvent.click(screen.getByRole('button', { name: 'Retry' }));

    await waitFor(() => expect(mockListCoachAccounts).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(mockListTraineeAccounts).toHaveBeenCalledTimes(2));
  });

  it('deletes a trainee account and refreshes account lists', async () => {
    mockListTraineeAccounts.mockResolvedValueOnce({
      accounts: [
        {
          id: 'trainee-1',
          firstname: 'Liisa',
          lastname: 'Maki',
          age: '12',
          pin: '4321',
          created_at: '2026-07-10T00:00:00.000Z',
          last_activity: '2026-07-10T01:00:00.000Z',
        },
      ],
    });

    render(<AdminAccountListPanel sessionToken="token-1" />);

    await waitFor(() => expect(screen.getByText('Liisa')).toBeInTheDocument());
    await userEvent.click(screen.getByRole('button', { name: 'Delete trainee account' }));

    await userEvent.click(screen.getByRole('button', { name: 'Delete account' }));

    await waitFor(() => expect(mockDeleteTraineeAccount).toHaveBeenCalledWith('token-1', 'trainee-1'));
    await waitFor(() => expect(mockListTraineeAccounts).toHaveBeenCalledTimes(2));
    await waitFor(() =>
      expect(screen.getByText('Trainee account deleted successfully.')).toBeInTheDocument()
    );
  });
});
