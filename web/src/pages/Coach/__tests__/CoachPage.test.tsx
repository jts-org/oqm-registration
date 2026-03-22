/**
 * @copyright 2026 Jouni Sipola by OQM. All rights reserved.
 * Permission granted for personal/internal use only. Commercial
 * use prohibited except by copyright holder. See LICENSE for details.
 */

/**
 * @description Tests for CoachPage — Coach Quick Registration view showing sessions.
 *   Written before implementation (TDD).
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import '../../../lib/i18n';
import { CoachPage } from '../CoachPage';
import type { SessionItem } from '../../../features/coach/types';

vi.mock('../../../features/coach/api/coach.api', () => ({
  getCoachSessions: vi.fn(),
  removeCoachFromSession: vi.fn(),
  registerCoachForSession: vi.fn(),
}));

vi.mock('../../../features/coach/components/SparringCoachRegistrationDialog', () => ({
  SparringCoachRegistrationDialog: ({ open, onCancel, onConfirm }: { open: boolean; onCancel: () => void; onConfirm: (d: unknown) => void }) =>
    open ? (
      <div role="dialog" aria-label="Sparring Registration">
        <button onClick={onCancel}>Cancel Sparring</button>
        <button onClick={() => onConfirm({ firstname: 'John', lastname: 'Doe', date: '2026-03-09', start_time: '18:00', end_time: '19:00' })}>Confirm Sparring</button>
      </div>
    ) : null,
}));

vi.mock('react-hot-toast', () => {
  const toastFn = Object.assign(vi.fn(), {
    success: vi.fn(),
    error: vi.fn(),
  });
  return { default: toastFn };
});

import { getCoachSessions } from '../../../features/coach/api/coach.api';
import { removeCoachFromSession } from '../../../features/coach/api/coach.api';
import toast from 'react-hot-toast';

const mockGetCoachSessions = vi.mocked(getCoachSessions);
const mockRemoveCoachFromSession = vi.mocked(removeCoachFromSession);
const mockToast = vi.mocked(toast);

const mockSession: SessionItem = {
  id: 'ws-1_2026-03-09',
  session_type: 'Kickboxing',
  session_type_alias: 'Nyrkkeilyharjoitus',
  date: '2026-03-09',
  start_time: '18:00',
  end_time: '19:30',
  location: 'Gym A',
  coach_firstname: '',
  coach_lastname: '',
  coach_alias: '',
  registration_id: '',
  is_free_sparring: false,
};

function toYmd(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getMonday(date: Date): Date {
  const copy = new Date(date);
  const day = copy.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  copy.setDate(copy.getDate() + diff);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function addDays(date: Date, days: number): Date {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

function buildMultiWeekSessions(): [SessionItem, SessionItem] {
  const monday = getMonday(new Date());
  const currentWeekDate = toYmd(addDays(monday, 2));
  const nextWeekDate = toYmd(addDays(monday, 8));

  return [
    {
      ...mockSession,
      id: 'ws-current-week',
      session_type: 'Current Week Session',
      date: currentWeekDate,
    },
    {
      ...mockSession,
      id: 'ws-next-week',
      session_type: 'Next Week Session',
      date: nextWeekDate,
    },
  ];
}

describe('CoachPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetCoachSessions.mockResolvedValue([]);
  });

  it('renders title "Coach Quick Registration"', async () => {
    render(<CoachPage onBack={vi.fn()} />);
    expect(screen.getByRole('heading', { name: 'Coach Quick Registration' })).toBeInTheDocument();
  });

  it('renders Back to main button', async () => {
    render(<CoachPage onBack={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Back to main' })).toBeInTheDocument();
  });

  it('renders Refresh data button', async () => {
    render(<CoachPage onBack={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Refresh data' })).toBeInTheDocument();
  });

  it('calls onBack when Back to main button is clicked', async () => {
    const onBack = vi.fn();
    render(<CoachPage onBack={onBack} />);
    await userEvent.click(screen.getByRole('button', { name: 'Back to main' }));
    expect(onBack).toHaveBeenCalledOnce();
  });

  it('shows "You are not registered" when no coachData provided', async () => {
    render(<CoachPage onBack={vi.fn()} />);
    expect(screen.getByText(/You are not registered/)).toBeInTheDocument();
  });

  it('shows logged-in coach alias when coachData with alias is provided', async () => {
    const coachData = {
      id: '1', firstname: 'John', lastname: 'Doe', alias: 'JD',
      pin: '1234', created_at: '', last_activity: '',
    };
    render(<CoachPage onBack={vi.fn()} coachData={coachData} />);
    expect(screen.getByText(/JD/)).toBeInTheDocument();
  });

  it('shows "No sessions found" when sessions list is empty', async () => {
    mockGetCoachSessions.mockResolvedValue([]);
    render(<CoachPage onBack={vi.fn()} />);
    await waitFor(() => {
      expect(screen.getByText('No sessions found')).toBeInTheDocument();
    });
  });

  it('shows error message when getCoachSessions rejects', async () => {
    mockGetCoachSessions.mockRejectedValue(new Error('Network error'));
    render(<CoachPage onBack={vi.fn()} />);
    await waitFor(() => {
      expect(screen.getByText('Failed to load sessions. Please try again.')).toBeInTheDocument();
    });
  });

  it('renders session cards grouped by date', async () => {
    mockGetCoachSessions.mockResolvedValue([mockSession]);
    render(<CoachPage onBack={vi.fn()} />);
    await waitFor(() => {
      expect(screen.getByText('Kickboxing')).toBeInTheDocument();
    });
  });

  it('renders week tabs when sessions span multiple calendar weeks', async () => {
    const [currentWeekSession, nextWeekSession] = buildMultiWeekSessions();
    mockGetCoachSessions.mockResolvedValue([currentWeekSession, nextWeekSession]);
    render(<CoachPage onBack={vi.fn()} />);

    await waitFor(() => {
      const tabs = screen.getAllByRole('tab');
      expect(tabs).toHaveLength(2);
    });
  });

  it('selects current week tab by default', async () => {
    const [currentWeekSession, nextWeekSession] = buildMultiWeekSessions();
    mockGetCoachSessions.mockResolvedValue([currentWeekSession, nextWeekSession]);
    render(<CoachPage onBack={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('Current Week Session')).toBeInTheDocument();
      expect(screen.queryByText('Next Week Session')).not.toBeInTheDocument();
    });
  });

  it('switches visible sessions when another week tab is selected', async () => {
    const [currentWeekSession, nextWeekSession] = buildMultiWeekSessions();
    const user = userEvent.setup();
    mockGetCoachSessions.mockResolvedValue([currentWeekSession, nextWeekSession]);
    render(<CoachPage onBack={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('Current Week Session')).toBeInTheDocument();
      expect(screen.queryByText('Next Week Session')).not.toBeInTheDocument();
    });

    const tabs = screen.getAllByRole('tab');
    await user.click(tabs[1]);

    await waitFor(() => {
      expect(screen.getByText('Next Week Session')).toBeInTheDocument();
      expect(screen.queryByText('Current Week Session')).not.toBeInTheDocument();
    });
  });

  it('shows ConfirmCoachRegistrationDialog when Register is clicked (PIN-authenticated coach)', async () => {
    const coachData = { id: '1', firstname: 'John', lastname: 'Doe', alias: 'JD', pin: '1234', created_at: '', last_activity: '' };
    mockGetCoachSessions.mockResolvedValue([mockSession]);
    render(<CoachPage onBack={vi.fn()} coachData={coachData} />);
    await waitFor(() => screen.getByRole('button', { name: 'Register' }));
    await userEvent.click(screen.getByRole('button', { name: 'Register' }));
    expect(screen.getByText('Confirm Registration')).toBeInTheDocument();
  });

  it('shows ManualCoachRegistrationDialog when Register is clicked (password-authenticated coach)', async () => {
    mockGetCoachSessions.mockResolvedValue([mockSession]);
    render(<CoachPage onBack={vi.fn()} />);
    await waitFor(() => screen.getByRole('button', { name: 'Register' }));
    await userEvent.click(screen.getByRole('button', { name: 'Register' }));
    expect(screen.getByText('Fill your information')).toBeInTheDocument();
  });

  it('shows ConfirmRemoveCoachDialog when Remove is clicked', async () => {
    const sessionWithCoach = { ...mockSession, coach_alias: 'JD', coach_firstname: 'John', coach_lastname: 'Doe', registration_id: 'reg-1' };
    mockGetCoachSessions.mockResolvedValue([sessionWithCoach]);
    render(<CoachPage onBack={vi.fn()} />);
    await waitFor(() => screen.getByRole('button', { name: 'Remove' }));
    await userEvent.click(screen.getByRole('button', { name: 'Remove' }));
    expect(screen.getByText('Confirm Removal')).toBeInTheDocument();
  });

  it('passes selected session and coachData to ConfirmCoachRegistrationDialog', async () => {
    const coachData = { id: '1', firstname: 'John', lastname: 'Doe', alias: 'JD', pin: '1234', created_at: '', last_activity: '' };
    mockGetCoachSessions.mockResolvedValue([mockSession]);
    render(<CoachPage onBack={vi.fn()} coachData={coachData} />);
    await waitFor(() => screen.getByRole('button', { name: 'Register' }));
    await userEvent.click(screen.getByRole('button', { name: 'Register' }));
    // Dialog should open and show confirmation title
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Confirm Registration' })).toBeInTheDocument();
  });

  it('dismisses dialog and shows cancellation toast when cancel is clicked', async () => {
    mockGetCoachSessions.mockResolvedValue([mockSession]);
    render(<CoachPage onBack={vi.fn()} />);
    await waitFor(() => screen.getByRole('button', { name: 'Register' }));
    await userEvent.click(screen.getByRole('button', { name: 'Register' }));
    const cancelBtn = screen.getByRole('button', { name: 'Cancel' });
    await userEvent.click(cancelBtn);
    await waitFor(() => expect(mockToast).toHaveBeenCalledWith('Registration cancelled.'));
  });

  it('shows ConfirmRemoveCoachDialog dismisses on cancel with removal cancellation toast', async () => {
    const sessionWithCoach = { ...mockSession, coach_alias: 'JD', coach_firstname: 'John', coach_lastname: 'Doe', registration_id: 'reg-1' };
    mockGetCoachSessions.mockResolvedValue([sessionWithCoach]);
    render(<CoachPage onBack={vi.fn()} />);
    await waitFor(() => screen.getByRole('button', { name: 'Remove' }));
    await userEvent.click(screen.getByRole('button', { name: 'Remove' }));
    const cancelBtn = screen.getByRole('button', { name: 'Cancel' });
    await userEvent.click(cancelBtn);
    await waitFor(() => expect(mockToast).toHaveBeenCalledWith('Registration removal cancelled.'));
  });

  it('updates session card to show Register button after successful removal', async () => {
    const sessionWithCoach = { ...mockSession, coach_alias: 'JD', coach_firstname: 'John', coach_lastname: 'Doe', registration_id: 'reg-1' };
    mockGetCoachSessions.mockResolvedValue([sessionWithCoach]);
    mockRemoveCoachFromSession.mockResolvedValue('reg-1');
    render(<CoachPage onBack={vi.fn()} />);
    await waitFor(() => screen.getByRole('button', { name: 'Remove' }));
    await userEvent.click(screen.getByRole('button', { name: 'Remove' }));
    await userEvent.click(screen.getByRole('button', { name: 'Confirm' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Register' })).toBeInTheDocument());
  });

  it('renders "Free/sparring session" button', async () => {
    render(<CoachPage onBack={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Free/sparring session' })).toBeInTheDocument();
  });

  it('shows SparringCoachRegistrationDialog when "Free/sparring session" button is clicked', async () => {
    render(<CoachPage onBack={vi.fn()} />);
    await userEvent.click(screen.getByRole('button', { name: 'Free/sparring session' }));
    expect(screen.getByRole('dialog', { name: 'Sparring Registration' })).toBeInTheDocument();
  });

  it('cancelling SparringCoachRegistrationDialog shows cancellation toast', async () => {
    render(<CoachPage onBack={vi.fn()} />);
    await userEvent.click(screen.getByRole('button', { name: 'Free/sparring session' }));
    await userEvent.click(screen.getByRole('button', { name: 'Cancel Sparring' }));
    expect(mockToast).toHaveBeenCalledWith('Registration cancelled.');
  });

  it('confirming SparringCoachRegistrationDialog opens ConfirmCoachRegistrationDialog', async () => {
    render(<CoachPage onBack={vi.fn()} />);
    await userEvent.click(screen.getByRole('button', { name: 'Free/sparring session' }));
    await userEvent.click(screen.getByRole('button', { name: 'Confirm Sparring' }));
    expect(screen.getByText('Confirm Registration')).toBeInTheDocument();
  });

  it('cancelling ConfirmCoachRegistrationDialog in sparring flow keeps SparringDialog open', async () => {
    render(<CoachPage onBack={vi.fn()} />);
    await userEvent.click(screen.getByRole('button', { name: 'Free/sparring session' }));
    await userEvent.click(screen.getByRole('button', { name: 'Confirm Sparring' }));
    // Wait for ConfirmDialog to appear before clicking Cancel
    await screen.findByText('Confirm Registration');
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    // SparringDialog should still be visible for modifications
    await waitFor(() =>
      expect(screen.getByRole('dialog', { name: 'Sparring Registration' })).toBeInTheDocument()
    );
  });
});
