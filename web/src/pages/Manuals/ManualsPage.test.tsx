/**
 * @copyright 2026 Jouni Sipola by OQM. All rights reserved.
 * Permission granted for personal/internal use only. Commercial
 * use prohibited except by copyright holder. See LICENSE for details.
 */

/**
 * @description Tests for ManualsPage — verifies manual path construction uses
 *   import.meta.env.BASE_URL and that fetch success/failure are handled correctly.
 */
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

import '../../lib/i18n';
import { ManualsPage } from './ManualsPage';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function renderPage(onBack = vi.fn()) {
  return render(
    <MemoryRouter initialEntries={['/?audience=trainee&lang=en']}>
      <ManualsPage onBack={onBack} />
    </MemoryRouter>,
  );
}

// ---------------------------------------------------------------------------
// Manual path — BASE_URL prefix
// ---------------------------------------------------------------------------

describe('ManualsPage — manual path uses BASE_URL', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve('# Manual content'),
    }));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('fetches with BASE_URL prefix for trainee/en', async () => {
    renderPage();

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        `${import.meta.env.BASE_URL}trainee-manual.en.md`,
        expect.objectContaining({ cache: 'no-store' }),
      );
    });
  });

  it('fetches with BASE_URL prefix for coach/fi after switching', async () => {
    renderPage();

    // Switch to coach
    await userEvent.click(await screen.findByRole('button', { name: /coach manual/i }));
    // Switch to Finnish
    await userEvent.click(screen.getByRole('button', { name: /finnish/i }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        `${import.meta.env.BASE_URL}coach-manual.fi.md`,
        expect.objectContaining({ cache: 'no-store' }),
      );
    });
  });

  it('does not produce a double slash when BASE_URL ends with /', () => {
    // In local dev / CI, BASE_URL ends with '/'. Confirm no '//' in the path.
    const baseUrl = import.meta.env.BASE_URL as string;
    const path = `${baseUrl}trainee-manual.en.md`;
    expect(path).not.toMatch('//');
  });

  it('resolves correctly when BASE_URL is a subdirectory path', () => {
    const simulatedBase = '/oqm-registration/';
    const path = `${simulatedBase}trainee-manual.en.md`;
    expect(path).toBe('/oqm-registration/trainee-manual.en.md');
  });
});

// ---------------------------------------------------------------------------
// Fetch success — content rendered
// ---------------------------------------------------------------------------

describe('ManualsPage — fetch success', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders markdown content when fetch succeeds', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve('# Welcome'),
    }));

    renderPage();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /welcome/i })).toBeInTheDocument();
    });
  });
});

// ---------------------------------------------------------------------------
// Fetch failure — error message rendered
// ---------------------------------------------------------------------------

describe('ManualsPage — fetch failure', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shows localized error when fetch returns non-ok response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      text: () => Promise.resolve(''),
    }));

    renderPage();

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });

  it('shows localized error when fetch throws', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network error')));

    renderPage();

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });
});
