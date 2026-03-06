/**
 * @copyright 2026 Jouni Sipola by OQM
 * @description Tests for AdminPage — dummy administrator view.
 *   Written before implementation (TDD).
 */
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import '../../../lib/i18n';
import { AdminPage } from '../AdminPage';

describe('AdminPage', () => {
  it('renders title "Administrator"', () => {
    render(<AdminPage onBack={vi.fn()} />);
    expect(screen.getByRole('heading', { name: 'Administrator' })).toBeInTheDocument();
  });

  it('renders Back to main button', () => {
    render(<AdminPage onBack={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Back to main' })).toBeInTheDocument();
  });

  it('calls onBack when Back to main button is clicked', async () => {
    const onBack = vi.fn();
    render(<AdminPage onBack={onBack} />);
    await userEvent.click(screen.getByRole('button', { name: 'Back to main' }));
    expect(onBack).toHaveBeenCalledOnce();
  });
});
