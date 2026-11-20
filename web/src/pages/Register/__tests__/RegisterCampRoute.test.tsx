import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import App from '../../../App';

vi.mock('../../../app/providers/SettingsProvider', () => ({
  useSettingsContext: () => ({ settings: [], loading: false, error: null }),
}));
vi.mock('../RegisterCustomerEventPage', () => ({
  RegisterCustomerEventPage: ({ camp }: { camp?: boolean }) => <h1>{camp ? 'Camp registration' : 'Event registration'}</h1>,
}));

describe('camp registration routing', () => {
  it('routes a direct camp link to the camp registration flow', () => {
    window.history.pushState({}, '', '/register?camp=c1');
    render(<App />);
    expect(screen.getByRole('heading', { name: 'Camp registration' })).toBeInTheDocument();
  });
});
