/**
 * @copyright 2026 Jouni Sipola by OQM. All rights reserved.
 * Permission granted for personal/internal use only. Commercial
 * use prohibited except by copyright holder. See LICENSE for details.
 */

/**
 * @description Tests for App routing behavior.
 *   Verifies the app uses route-based navigation between the home page and
 *   role-specific pages while preserving coach verification state in-session.
 */
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import './lib/i18n';
import App from './App';

vi.mock('./app/providers/SettingsProvider', () => ({
  useSettingsContext: () => ({
    settings: [
      { parameter: 'coach_pwd', value: 'coach-secret' },
      { parameter: 'admin_pwd', value: 'admin-secret' },
    ],
    loading: false,
    error: null,
    reload: vi.fn(),
  }),
}));

vi.mock('./pages/Home/HomePage', () => ({
  HomePage: ({
    onGoTrainee,
    onGoCoach,
    onGoAdmin,
  }: {
    onGoTrainee: () => void;
    onGoCoach: (result: { sessionToken: string; coachData?: { alias?: string } }) => void;
    onGoAdmin: (sessionToken: string) => void;
  }) => (
    <div>
      <h1>Home page</h1>
      <button type="button" onClick={onGoTrainee}>Go trainee</button>
      <button type="button" onClick={() => onGoCoach({ sessionToken: 'coach-session', coachData: { alias: 'Coach Alias' } })}>Go coach</button>
      <button type="button" onClick={() => onGoAdmin('admin-session')}>Go admin</button>
    </div>
  ),
}));

vi.mock('./pages/Trainee/TraineePage', () => ({
  TraineePage: ({ onBack }: { onBack: () => void }) => (
    <div>
      <h1>Trainee page</h1>
      <button type="button" onClick={onBack}>Back home</button>
    </div>
  ),
}));

vi.mock('./pages/Coach/CoachPage', () => ({
  CoachPage: ({ onBack, coachData }: { onBack: () => void; coachData?: { alias?: string } }) => (
    <div>
      <h1>Coach page</h1>
      <p>{coachData?.alias ?? 'No coach'}</p>
      <button type="button" onClick={onBack}>Back home</button>
    </div>
  ),
}));

vi.mock('./pages/Admin/AdminPage', () => ({
  AdminPage: ({ onBack }: { onBack: () => void }) => (
    <div>
      <h1>Admin page</h1>
      <button type="button" onClick={onBack}>Back home</button>
    </div>
  ),
}));

describe('App', () => {
  beforeEach(() => {
    window.history.pushState({}, '', '/');
  });

  it('renders the home route by default', () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: 'Home page' })).toBeInTheDocument();
  });

  it('navigates to the trainee route from the home page', async () => {
    render(<App />);

    await userEvent.click(screen.getByRole('button', { name: 'Go trainee' }));

    expect(window.location.pathname).toBe('/trainee');
    expect(screen.getByRole('heading', { name: 'Trainee page' })).toBeInTheDocument();
  });

  it('navigates to the coach route and forwards verified coach data', async () => {
    render(<App />);

    await userEvent.click(screen.getByRole('button', { name: 'Go coach' }));

    expect(window.location.pathname).toBe('/coach');
    expect(screen.getByRole('heading', { name: 'Coach page' })).toBeInTheDocument();
    expect(screen.getByText('Coach Alias')).toBeInTheDocument();
  });

  it('navigates to the admin route from the home page', async () => {
    render(<App />);

    await userEvent.click(screen.getByRole('button', { name: 'Go admin' }));

    expect(window.location.pathname).toBe('/admin');
    expect(screen.getByRole('heading', { name: 'Admin page' })).toBeInTheDocument();
  });

  it('returns to the home route when a role page triggers back navigation', async () => {
    render(<App />);

    await userEvent.click(screen.getByRole('button', { name: 'Go trainee' }));
    await userEvent.click(screen.getByRole('button', { name: 'Back home' }));

    expect(window.location.pathname).toBe('/');
    expect(screen.getByRole('heading', { name: 'Home page' })).toBeInTheDocument();
  });

  it('redirects direct coach route access back to home when no coach session exists', () => {
    window.history.pushState({}, '', '/coach');

    render(<App />);

    expect(window.location.pathname).toBe('/');
    expect(screen.getByRole('heading', { name: 'Home page' })).toBeInTheDocument();
  });

  it('redirects direct admin route access back to home when no admin session exists', () => {
    window.history.pushState({}, '', '/admin');

    render(<App />);

    expect(window.location.pathname).toBe('/');
    expect(screen.getByRole('heading', { name: 'Home page' })).toBeInTheDocument();
  });
});