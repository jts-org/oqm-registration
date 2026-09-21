import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

import '../../../../lib/i18n';
import { SparringCoachRegistrationDialog } from '../SparringCoachRegistrationDialog';
import type { SparringCoachRegistrationDialogProps } from '../SparringCoachRegistrationDialog';

function renderDialog(props: SparringCoachRegistrationDialogProps) {
  return render(
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <SparringCoachRegistrationDialog {...props} />
    </LocalizationProvider>
  );
}

const defaultProps: SparringCoachRegistrationDialogProps = {
  open: true,
  coachData: { firstname: 'John', lastname: 'Doe' },
  onConfirm: vi.fn(),
  onCancel: vi.fn(),
};

describe('SparringCoachRegistrationDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not render when open=false', () => {
    renderDialog({ ...defaultProps, open: false });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders when open=true', () => {
    renderDialog(defaultProps);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('displays title "Fill free/sparring session information"', () => {
    renderDialog(defaultProps);
    expect(screen.getByText(/Fill free\/sparring session information/i)).toBeInTheDocument();
  });

  it('renders "First name:" input', () => {
    renderDialog(defaultProps);
    expect(screen.getByLabelText(/First name/i)).toBeInTheDocument();
  });

  it('renders "Last name:" input', () => {
    renderDialog(defaultProps);
    expect(screen.getByLabelText(/Last name/i)).toBeInTheDocument();
  });

  it('renders "Date:" input', () => {
    renderDialog(defaultProps);
    expect(screen.getAllByLabelText(/Date/i).length).toBeGreaterThan(0);
  });

  it('renders "Start time:" input', () => {
    renderDialog(defaultProps);
    expect(screen.getAllByLabelText(/Start time/i).length).toBeGreaterThan(0);
  });

  it('renders "End time:" input', () => {
    renderDialog(defaultProps);
    expect(screen.getAllByLabelText(/End time/i).length).toBeGreaterThan(0);
  });

  it('resets location fields to the approved defaults when opened', () => {
    renderDialog(defaultProps);
    expect((screen.getByLabelText('Location') as HTMLInputElement).value).toBe('home gym');
    expect((screen.getByLabelText('Location alias') as HTMLInputElement).value).toBe('kotisali');
  });

  it('resets edited location fields when reopened', async () => {
    const { rerender } = renderDialog(defaultProps);
    await userEvent.clear(screen.getByLabelText('Location'));
    await userEvent.type(screen.getByLabelText('Location'), 'Competition hall');
    await userEvent.clear(screen.getByLabelText('Location alias'));
    await userEvent.type(screen.getByLabelText('Location alias'), 'Kilpahalli');

    rerender(
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <SparringCoachRegistrationDialog {...defaultProps} open={false} />
      </LocalizationProvider>
    );
    rerender(
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <SparringCoachRegistrationDialog {...defaultProps} open />
      </LocalizationProvider>
    );

    expect((screen.getByLabelText('Location') as HTMLInputElement).value).toBe('home gym');
    expect((screen.getByLabelText('Location alias') as HTMLInputElement).value).toBe('kotisali');
  });

  it('disables Confirm button when firstname is empty', () => {
    renderDialog({ ...defaultProps, coachData: undefined });
    expect(screen.getByRole('button', { name: /Confirm/i })).toBeDisabled();
  });

  it('enables Confirm button when coachData is provided', () => {
    renderDialog(defaultProps);
    expect(screen.getByRole('button', { name: /Confirm/i })).not.toBeDisabled();
  });

  it('calls onConfirm when Confirm button is clicked with valid data', async () => {
    renderDialog(defaultProps);
    await userEvent.click(screen.getByRole('button', { name: /Confirm/i }));
    expect(defaultProps.onConfirm).toHaveBeenCalledWith(
      expect.objectContaining({
        firstname: 'John',
        lastname: 'Doe',
        location: 'home gym',
        location_alias: 'kotisali',
      })
    );
  });

  it('forwards edited location values', async () => {
    renderDialog(defaultProps);
    await userEvent.clear(screen.getByLabelText('Location'));
    await userEvent.type(screen.getByLabelText('Location'), 'Long Training Hall');
    await userEvent.clear(screen.getByLabelText('Location alias'));
    await userEvent.type(screen.getByLabelText('Location alias'), 'Main hall');
    await userEvent.click(screen.getByRole('button', { name: /Confirm/i }));
    expect(defaultProps.onConfirm).toHaveBeenCalledWith(expect.objectContaining({
      location: 'Long Training Hall',
      location_alias: 'Main hall',
    }));
  });

  it('calls onCancel when Cancel button is clicked', async () => {
    renderDialog(defaultProps);
    await userEvent.click(screen.getByRole('button', { name: /Cancel/i }));
    expect(defaultProps.onCancel).toHaveBeenCalled();
  });

  it('pre-fills firstname and lastname from coachData', () => {
    renderDialog(defaultProps);
    const firstNameInput = screen.getByLabelText(/First name/i) as HTMLInputElement;
    const lastNameInput = screen.getByLabelText(/Last name/i) as HTMLInputElement;
    expect(firstNameInput.value).toBe('John');
    expect(lastNameInput.value).toBe('Doe');
  });
});
