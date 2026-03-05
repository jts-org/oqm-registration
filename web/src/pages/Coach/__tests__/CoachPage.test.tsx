/**
 * @copyright 2026 Jouni Sipola by OQM
 * @description Tests for CoachPage — dummy coach registration view.
 *   Written before implementation (TDD).
 */
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import '../../../lib/i18n';
import { CoachPage } from '../CoachPage';

describe('CoachPage', () => {
  it('renders title "Coach registration"', () => {
    render(<CoachPage onBack={vi.fn()} />);
    expect(screen.getByRole('heading', { name: 'Coach registration' })).toBeInTheDocument();
  });

  it('renders Back to main button', () => {
    render(<CoachPage onBack={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Back to main' })).toBeInTheDocument();
  });

  it('calls onBack when Back to main button is clicked', async () => {
    const onBack = vi.fn();
    render(<CoachPage onBack={onBack} />);
    await userEvent.click(screen.getByRole('button', { name: 'Back to main' }));
    expect(onBack).toHaveBeenCalledOnce();
  });
});
