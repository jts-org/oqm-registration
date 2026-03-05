/**
 * @copyright 2026 Jouni Sipola by OQM
 * @description Tests for RegisterPinDialog — reusable modal for registering a PIN code.
 *   Written before implementation (TDD).
 */
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import '../../../../lib/i18n';
import { RegisterPinDialog } from '../RegisterPinDialog';

describe('RegisterPinDialog', () => {
  it('does not render when open=false', () => {
    render(<RegisterPinDialog open={false} onRegister={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders when open=true', () => {
    render(<RegisterPinDialog open={true} onRegister={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('displays title "Register new PIN code"', () => {
    render(<RegisterPinDialog open={true} onRegister={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.getByText('Register new PIN code')).toBeInTheDocument();
  });

  it('renders "Enter new PIN code" input', () => {
    render(<RegisterPinDialog open={true} onRegister={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.getByLabelText('Enter new PIN code')).toBeInTheDocument();
  });

  it('renders "Enter PIN again" input', () => {
    render(<RegisterPinDialog open={true} onRegister={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.getByLabelText('Enter PIN again')).toBeInTheDocument();
  });

  it('renders Register button', () => {
    render(<RegisterPinDialog open={true} onRegister={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Register' })).toBeInTheDocument();
  });

  it('renders Cancel button', () => {
    render(<RegisterPinDialog open={true} onRegister={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  it('Register button is disabled when both inputs are empty', () => {
    render(<RegisterPinDialog open={true} onRegister={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Register' })).toBeDisabled();
  });

  it('Register button is disabled when PIN has fewer than 4 digits', async () => {
    render(<RegisterPinDialog open={true} onRegister={vi.fn()} onCancel={vi.fn()} />);
    await userEvent.type(screen.getByLabelText('Enter new PIN code'), '123');
    await userEvent.type(screen.getByLabelText('Enter PIN again'), '123');
    expect(screen.getByRole('button', { name: 'Register' })).toBeDisabled();
  });

  it('Register button is disabled when PINs do not match', async () => {
    render(<RegisterPinDialog open={true} onRegister={vi.fn()} onCancel={vi.fn()} />);
    await userEvent.type(screen.getByLabelText('Enter new PIN code'), '1234');
    await userEvent.type(screen.getByLabelText('Enter PIN again'), '5678');
    expect(screen.getByRole('button', { name: 'Register' })).toBeDisabled();
  });

  it('Register button is disabled when PIN contains non-numeric characters', async () => {
    render(<RegisterPinDialog open={true} onRegister={vi.fn()} onCancel={vi.fn()} />);
    await userEvent.type(screen.getByLabelText('Enter new PIN code'), 'abc1');
    await userEvent.type(screen.getByLabelText('Enter PIN again'), 'abc1');
    expect(screen.getByRole('button', { name: 'Register' })).toBeDisabled();
  });

  it('Register button is disabled when PIN has more than 6 digits', async () => {
    render(<RegisterPinDialog open={true} onRegister={vi.fn()} onCancel={vi.fn()} />);
    await userEvent.type(screen.getByLabelText('Enter new PIN code'), '1234567');
    await userEvent.type(screen.getByLabelText('Enter PIN again'), '1234567');
    expect(screen.getByRole('button', { name: 'Register' })).toBeDisabled();
  });

  it('Register button is enabled when both PINs are identical, 4–6 digits', async () => {
    render(<RegisterPinDialog open={true} onRegister={vi.fn()} onCancel={vi.fn()} />);
    await userEvent.type(screen.getByLabelText('Enter new PIN code'), '1234');
    await userEvent.type(screen.getByLabelText('Enter PIN again'), '1234');
    expect(screen.getByRole('button', { name: 'Register' })).toBeEnabled();
  });

  it('calls onRegister with the PIN when Register is clicked', async () => {
    const onRegister = vi.fn();
    render(<RegisterPinDialog open={true} onRegister={onRegister} onCancel={vi.fn()} />);
    await userEvent.type(screen.getByLabelText('Enter new PIN code'), '4321');
    await userEvent.type(screen.getByLabelText('Enter PIN again'), '4321');
    await userEvent.click(screen.getByRole('button', { name: 'Register' }));
    expect(onRegister).toHaveBeenCalledWith('4321');
  });

  it('calls onCancel when Cancel is clicked', async () => {
    const onCancel = vi.fn();
    render(<RegisterPinDialog open={true} onRegister={vi.fn()} onCancel={onCancel} />);
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onCancel).toHaveBeenCalledOnce();
  });
});
