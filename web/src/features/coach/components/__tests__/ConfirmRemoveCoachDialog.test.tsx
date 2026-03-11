/**
 * @copyright 2026 Jouni Sipola by OQM. All rights reserved.
 * Permission granted for personal/internal use only. Commercial
 * use prohibited except by copyright holder. See LICENSE for details.
 */

/**
 * @description Tests for ConfirmRemoveCoachDialog — dummy confirmation dialog.
 *   Written before implementation (TDD).
 */
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import '../../../../lib/i18n';
import { ConfirmRemoveCoachDialog } from '../ConfirmRemoveCoachDialog';

const defaultProps = {
  open: true,
  onConfirm: vi.fn(),
  onCancel: vi.fn(),
};

describe('ConfirmRemoveCoachDialog', () => {
  it('does not render when open=false', () => {
    render(<ConfirmRemoveCoachDialog {...defaultProps} open={false} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders when open=true', () => {
    render(<ConfirmRemoveCoachDialog {...defaultProps} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('renders title "Confirm Removal"', () => {
    render(<ConfirmRemoveCoachDialog {...defaultProps} />);
    expect(screen.getByText('Confirm Removal')).toBeInTheDocument();
  });

  it('renders confirmation message', () => {
    render(<ConfirmRemoveCoachDialog {...defaultProps} />);
    expect(screen.getByText('Remove from this session?')).toBeInTheDocument();
  });

  it('renders Confirm button', () => {
    render(<ConfirmRemoveCoachDialog {...defaultProps} />);
    expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument();
  });

  it('renders Cancel button', () => {
    render(<ConfirmRemoveCoachDialog {...defaultProps} />);
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  it('calls onConfirm when Confirm is clicked', async () => {
    const onConfirm = vi.fn();
    render(<ConfirmRemoveCoachDialog {...defaultProps} onConfirm={onConfirm} />);
    await userEvent.click(screen.getByRole('button', { name: 'Confirm' }));
    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it('calls onCancel when Cancel is clicked', async () => {
    const onCancel = vi.fn();
    render(<ConfirmRemoveCoachDialog {...defaultProps} onCancel={onCancel} />);
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onCancel).toHaveBeenCalledOnce();
  });
});
