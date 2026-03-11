/**
 * @copyright 2026 Jouni Sipola by OQM. All rights reserved.
 * Permission granted for personal/internal use only. Commercial
 * use prohibited except by copyright holder. See LICENSE for details.
 */

/**
 * @description Tests for ConfirmCoachRegistrationDialog — dummy confirmation dialog.
 *   Written before implementation (TDD).
 */
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import '../../../../lib/i18n';
import { ConfirmCoachRegistrationDialog } from '../ConfirmCoachRegistrationDialog';

const defaultProps = {
  open: true,
  onConfirm: vi.fn(),
  onCancel: vi.fn(),
};

describe('ConfirmCoachRegistrationDialog', () => {
  it('does not render when open=false', () => {
    render(<ConfirmCoachRegistrationDialog {...defaultProps} open={false} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders when open=true', () => {
    render(<ConfirmCoachRegistrationDialog {...defaultProps} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('renders title "Confirm Registration"', () => {
    render(<ConfirmCoachRegistrationDialog {...defaultProps} />);
    expect(screen.getByText('Confirm Registration')).toBeInTheDocument();
  });

  it('renders confirmation message', () => {
    render(<ConfirmCoachRegistrationDialog {...defaultProps} />);
    expect(screen.getByText('Register for this session?')).toBeInTheDocument();
  });

  it('renders Confirm button', () => {
    render(<ConfirmCoachRegistrationDialog {...defaultProps} />);
    expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument();
  });

  it('renders Cancel button', () => {
    render(<ConfirmCoachRegistrationDialog {...defaultProps} />);
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  it('calls onConfirm when Confirm is clicked', async () => {
    const onConfirm = vi.fn();
    render(<ConfirmCoachRegistrationDialog {...defaultProps} onConfirm={onConfirm} />);
    await userEvent.click(screen.getByRole('button', { name: 'Confirm' }));
    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it('calls onCancel when Cancel is clicked', async () => {
    const onCancel = vi.fn();
    render(<ConfirmCoachRegistrationDialog {...defaultProps} onCancel={onCancel} />);
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onCancel).toHaveBeenCalledOnce();
  });
});
