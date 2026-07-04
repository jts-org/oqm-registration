/**
 * @copyright 2026 Jouni Sipola by OQM. All rights reserved.
 * Permission granted for personal/internal use only. Commercial
 * use prohibited except by copyright holder. See LICENSE for details.
 */

/**
 * @description Tests for AdminSessionsSchedulePanel (OQM-0042).
 * @see .github/skills/wire-react-to-gas/SKILL.md
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import '../../../../lib/i18n';
import { AdminSessionsSchedulePanel } from '../AdminSessionsSchedulePanel';

// ── Mock API ──────────────────────────────────────────────────────────────────

const mockSchedule = {
  id: '1718294400000',
  session_type: 'Advanced',
  session_type_alias: 'Edistynyt',
  start_date: '2026-01-01',
  end_date: '2026-12-31',
  weekdays_available: '0,2,4',
  start_time: '18:00',
  end_time: '19:30',
  location: 'Dojo A',
  location_alias: 'Sali A',
  active: true,
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-01T00:00:00.000Z',
};

vi.mock('../../api/admin.api', () => ({
  listSessionsSchedule: vi.fn().mockResolvedValue({ schedules: [] }),
  addSessionSchedule: vi.fn().mockResolvedValue({
    schedule: {
      id: 'new-id',
      session_type: 'Advanced',
      session_type_alias: 'Edistynyt',
      start_date: '2026-01-01',
      end_date: '2026-12-31',
      weekdays_available: '0',
      start_time: '',
      end_time: '',
      location: '',
      location_alias: '',
      active: true,
      created_at: '2026-01-01T00:00:00.000Z',
      updated_at: '2026-01-01T00:00:00.000Z',
    },
  }),
  updateSessionSchedule: vi.fn().mockResolvedValue({
    schedule: {
      id: '1718294400000',
      session_type: 'Advanced',
      session_type_alias: 'Edistynyt',
      start_date: '2026-01-01',
      end_date: '2026-12-31',
      weekdays_available: '0,2,4',
      start_time: '18:00',
      end_time: '19:30',
      location: 'Dojo B',
      location_alias: 'Sali A',
      active: true,
      created_at: '2026-01-01T00:00:00.000Z',
      updated_at: '2026-01-01T01:00:00.000Z',
    },
  }),
  deleteSessionSchedule: vi.fn().mockResolvedValue({ id: '1718294400000' }),
}));

import {
  listSessionsSchedule,
  addSessionSchedule,
  updateSessionSchedule,
  deleteSessionSchedule,
} from '../../api/admin.api';

const mockList = vi.mocked(listSessionsSchedule);
const mockAdd = vi.mocked(addSessionSchedule);
const mockUpdate = vi.mocked(updateSessionSchedule);
const mockDelete = vi.mocked(deleteSessionSchedule);

// Reset mocks before every test to prevent cross-test state bleed
beforeEach(() => {
  vi.clearAllMocks();
  mockList.mockResolvedValue({ schedules: [] });
});

// ── Helpers ───────────────────────────────────────────────────────────────────

function renderPanel(token = 'test-token') {
  return render(<AdminSessionsSchedulePanel sessionToken={token} />);
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('AdminSessionsSchedulePanel', () => {

  describe('List view', () => {
    it('calls listSessionsSchedule on mount', async () => {
      mockList.mockResolvedValueOnce({ schedules: [] });
      renderPanel();
      await waitFor(() => expect(mockList).toHaveBeenCalledWith('test-token'));
    });

    it('renders schedule rows after loading', async () => {
      mockList.mockResolvedValueOnce({ schedules: [mockSchedule] });
      renderPanel();
      await waitFor(() => expect(screen.getByText('Advanced')).toBeInTheDocument());
      expect(screen.getByText('Edistynyt')).toBeInTheDocument();
      expect(screen.getByText('2026-01-01')).toBeInTheDocument();
      expect(screen.getByText('Dojo A')).toBeInTheDocument();
    });

    it('shows no-schedules message when list is empty', async () => {
      mockList.mockResolvedValueOnce({ schedules: [] });
      renderPanel();
      await waitFor(() => expect(screen.getByText('No schedules found.')).toBeInTheDocument());
    });

    it('shows load error when fetch fails', async () => {
      mockList.mockRejectedValueOnce(new Error('network error'));
      renderPanel();
      await waitFor(() => {
        const alert = screen.getByRole('alert');
        expect(alert).toHaveTextContent('Failed to load schedules. Please try again.');
      });
    });
  });

  describe('Add dialog', () => {

    it('opens Add Schedule dialog when button is clicked', async () => {
      renderPanel();
      await waitFor(() => screen.getByRole('button', { name: 'Add Schedule' }));
      await userEvent.click(screen.getByRole('button', { name: 'Add Schedule' }));
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Add Schedule' })).toBeInTheDocument();
    });

    it('closes dialog when Cancel is clicked', async () => {
      renderPanel();
      await waitFor(() => screen.getByRole('button', { name: 'Add Schedule' }));
      await userEvent.click(screen.getByRole('button', { name: 'Add Schedule' }));
      await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    });

    it('does not submit when required fields are missing', async () => {
      renderPanel();
      await waitFor(() => screen.getByRole('button', { name: 'Add Schedule' }));
      await userEvent.click(screen.getByRole('button', { name: 'Add Schedule' }));

      // Click Save without filling in any fields
      await userEvent.click(screen.getByRole('button', { name: 'Save' }));

      expect(mockAdd).not.toHaveBeenCalled();
    });

    it('submits valid form and shows success snackbar', async () => {
      mockAdd.mockResolvedValueOnce({ schedule: { ...mockSchedule, id: 'new-id' } });
      renderPanel();
      await waitFor(() => screen.getByRole('button', { name: 'Add Schedule' }));
      await userEvent.click(screen.getByRole('button', { name: 'Add Schedule' }));

      const dialog = screen.getByRole('dialog');

      await userEvent.type(within(dialog).getByRole('textbox', { name: 'Session Type' }), 'Advanced');
      await userEvent.type(within(dialog).getByRole('textbox', { name: 'Session Type Alias' }), 'Edistynyt');
      fireEvent.change(within(dialog).getByLabelText(/^Start Date/), { target: { value: '2026-01-01' } });
      fireEvent.change(within(dialog).getByLabelText(/^End Date/), { target: { value: '2026-12-31' } });

      // Select Mon (value=0) from ToggleButtonGroup
      await userEvent.click(within(dialog).getByRole('button', { name: 'Mon' }));

      await userEvent.click(within(dialog).getByRole('button', { name: 'Save' }));

      await waitFor(() => expect(mockAdd).toHaveBeenCalledTimes(1));
      await waitFor(() => expect(screen.getByText('Schedule saved successfully.')).toBeInTheDocument());
    });

    it('shows schedule_already_exists error message', async () => {
      mockAdd.mockRejectedValueOnce(new Error('schedule_already_exists'));
      renderPanel();
      await waitFor(() => screen.getByRole('button', { name: 'Add Schedule' }));
      await userEvent.click(screen.getByRole('button', { name: 'Add Schedule' }));

      const dialog = screen.getByRole('dialog');
      await userEvent.type(within(dialog).getByRole('textbox', { name: 'Session Type' }), 'Advanced');
      await userEvent.type(within(dialog).getByRole('textbox', { name: 'Session Type Alias' }), 'Edistynyt');
      fireEvent.change(within(dialog).getByLabelText(/^Start Date/), { target: { value: '2026-01-01' } });
      fireEvent.change(within(dialog).getByLabelText(/^End Date/), { target: { value: '2026-12-31' } });
      await userEvent.click(within(dialog).getByRole('button', { name: 'Mon' }));

      await userEvent.click(within(dialog).getByRole('button', { name: 'Save' }));

      await waitFor(() =>
        expect(
          screen.getByText('A schedule with the same type, days, and times already exists.')
        ).toBeInTheDocument()
      );
    });
  });

  describe('Edit dialog', () => {
    beforeEach(() => {
      mockList.mockResolvedValue({ schedules: [mockSchedule] });
    });

    it('opens Edit dialog pre-populated with row values', async () => {
      renderPanel();
      await waitFor(() => screen.getByText('Advanced'));

      await userEvent.click(screen.getByRole('button', { name: 'Edit Schedule' }));

      const dialog = screen.getByRole('dialog');
      expect(within(dialog).getByDisplayValue('Advanced')).toBeInTheDocument();
      expect(within(dialog).getByDisplayValue('Edistynyt')).toBeInTheDocument();
    });

    it('calls updateSessionSchedule on save and shows success', async () => {
      mockUpdate.mockResolvedValueOnce({ schedule: { ...mockSchedule, location: 'Dojo B' } });
      renderPanel();
      await waitFor(() => screen.getByText('Advanced'));

      await userEvent.click(screen.getByRole('button', { name: 'Edit Schedule' }));
      await userEvent.click(screen.getByRole('button', { name: 'Save' }));

      await waitFor(() => expect(mockUpdate).toHaveBeenCalledTimes(1));
      const [, payload] = mockUpdate.mock.calls[0];
      expect(payload.id).toBe('1718294400000');

      await waitFor(() => expect(screen.getByText('Schedule saved successfully.')).toBeInTheDocument());
    });
  });

  describe('Delete flow', () => {
    beforeEach(() => {
      mockList.mockResolvedValue({ schedules: [mockSchedule] });
    });

    it('opens delete confirmation dialog on Delete click', async () => {
      renderPanel();
      await waitFor(() => screen.getByText('Advanced'));

      await userEvent.click(screen.getByRole('button', { name: 'Delete Schedule' }));

      expect(screen.getByRole('heading', { name: 'Confirm Delete' })).toBeInTheDocument();
      expect(screen.getByText('Are you sure you want to delete this schedule?')).toBeInTheDocument();
    });

    it('cancels delete without calling API', async () => {
      renderPanel();
      await waitFor(() => screen.getByText('Advanced'));

      await userEvent.click(screen.getByRole('button', { name: 'Delete Schedule' }));
      await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));

      expect(mockDelete).not.toHaveBeenCalled();
    });

    it('calls deleteSessionSchedule and removes row on confirm', async () => {
      mockDelete.mockResolvedValueOnce({ id: '1718294400000' });
      renderPanel();
      await waitFor(() => screen.getByText('Advanced'));

      await userEvent.click(screen.getByRole('button', { name: 'Delete Schedule' }));
      await userEvent.click(screen.getByRole('button', { name: 'Delete Schedule' }));

      await waitFor(() => expect(mockDelete).toHaveBeenCalledWith('test-token', '1718294400000'));
      await waitFor(() => expect(screen.queryByText('Advanced')).not.toBeInTheDocument());
      await waitFor(() => expect(screen.getByText('Schedule deleted.')).toBeInTheDocument());
    });

    it('shows error message when no_match_found on delete', async () => {
      mockDelete.mockRejectedValueOnce(new Error('no_match_found'));
      mockList.mockResolvedValue({ schedules: [mockSchedule] });
      renderPanel();
      await waitFor(() => screen.getByText('Advanced'));

      await userEvent.click(screen.getByRole('button', { name: 'Delete Schedule' }));
      await userEvent.click(screen.getByRole('button', { name: 'Delete Schedule' }));

      await waitFor(() =>
        expect(screen.getByText('Schedule not found.')).toBeInTheDocument()
      );
    });
  });
});
