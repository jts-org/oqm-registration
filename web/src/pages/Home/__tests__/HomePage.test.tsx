/**
 * @copyright 2026 Jouni Sipola by OQM
 * @description Tests for HomePage — main view with Trainees, Coaches, Admin buttons.
 *   Written before implementation (TDD).
 */
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import '../../../lib/i18n';
import { HomePage } from '../HomePage';

const defaultProps = {
  onGoTrainee: vi.fn(),
  onGoCoach: vi.fn(),
  onGoAdmin: vi.fn(),
  coachPassword: 'secret123',
  adminPassword: 'admin456',
};

describe('HomePage', () => {
  it('renders placeholder message', () => {
    render(<HomePage {...defaultProps} />);
    expect(screen.getByText('Welcome to OQM Registration')).toBeInTheDocument();
  });

  it('renders Trainees button', () => {
    render(<HomePage {...defaultProps} />);
    expect(screen.getByRole('button', { name: 'Trainees' })).toBeInTheDocument();
  });

  it('renders Coaches button', () => {
    render(<HomePage {...defaultProps} />);
    expect(screen.getByRole('button', { name: 'Coaches' })).toBeInTheDocument();
  });

  it('renders Admin button', () => {
    render(<HomePage {...defaultProps} />);
    expect(screen.getByRole('button', { name: 'Admin' })).toBeInTheDocument();
  });

  it('calls onGoTrainee when Trainees button is clicked', async () => {
    const onGoTrainee = vi.fn();
    render(<HomePage {...defaultProps} onGoTrainee={onGoTrainee} />);
    await userEvent.click(screen.getByRole('button', { name: 'Trainees' }));
    expect(onGoTrainee).toHaveBeenCalledOnce();
  });

  it('opens coach login dialog when Coaches button is clicked', async () => {
    render(<HomePage {...defaultProps} />);
    await userEvent.click(screen.getByRole('button', { name: 'Coaches' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Coach login')).toBeInTheDocument();
  });

  it('opens admin login dialog when Admin button is clicked', async () => {
    render(<HomePage {...defaultProps} />);
    await userEvent.click(screen.getByRole('button', { name: 'Admin' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Admin login')).toBeInTheDocument();
  });
});
