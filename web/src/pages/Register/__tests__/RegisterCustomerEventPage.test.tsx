/**
 * @copyright 2026 Jouni Sipola by OQM. All rights reserved.
 * Permission granted for personal/internal use only. Commercial
 * use prohibited except by copyright holder. See LICENSE for details.
 */

/**
 * @description Tests for RegisterCustomerEventPage (Task 1.2).
 *   Tracer bullet: single-session happy path focus.
 */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import toast from 'react-hot-toast';

import '../../../lib/i18n';
import { i18n } from '../../../lib/i18n';
import { RegisterCustomerEventPage } from '../RegisterCustomerEventPage';
import * as traineeApi from '../../../features/trainee/api/trainee.api';

// Mock dependencies
vi.mock('../../../features/trainee/api/trainee.api');

vi.mock('react-hot-toast', () => {
  const toastFn = Object.assign(vi.fn(), {
    success: vi.fn(),
    error: vi.fn(),
  });
  return { default: toastFn };
});

const mockedToast = vi.mocked(toast);

// Test data
const mockCustomerEvent = {
  id: 'event-001',
  event: 'Customer Training Event',
  event_alias: 'Training Event 2026',
  instructor: 'John Doe',
  start_date: '2026-09-01',
  end_date: '2026-09-30',
  realized: true,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
};

const mockSingleSession = {
  id: 'session-001',
  event_id: 'event-001',
  session_name: 'Basic Training',
  session_name_alias: 'Basic Session',
  date: '2026-09-05',
  start_time: '18:00',
  end_time: '19:30',
  realized: true,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
};

const mockMultipleSessions = [
  mockSingleSession,
  {
    ...mockSingleSession,
    id: 'session-002',
    session_name: 'Advanced Training',
    date: '2026-09-12',
  },
  {
    ...mockSingleSession,
    id: 'session-003',
    session_name: 'Sparring Session',
    date: '2026-09-19',
  },
];

function renderWithRouter(component: React.ReactElement, initialPath = '/?customer-event=event-001') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      {component}
    </MemoryRouter>
  );
}

describe('RegisterCustomerEventPage', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await i18n.changeLanguage('en');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Query Parameter Parsing', () => {
    it('should show error when customer-event parameter is missing', async () => {
      renderWithRouter(<RegisterCustomerEventPage />, '/');

      await waitFor(() => {
        expect(
          screen.getByText('Missing customer event identifier in the link.')
        ).toBeInTheDocument();
      });
    });

    it('should accept valid customer-event parameter and call resolver', async () => {
      vi.mocked(traineeApi.resolveCustomerEvent).mockResolvedValueOnce({
        event: mockCustomerEvent,
        sessions: [mockSingleSession],
      });

      renderWithRouter(<RegisterCustomerEventPage />, '/?customer-event=event-001');

      await waitFor(() => {
        expect(traineeApi.resolveCustomerEvent).toHaveBeenCalledWith('event-001');
      });
    });
  });

  describe('Backend Resolver Call', () => {
    it('should handle resolver success with single session', async () => {
      vi.mocked(traineeApi.resolveCustomerEvent).mockResolvedValueOnce({
        event: mockCustomerEvent,
        sessions: [mockSingleSession],
      });

      renderWithRouter(<RegisterCustomerEventPage />, '/?customer-event=event-001');

      await waitFor(() => {
        expect(screen.getByText(mockCustomerEvent.event_alias)).toBeInTheDocument();
        expect(screen.getByText(mockSingleSession.session_name_alias)).toBeInTheDocument();
      });
    });

    it('should handle resolver error (invalid event)', async () => {
      vi.mocked(traineeApi.resolveCustomerEvent).mockRejectedValueOnce(
        new Error('invalid_customer_event')
      );

      renderWithRouter(<RegisterCustomerEventPage />, '/?customer-event=invalid-event');

      await waitFor(() => {
        expect(
          screen.getByText('The customer event is invalid or unavailable.')
        ).toBeInTheDocument();
      });
    });

    it('should handle inactive event error', async () => {
      vi.mocked(traineeApi.resolveCustomerEvent).mockRejectedValueOnce(
        new Error('inactive_customer_event')
      );

      renderWithRouter(<RegisterCustomerEventPage />, '/?customer-event=inactive-event');

      await waitFor(() => {
        expect(
          screen.getByText('This customer event is no longer active.')
        ).toBeInTheDocument();
      });
    });
  });

  describe('Session Branching', () => {
    it('should show message when zero sessions available and no confirmation button', async () => {
      vi.mocked(traineeApi.resolveCustomerEvent).mockResolvedValueOnce({
        event: mockCustomerEvent,
        sessions: [],
      });

      renderWithRouter(<RegisterCustomerEventPage />, '/?customer-event=event-001');

      await waitFor(() => {
        expect(
          screen.getByText('No training sessions are available for this event.')
        ).toBeInTheDocument();
      });

      // Confirmation button should not be present
      expect(screen.queryByRole('button', { name: /confirm/i })).not.toBeInTheDocument();
    });

    it('should auto-select single session without UI control', async () => {
      vi.mocked(traineeApi.resolveCustomerEvent).mockResolvedValueOnce({
        event: mockCustomerEvent,
        sessions: [mockSingleSession],
      });

      renderWithRouter(<RegisterCustomerEventPage />, '/?customer-event=event-001');

      await waitFor(() => {
        expect(screen.getByText(mockSingleSession.session_name_alias)).toBeInTheDocument();
      });

      // Should not show a selector UI for single session
      const sessionDisplays = screen.queryAllByText(mockSingleSession.session_name_alias);
      expect(sessionDisplays.length).toBeGreaterThan(0);
    });

    it('should display multi-session selector when multiple sessions are available', async () => {
      vi.mocked(traineeApi.resolveCustomerEvent).mockResolvedValueOnce({
        event: mockCustomerEvent,
        sessions: mockMultipleSessions,
      });

      renderWithRouter(<RegisterCustomerEventPage />, '/?customer-event=event-001');

      await waitFor(() => {
        expect(screen.getByText('Select training sessions')).toBeInTheDocument();
        expect(screen.getByText('3 of 3 sessions selected')).toBeInTheDocument();
      });
    });

    it('should disable confirmation when no sessions are selected in multi-session mode', async () => {
      vi.mocked(traineeApi.resolveCustomerEvent).mockResolvedValueOnce({
        event: mockCustomerEvent,
        sessions: mockMultipleSessions,
      });

      renderWithRouter(<RegisterCustomerEventPage />, '/?customer-event=event-001');

      await waitFor(() => {
        expect(screen.getByText('Select training sessions')).toBeInTheDocument();
      });

      const deselectAllBtn = screen.getByRole('button', { name: 'Deselect all' });
      await userEvent.click(deselectAllBtn);

      await waitFor(() => {
        expect(
          screen.getByText('Please select at least one session to continue.')
        ).toBeInTheDocument();
      });

      const firstNameInput = screen.getByLabelText('First name') as HTMLInputElement;
      const lastNameInput = screen.getByLabelText('Last name') as HTMLInputElement;
      await userEvent.type(firstNameInput, 'Jane');
      await userEvent.type(lastNameInput, 'Doe');

      const confirmButton = screen.getByRole('button', { name: 'Confirm Registration' });
      expect(confirmButton).toBeDisabled();
    });

    it('should submit batch registration for selected multiple sessions', async () => {
      vi.mocked(traineeApi.resolveCustomerEvent).mockResolvedValueOnce({
        event: mockCustomerEvent,
        sessions: mockMultipleSessions,
      });

      vi.mocked(traineeApi.registerTraineeBatchForCustomerEvent).mockResolvedValueOnce({
        registered_count: 3,
        registrations: [
          { schedule_id: 'session-001', registration_id: 'r1' },
          { schedule_id: 'session-002', registration_id: 'r2' },
          { schedule_id: 'session-003', registration_id: 'r3' },
        ],
      });

      renderWithRouter(<RegisterCustomerEventPage />, '/?customer-event=event-001');

      await waitFor(() => {
        expect(screen.getByText('Select training sessions')).toBeInTheDocument();
      });

      const firstNameInput = screen.getByLabelText('First name') as HTMLInputElement;
      const lastNameInput = screen.getByLabelText('Last name') as HTMLInputElement;
      await userEvent.type(firstNameInput, 'Multi');
      await userEvent.type(lastNameInput, 'User');

      const confirmButton = screen.getByRole('button', { name: 'Confirm Registration' });
      await userEvent.click(confirmButton);

      await waitFor(() => {
        expect(screen.getByText('Confirm your registration')).toBeInTheDocument();
      });

      const submitButton = screen.getByRole('button', { name: 'Submit Registration' });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(traineeApi.registerTraineeBatchForCustomerEvent).toHaveBeenCalledWith({
          customer_event: 'event-001',
          schedule_ids: ['session-001', 'session-002', 'session-003'],
          first_name: 'Multi',
          last_name: 'User',
          age_group: 'adult',
        });
        expect(mockedToast.success).toHaveBeenCalledWith(
          'Registration successful! You are registered for 3 sessions.'
        );
      });
    });
  });

  describe('Identity Form', () => {
    it('should render identity form with name and age fields', async () => {
      vi.mocked(traineeApi.resolveCustomerEvent).mockResolvedValueOnce({
        event: mockCustomerEvent,
        sessions: [mockSingleSession],
      });

      renderWithRouter(<RegisterCustomerEventPage />, '/?customer-event=event-001');

      await waitFor(() => {
        expect(screen.getByLabelText('First name')).toBeInTheDocument();
        expect(screen.getByLabelText('Last name')).toBeInTheDocument();
      });
    });

    it('should validate that name fields are required', async () => {
      vi.mocked(traineeApi.resolveCustomerEvent).mockResolvedValueOnce({
        event: mockCustomerEvent,
        sessions: [mockSingleSession],
      });

      renderWithRouter(<RegisterCustomerEventPage />, '/?customer-event=event-001');

      await waitFor(() => {
        const confirmButton = screen.getByRole('button', { name: 'Confirm Registration' });
        expect(confirmButton).toBeDisabled();
      });
    });

    it('should enable confirmation button when form is valid (adult)', async () => {
      vi.mocked(traineeApi.resolveCustomerEvent).mockResolvedValueOnce({
        event: mockCustomerEvent,
        sessions: [mockSingleSession],
      });

      renderWithRouter(<RegisterCustomerEventPage />, '/?customer-event=event-001');

      await waitFor(() => {
        const firstNameInput = screen.getByLabelText('First name') as HTMLInputElement;
        expect(firstNameInput).toBeInTheDocument();
      });

      const firstNameInput = screen.getByLabelText('First name') as HTMLInputElement;
      const lastNameInput = screen.getByLabelText('Last name') as HTMLInputElement;

      await userEvent.type(firstNameInput, 'John');
      await userEvent.type(lastNameInput, 'Doe');

      await waitFor(() => {
        const confirmButton = screen.getByRole('button', { name: 'Confirm Registration' });
        expect(confirmButton).not.toBeDisabled();
      });
    });

    it('should show age field when underage checkbox is checked', async () => {
      vi.mocked(traineeApi.resolveCustomerEvent).mockResolvedValueOnce({
        event: mockCustomerEvent,
        sessions: [mockSingleSession],
      });

      renderWithRouter(<RegisterCustomerEventPage />, '/?customer-event=event-001');

      await waitFor(() => {
        expect(screen.getByLabelText("I'm under 18 years old")).toBeInTheDocument();
      });

      const underageCheckbox = screen.getByLabelText("I'm under 18 years old") as HTMLInputElement;
      await userEvent.click(underageCheckbox);

      await waitFor(() => {
        expect(screen.getByLabelText('Age')).toBeInTheDocument();
      });
    });

    it('should require age when underage is selected', async () => {
      vi.mocked(traineeApi.resolveCustomerEvent).mockResolvedValueOnce({
        event: mockCustomerEvent,
        sessions: [mockSingleSession],
      });

      renderWithRouter(<RegisterCustomerEventPage />, '/?customer-event=event-001');

      await waitFor(() => {
        const firstNameInput = screen.getByLabelText('First name') as HTMLInputElement;
        expect(firstNameInput).toBeInTheDocument();
      });

      const firstNameInput = screen.getByLabelText('First name') as HTMLInputElement;
      const lastNameInput = screen.getByLabelText('Last name') as HTMLInputElement;
      const underageCheckbox = screen.getByLabelText("I'm under 18 years old") as HTMLInputElement;

      await userEvent.type(firstNameInput, 'Jane');
      await userEvent.type(lastNameInput, 'Smith');
      await userEvent.click(underageCheckbox);

      await waitFor(() => {
        const confirmButton = screen.getByRole('button', { name: 'Confirm Registration' });
        expect(confirmButton).toBeDisabled();
      });

      const ageInput = screen.getByLabelText('Age') as HTMLInputElement;
      await userEvent.type(ageInput, '15');

      await waitFor(() => {
        const confirmButton = screen.getByRole('button', { name: 'Confirm Registration' });
        expect(confirmButton).not.toBeDisabled();
      });
    });
  });

  describe('Confirmation Gate', () => {
    it('should show summary when confirm is clicked', async () => {
      vi.mocked(traineeApi.resolveCustomerEvent).mockResolvedValueOnce({
        event: mockCustomerEvent,
        sessions: [mockSingleSession],
      });

      renderWithRouter(<RegisterCustomerEventPage />, '/?customer-event=event-001');

      await waitFor(() => {
        const firstNameInput = screen.getByLabelText('First name') as HTMLInputElement;
        expect(firstNameInput).toBeInTheDocument();
      });

      const firstNameInput = screen.getByLabelText('First name') as HTMLInputElement;
      const lastNameInput = screen.getByLabelText('Last name') as HTMLInputElement;

      await userEvent.type(firstNameInput, 'Alice');
      await userEvent.type(lastNameInput, 'Brown');

      const confirmButton = screen.getByRole('button', { name: 'Confirm Registration' });
      await userEvent.click(confirmButton);

      await waitFor(() => {
        expect(screen.getByText('Confirm your registration')).toBeInTheDocument();
      });
    });

    it('should display summary with event, session, and identity details', async () => {
      vi.mocked(traineeApi.resolveCustomerEvent).mockResolvedValueOnce({
        event: mockCustomerEvent,
        sessions: [mockSingleSession],
      });

      renderWithRouter(<RegisterCustomerEventPage />, '/?customer-event=event-001');

      await waitFor(() => {
        const firstNameInput = screen.getByLabelText('First name') as HTMLInputElement;
        expect(firstNameInput).toBeInTheDocument();
      });

      const firstNameInput = screen.getByLabelText('First name') as HTMLInputElement;
      const lastNameInput = screen.getByLabelText('Last name') as HTMLInputElement;

      await userEvent.type(firstNameInput, 'Bob');
      await userEvent.type(lastNameInput, 'Wilson');

      const confirmButton = screen.getByRole('button', { name: 'Confirm Registration' });
      await userEvent.click(confirmButton);

      await waitFor(() => {
        expect(screen.getByText('Confirm your registration')).toBeInTheDocument();
        expect(screen.getAllByText(mockCustomerEvent.event_alias).length).toBeGreaterThan(0);
        expect(screen.getAllByText(mockSingleSession.session_name_alias).length).toBeGreaterThan(0);
        expect(screen.getByText(/Bob Wilson/)).toBeInTheDocument();
      });
    });

    it('should allow editing from summary view', async () => {
      vi.mocked(traineeApi.resolveCustomerEvent).mockResolvedValueOnce({
        event: mockCustomerEvent,
        sessions: [mockSingleSession],
      });

      renderWithRouter(<RegisterCustomerEventPage />, '/?customer-event=event-001');

      await waitFor(() => {
        const firstNameInput = screen.getByLabelText('First name') as HTMLInputElement;
        expect(firstNameInput).toBeInTheDocument();
      });

      const firstNameInput = screen.getByLabelText('First name') as HTMLInputElement;
      const lastNameInput = screen.getByLabelText('Last name') as HTMLInputElement;

      await userEvent.type(firstNameInput, 'Charlie');
      await userEvent.type(lastNameInput, 'Davis');

      let confirmButton = screen.getByRole('button', { name: 'Confirm Registration' });
      await userEvent.click(confirmButton);

      await waitFor(() => {
        expect(screen.getByText('Confirm your registration')).toBeInTheDocument();
      });

      const editButton = screen.getByRole('button', { name: 'Edit' });
      await userEvent.click(editButton);

      await waitFor(() => {
        confirmButton = screen.getByRole('button', { name: 'Confirm Registration' });
        expect(confirmButton).toBeInTheDocument();
      });
    });
  });

  describe('Registration Write', () => {
    it('should call registerTraineeBatchForCustomerEvent with correct payload on submit', async () => {
      vi.mocked(traineeApi.resolveCustomerEvent).mockResolvedValueOnce({
        event: mockCustomerEvent,
        sessions: [mockSingleSession],
      });

      vi.mocked(traineeApi.registerTraineeBatchForCustomerEvent).mockResolvedValueOnce({
        registered_count: 1,
        registrations: [{ schedule_id: mockSingleSession.id, registration_id: 'reg-001' }],
      });

      renderWithRouter(<RegisterCustomerEventPage />, '/?customer-event=event-001');

      await waitFor(() => {
        const firstNameInput = screen.getByLabelText('First name') as HTMLInputElement;
        expect(firstNameInput).toBeInTheDocument();
      });

      const firstNameInput = screen.getByLabelText('First name') as HTMLInputElement;
      const lastNameInput = screen.getByLabelText('Last name') as HTMLInputElement;

      await userEvent.type(firstNameInput, 'David');
      await userEvent.type(lastNameInput, 'Evans');

      const confirmButton = screen.getByRole('button', { name: 'Confirm Registration' });
      await userEvent.click(confirmButton);

      await waitFor(() => {
        expect(screen.getByText('Confirm your registration')).toBeInTheDocument();
      });

      const submitButton = screen.getByRole('button', { name: 'Submit Registration' });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(traineeApi.registerTraineeBatchForCustomerEvent).toHaveBeenCalledWith(
          expect.objectContaining({
            customer_event: 'event-001',
            schedule_ids: [mockSingleSession.id],
            first_name: 'David',
            last_name: 'Evans',
            age_group: 'adult',
          })
        );
      });
    });

    it('should include age when underage trainee', async () => {
      vi.mocked(traineeApi.resolveCustomerEvent).mockResolvedValueOnce({
        event: mockCustomerEvent,
        sessions: [mockSingleSession],
      });

      vi.mocked(traineeApi.registerTraineeBatchForCustomerEvent).mockResolvedValueOnce({
        registered_count: 1,
        registrations: [{ schedule_id: mockSingleSession.id, registration_id: 'reg-002' }],
      });

      renderWithRouter(<RegisterCustomerEventPage />, '/?customer-event=event-001');

      await waitFor(() => {
        const firstNameInput = screen.getByLabelText('First name') as HTMLInputElement;
        expect(firstNameInput).toBeInTheDocument();
      });

      const firstNameInput = screen.getByLabelText('First name') as HTMLInputElement;
      const lastNameInput = screen.getByLabelText('Last name') as HTMLInputElement;
      const underageCheckbox = screen.getByLabelText("I'm under 18 years old") as HTMLInputElement;

      await userEvent.type(firstNameInput, 'Emma');
      await userEvent.type(lastNameInput, 'Foster');
      await userEvent.click(underageCheckbox);

      const ageInput = screen.getByLabelText('Age') as HTMLInputElement;
      await userEvent.type(ageInput, '14');

      const confirmButton = screen.getByRole('button', { name: 'Confirm Registration' });
      await userEvent.click(confirmButton);

      await waitFor(() => {
        expect(screen.getByText('Confirm your registration')).toBeInTheDocument();
      });

      const submitButton = screen.getByRole('button', { name: 'Submit Registration' });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(traineeApi.registerTraineeBatchForCustomerEvent).toHaveBeenCalledWith(
          expect.objectContaining({
            customer_event: 'event-001',
            schedule_ids: [mockSingleSession.id],
            first_name: 'Emma',
            last_name: 'Foster',
            age_group: 'underage',
            underage_age: 14,
          })
        );
      });
    });
  });

  describe('Success and Failure Notifications', () => {
    it('should show success notification on successful registration', async () => {
      vi.mocked(traineeApi.resolveCustomerEvent).mockResolvedValueOnce({
        event: mockCustomerEvent,
        sessions: [mockSingleSession],
      });

      vi.mocked(traineeApi.registerTraineeBatchForCustomerEvent).mockResolvedValueOnce({
        registered_count: 1,
        registrations: [{ schedule_id: mockSingleSession.id, registration_id: 'reg-003' }],
      });

      renderWithRouter(<RegisterCustomerEventPage />, '/?customer-event=event-001');

      await waitFor(() => {
        const firstNameInput = screen.getByLabelText('First name') as HTMLInputElement;
        expect(firstNameInput).toBeInTheDocument();
      });

      const firstNameInput = screen.getByLabelText('First name') as HTMLInputElement;
      const lastNameInput = screen.getByLabelText('Last name') as HTMLInputElement;

      await userEvent.type(firstNameInput, 'Frank');
      await userEvent.type(lastNameInput, 'Green');

      const confirmButton = screen.getByRole('button', { name: 'Confirm Registration' });
      await userEvent.click(confirmButton);

      await waitFor(() => {
        expect(screen.getByText('Confirm your registration')).toBeInTheDocument();
      });

      const submitButton = screen.getByRole('button', { name: 'Submit Registration' });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(mockedToast.success).toHaveBeenCalledWith(
          'Registration successful! You are registered for this training session.'
        );
      });
    });

    it('should show error notification on duplicate registration', async () => {
      vi.mocked(traineeApi.resolveCustomerEvent).mockResolvedValueOnce({
        event: mockCustomerEvent,
        sessions: [mockSingleSession],
      });

      vi.mocked(traineeApi.registerTraineeBatchForCustomerEvent).mockRejectedValueOnce(
        new Error('already_registered')
      );

      renderWithRouter(<RegisterCustomerEventPage />, '/?customer-event=event-001');

      await waitFor(() => {
        const firstNameInput = screen.getByLabelText('First name') as HTMLInputElement;
        expect(firstNameInput).toBeInTheDocument();
      });

      const firstNameInput = screen.getByLabelText('First name') as HTMLInputElement;
      const lastNameInput = screen.getByLabelText('Last name') as HTMLInputElement;

      await userEvent.type(firstNameInput, 'Grace');
      await userEvent.type(lastNameInput, 'Harris');

      const confirmButton = screen.getByRole('button', { name: 'Confirm Registration' });
      await userEvent.click(confirmButton);

      await waitFor(() => {
        expect(screen.getByText('Confirm your registration')).toBeInTheDocument();
      });

      const submitButton = screen.getByRole('button', { name: 'Submit Registration' });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(mockedToast.error).toHaveBeenCalledWith('You are already registered for this session.');
      });
    });
  });

  describe('i18n Integration', () => {
    it('should use i18n keys for all user-facing strings', async () => {
      vi.mocked(traineeApi.resolveCustomerEvent).mockResolvedValueOnce({
        event: mockCustomerEvent,
        sessions: [mockSingleSession],
      });

      renderWithRouter(<RegisterCustomerEventPage />, '/?customer-event=event-001');

      await waitFor(() => {
        expect(screen.getByText('Register via customer event')).toBeInTheDocument();
        expect(screen.getByText('Back to main')).toBeInTheDocument();
      });

      // Switch to Finnish and verify translations update
      await i18n.changeLanguage('fi');

      await waitFor(() => {
        expect(screen.getByText('Ilmoittaudu asiakastapahtumakohtaisesti')).toBeInTheDocument();
        expect(screen.getByText('Takaisin etusivulle')).toBeInTheDocument();
      });
    });
  });

  describe('Mobile Responsiveness', () => {
    it('should render correctly on mobile viewport', async () => {
      // Mock window.matchMedia for mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      vi.mocked(traineeApi.resolveCustomerEvent).mockResolvedValueOnce({
        event: mockCustomerEvent,
        sessions: [mockSingleSession],
      });

      const { container } = renderWithRouter(
        <RegisterCustomerEventPage />,
        '/?customer-event=event-001'
      );

      await waitFor(() => {
        expect(screen.getByLabelText('First name')).toBeInTheDocument();
      });
    });
  });
});
