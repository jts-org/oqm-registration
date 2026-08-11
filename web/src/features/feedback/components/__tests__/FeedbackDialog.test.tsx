import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import '../../../../lib/i18n';
import { i18n } from '../../../../lib/i18n';
import { FeedbackDialog } from '../FeedbackDialog';
import { verifyTraineePin } from '../../../trainee/api/trainee.api';
import { sendFeedback } from '../../api/feedback.api';

vi.mock('../../../trainee/api/trainee.api', () => ({
  verifyTraineePin: vi.fn(),
}));

vi.mock('../../api/feedback.api', () => ({
  sendFeedback: vi.fn(),
}));

const mockedVerifyTraineePin = vi.mocked(verifyTraineePin);
const mockedSendFeedback = vi.mocked(sendFeedback);

describe('FeedbackDialog', () => {
  beforeEach(async () => {
    mockedVerifyTraineePin.mockReset();
    mockedSendFeedback.mockReset();
    await i18n.changeLanguage('en');
  });

  it('opens the feedback form after a successful PIN verification', async () => {
    mockedVerifyTraineePin.mockResolvedValue({
      id: 'trainee-1',
      firstname: 'Ada',
      lastname: 'Lovelace',
      age: '17',
      pin: '1234',
      created_at: '2024-01-01T00:00:00.000Z',
      last_activity: '',
    });

    const user = userEvent.setup();
    render(<FeedbackDialog open onClose={vi.fn()} />);

    await user.type(screen.getByLabelText('Enter PIN code'), '1234');
    await user.click(screen.getByRole('button', { name: 'Verify' }));

    expect(await screen.findByText('Send feedback')).toBeInTheDocument();
    expect(screen.getByLabelText('Support request')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Ada Lovelace')).toBeInTheDocument();
  });

  it('sends feedback and closes the dialog on success', async () => {
    mockedVerifyTraineePin.mockResolvedValue({
      id: 'trainee-1',
      firstname: 'Ada',
      lastname: 'Lovelace',
      age: '17',
      pin: '1234',
      created_at: '2024-01-01T00:00:00.000Z',
      last_activity: '',
    });
    mockedSendFeedback.mockResolvedValue(undefined);

    const onClose = vi.fn();
    const user = userEvent.setup();
    render(<FeedbackDialog open onClose={onClose} />);

    await user.type(screen.getByLabelText('Enter PIN code'), '1234');
    await user.click(screen.getByRole('button', { name: 'Verify' }));

    await user.click(await screen.findByLabelText('Support request'));
    await user.type(await screen.findByLabelText('Message'), 'I need help with my PIN');
    await user.click(screen.getByRole('button', { name: 'Send' }));

    expect(mockedSendFeedback).toHaveBeenCalledWith({
      type: 'support_request',
      from: 'Ada Lovelace',
      message: 'I need help with my PIN',
    });
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('closes without submitting when the user cancels', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(<FeedbackDialog open onClose={onClose} />);

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(onClose).toHaveBeenCalledOnce();
    expect(mockedSendFeedback).not.toHaveBeenCalled();
  });

  it('disables Send when the message exceeds the 500-character limit', async () => {
    mockedVerifyTraineePin.mockResolvedValue({
      id: 'trainee-1',
      firstname: 'Ada',
      lastname: 'Lovelace',
      age: '17',
      pin: '1234',
      created_at: '2024-01-01T00:00:00.000Z',
      last_activity: '',
    });

    const user = userEvent.setup();
    render(<FeedbackDialog open onClose={vi.fn()} />);

    await user.type(screen.getByLabelText('Enter PIN code'), '1234');
    await user.click(screen.getByRole('button', { name: 'Verify' }));

    const longMessage = 'x'.repeat(501);
    fireEvent.change(await screen.findByLabelText('Message'), { target: { value: longMessage } });

    expect(screen.getByRole('button', { name: 'Send' })).toBeDisabled();
  });
});
