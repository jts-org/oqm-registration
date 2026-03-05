/**
 * @copyright 2026 Jouni Sipola by OQM
 * @description Tests for TraineePage — dummy trainee registration view.
 *   Written before implementation (TDD).
 */
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import '../../../lib/i18n';
import { TraineePage } from '../TraineePage';

describe('TraineePage', () => {
  it('renders title "Trainee registration"', () => {
    render(<TraineePage onBack={vi.fn()} />);
    expect(screen.getByRole('heading', { name: 'Trainee registration' })).toBeInTheDocument();
  });

  it('renders Back to main button', () => {
    render(<TraineePage onBack={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Back to main' })).toBeInTheDocument();
  });

  it('calls onBack when Back to main button is clicked', async () => {
    const onBack = vi.fn();
    render(<TraineePage onBack={onBack} />);
    await userEvent.click(screen.getByRole('button', { name: 'Back to main' }));
    expect(onBack).toHaveBeenCalledOnce();
  });
});
