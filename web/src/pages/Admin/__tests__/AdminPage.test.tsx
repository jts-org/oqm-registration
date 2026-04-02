/**
 * @copyright 2026 Jouni Sipola by OQM. All rights reserved.
 * Permission granted for personal/internal use only. Commercial
 * use prohibited except by copyright holder. See LICENSE for details.
 */

/**
 * @description Tests for AdminPage admin navigation and section rendering.
 *   Written before implementation (TDD).
 */
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import '../../../lib/i18n';
import { AdminPage } from '../AdminPage';

describe('AdminPage', () => {
  it('renders admin shell title and default dashboard section', () => {
    render(<AdminPage onBack={vi.fn()} />);

    expect(screen.getByRole('heading', { name: 'Administrator' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'User management' })).toBeInTheDocument();
  });

  it('switches to reports and shows report tabs', async () => {
    render(<AdminPage onBack={vi.fn()} />);

    await userEvent.click(screen.getByRole('button', { name: 'Reports' }));

    expect(screen.getByRole('heading', { name: 'Reports' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Logs' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Usage reports' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Errors' })).toBeInTheDocument();
  });

  it('changes report content when switching tabs', async () => {
    render(<AdminPage onBack={vi.fn()} />);

    await userEvent.click(screen.getByRole('button', { name: 'Reports' }));
    await userEvent.click(screen.getByRole('tab', { name: 'Usage reports' }));

    expect(screen.getByText('Usage report content placeholder.')).toBeInTheDocument();
  });

  it('opens reports section from dashboard card action', async () => {
    render(<AdminPage onBack={vi.fn()} />);

    const openButtons = screen.getAllByRole('button', { name: 'Open' });
    await userEvent.click(openButtons[1]);

    expect(screen.getByRole('heading', { name: 'Reports' })).toBeInTheDocument();
  });

  it('calls onBack when Back to main button is clicked', async () => {
    const onBack = vi.fn();
    render(<AdminPage onBack={onBack} />);

    await userEvent.click(screen.getByRole('button', { name: 'Back to main' }));

    expect(onBack).toHaveBeenCalledOnce();
  });

  it('opens batch feed section and keeps submit disabled until rows are valid', async () => {
    render(<AdminPage onBack={vi.fn()} sessionToken="token-1" />);

    await userEvent.click(screen.getByRole('button', { name: 'Batch feed' }));

    expect(screen.getByRole('heading', { name: 'Batch feed trainee registrations' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Add row' })).toBeInTheDocument();
  });
});
