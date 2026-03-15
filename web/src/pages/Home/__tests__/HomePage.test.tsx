/**
 * @copyright 2026 Jouni Sipola by OQM
 * @description Tests for HomePage — main view with Trainees, Coaches, Admin buttons.
 *   Written before implementation (TDD).
 */
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
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
  const getRoleCardButton = (title: string) => {
    const cardTitle = screen.getByText(title);
    const button = cardTitle.closest('button');

    expect(button).not.toBeNull();

    return button as HTMLButtonElement;
  };

  it('renders the localized title and subtitle', () => {
    render(<HomePage {...defaultProps} />);
    expect(screen.getByRole('img', { name: 'OKB logo' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'OQM compact logo' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'React logo' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Vite logo' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'OQM Registration' })).toBeInTheDocument();
    expect(screen.getByText('Select your role to continue')).toBeInTheDocument();
    expect(screen.getByText('Powered by React + Vite')).toBeInTheDocument();
    expect(screen.getByText(/Overclocked Quantum Moose/i)).toBeInTheDocument();
    expect(screen.getByText(/All rights reserved/i)).toBeInTheDocument();
  });

  it('renders trainee role card', () => {
    render(<HomePage {...defaultProps} />);
    expect(screen.getByText('Create a trainee profile and register for training sessions.')).toBeInTheDocument();
    expect(within(getRoleCardButton('Trainees')).getByText('Trainees')).toBeInTheDocument();
  });

  it('renders coach role card', () => {
    render(<HomePage {...defaultProps} />);
    expect(screen.getByText('Create a coach profile, register as a coach, and track your progress.')).toBeInTheDocument();
    expect(within(getRoleCardButton('Coaches')).getByText('Coaches')).toBeInTheDocument();
  });

  it('renders admin role card', () => {
    render(<HomePage {...defaultProps} />);
    expect(screen.getByText('Manage system settings and users.')).toBeInTheDocument();
    expect(within(getRoleCardButton('Admin')).getByText('Admin')).toBeInTheDocument();
  });

  it('calls onGoTrainee when the trainee role card is clicked', async () => {
    const onGoTrainee = vi.fn();
    render(<HomePage {...defaultProps} onGoTrainee={onGoTrainee} />);
    await userEvent.click(getRoleCardButton('Trainees'));
    expect(onGoTrainee).toHaveBeenCalledOnce();
  });

  it('opens coach login dialog when the coach role card is clicked', async () => {
    render(<HomePage {...defaultProps} />);
    await userEvent.click(getRoleCardButton('Coaches'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Coach login')).toBeInTheDocument();
  });

  it('opens admin login dialog when the admin role card is clicked', async () => {
    render(<HomePage {...defaultProps} />);
    await userEvent.click(getRoleCardButton('Admin'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Admin login')).toBeInTheDocument();
  });
});
