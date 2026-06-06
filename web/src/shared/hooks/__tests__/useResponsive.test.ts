/**
 * @copyright 2026 Jouni Sipola by OQM. All rights reserved.
 * Permission granted for personal/internal use only. Commercial
 * use prohibited except by copyright holder. See LICENSE for details.
 */

/**
 * @description Tests for useResponsive hooks — mobile/tablet/desktop detection and dialog behavior.
 */
import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { useIsMobile, useIsTablet, useIsDesktop, useResponsiveDialog } from '../useResponsive';
import React from 'react';

// Mock matchMedia for different viewport sizes
function mockMatchMedia(matches: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

const theme = createTheme();
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider theme={theme}>{children}</ThemeProvider>
);

describe('useResponsive hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useIsMobile', () => {
    it('returns true when viewport is below sm breakpoint (< 600px)', () => {
      mockMatchMedia(true); // Matches the breakpoint query
      const { result } = renderHook(() => useIsMobile(), { wrapper });
      expect(result.current).toBe(true);
    });

    it('returns false when viewport is at or above sm breakpoint (≥ 600px)', () => {
      mockMatchMedia(false); // Does not match the breakpoint query
      const { result } = renderHook(() => useIsMobile(), { wrapper });
      expect(result.current).toBe(false);
    });
  });

  describe('useIsTablet', () => {
    it('returns true when viewport is between sm and md breakpoints', () => {
      mockMatchMedia(true);
      const { result } = renderHook(() => useIsTablet(), { wrapper });
      expect(result.current).toBe(true);
    });

    it('returns false when viewport is outside tablet range', () => {
      mockMatchMedia(false);
      const { result } = renderHook(() => useIsTablet(), { wrapper });
      expect(result.current).toBe(false);
    });
  });

  describe('useIsDesktop', () => {
    it('returns true when viewport is at or above md breakpoint (≥ 960px)', () => {
      mockMatchMedia(true);
      const { result } = renderHook(() => useIsDesktop(), { wrapper });
      expect(result.current).toBe(true);
    });

    it('returns false when viewport is below md breakpoint', () => {
      mockMatchMedia(false);
      const { result } = renderHook(() => useIsDesktop(), { wrapper });
      expect(result.current).toBe(false);
    });
  });

  describe('useResponsiveDialog', () => {
    it('returns fullScreen=true on mobile viewport', () => {
      mockMatchMedia(true); // Mobile viewport
      const { result } = renderHook(() => useResponsiveDialog(), { wrapper });
      expect(result.current.fullScreen).toBe(true);
    });

    it('returns fullScreen=false on desktop viewport', () => {
      mockMatchMedia(false); // Desktop viewport
      const { result } = renderHook(() => useResponsiveDialog(), { wrapper });
      expect(result.current.fullScreen).toBe(false);
    });
  });
});
