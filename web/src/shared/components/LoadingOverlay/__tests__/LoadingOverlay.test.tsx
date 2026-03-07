/**
 * @copyright 2026 Jouni Sipola by OQM. All rights reserved.
 * Permission granted for personal/internal use only. Commercial
 * use prohibited except by copyright holder. See LICENSE for details.
 */

/**
 * @description Tests for LoadingOverlay — validates rendering, accessibility, and visibility toggling.
 *   Written before implementation (TDD).
 */
import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

import '../../../../lib/i18n';
import { LoadingOverlay } from '../LoadingOverlay';

describe('LoadingOverlay', () => {
  it('renders nothing when visible=false', () => {
    const { container } = render(<LoadingOverlay visible={false} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders when visible=true', () => {
    render(<LoadingOverlay visible={true} />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('has aria-label "Loading" for screen readers', () => {
    render(<LoadingOverlay visible={true} />);
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Loading');
  });

  it('has aria-live="polite" for screen readers', () => {
    render(<LoadingOverlay visible={true} />);
    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite');
  });

  it('renders the spinner element', () => {
    render(<LoadingOverlay visible={true} />);
    // The spinner is a div inside the overlay
    const overlay = screen.getByRole('status');
    expect(overlay.firstElementChild).not.toBeNull();
  });
});
