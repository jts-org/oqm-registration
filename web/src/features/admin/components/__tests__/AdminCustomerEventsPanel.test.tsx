/**
 * @copyright 2026 Jouni Sipola by OQM. All rights reserved.
 * Permission granted for personal/internal use only. Commercial
 * use prohibited except by copyright holder. See LICENSE for details.
 */

/**
 * @description Tests for AdminCustomerEventsPanel add event flow.
 * @see .github/skills/wire-react-to-gas/SKILL.md
 */
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import '../../../../lib/i18n';
import { AdminCustomerEventsPanel } from '../AdminCustomerEventsPanel';

vi.mock('../../api/admin.api', () => ({
  registerCustomerEventWithSchedule: vi.fn().mockResolvedValue({
    customerEventInsertedCount: 1,
    totalScheduleRows: 1,
    scheduleInsertedCount: 1,
    scheduleRejectedCount: 0,
    results: [{ rowIndex: 0, status: 'added', id: 'schedule-1' }],
  }),
}));

import { registerCustomerEventWithSchedule } from '../../api/admin.api';
const mockRegisterCustomerEventWithSchedule = vi.mocked(registerCustomerEventWithSchedule);

describe('AdminCustomerEventsPanel', () => {
  it('opens Add Customer Event view from card', async () => {
    render(<AdminCustomerEventsPanel sessionToken="token-1" />);

    await userEvent.click(screen.getByRole('button', { name: 'Add' }));

    expect(screen.getByRole('heading', { name: 'Add Customer Event' })).toBeInTheDocument();
    expect(screen.getByLabelText('event-name')).toBeInTheDocument();
  });

  it('keeps submit disabled until required fields are valid', async () => {
    render(<AdminCustomerEventsPanel sessionToken="token-1" />);

    await userEvent.click(screen.getByRole('button', { name: 'Add' }));

    expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled();
  });

  it('submits valid event and schedule rows and shows summary', async () => {
    render(<AdminCustomerEventsPanel sessionToken="token-1" />);

    await userEvent.click(screen.getByRole('button', { name: 'Add' }));

    await userEvent.type(screen.getByLabelText('event-name'), 'Customer Camp');
    await userEvent.type(screen.getByLabelText('event-alias'), 'Asiakasleiri');
    await userEvent.type(screen.getByLabelText('instructor-name'), 'Sensei Doe');
    await userEvent.type(screen.getByLabelText('event-start-date'), '2026-06-01');
    await userEvent.type(screen.getByLabelText('event-end-date'), '2026-06-03');

    await userEvent.type(screen.getByLabelText('session-name-1'), 'Session A');
    await userEvent.type(screen.getByLabelText('session-alias-1'), 'Sessio A');
    await userEvent.type(screen.getByLabelText('session-date-1'), '2026-06-01');
    await userEvent.type(screen.getByLabelText('session-start-time-1'), '09:00');
    await userEvent.type(screen.getByLabelText('session-end-time-1'), '10:00');

    await userEvent.click(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() => expect(mockRegisterCustomerEventWithSchedule).toHaveBeenCalledTimes(1));

    expect(screen.getByText('Customer event created: 1')).toBeInTheDocument();
    expect(screen.getByText('Added schedule rows: 1')).toBeInTheDocument();
    expect(screen.getByText('Rejected schedule rows: 0')).toBeInTheDocument();
  });

  it('adds and removes schedule rows', async () => {
    render(<AdminCustomerEventsPanel sessionToken="token-1" />);

    await userEvent.click(screen.getByRole('button', { name: 'Add' }));
    await userEvent.click(screen.getByRole('button', { name: 'Add session' }));

    expect(screen.getAllByLabelText(/session-name-/i)).toHaveLength(2);

    await userEvent.click(screen.getByLabelText('Remove session 2'));

    expect(screen.getAllByLabelText(/session-name-/i)).toHaveLength(1);
  });
});
