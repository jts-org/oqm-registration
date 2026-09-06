/**
 * @copyright 2026 Jouni Sipola by OQM. All rights reserved.
 * Permission granted for personal/internal use only. Commercial
 * use prohibited except by copyright holder. See LICENSE for details.
 */

import { describe, it, expect } from 'vitest';
import { formatDateDisplay, formatTimeDisplay } from '../formatters';

describe('formatters', () => {
  describe('formatDateDisplay', () => {
    it('formats YYYY-MM-DD to D.M.YYYY without leading zeros', () => {
      expect(formatDateDisplay('2026-04-15')).toBe('15.4.2026');
      expect(formatDateDisplay('2026-09-05')).toBe('5.9.2026');
    });

    it('formats full JS Date string to D.M.YYYY', () => {
      expect(formatDateDisplay('Wed Apr 15 2026 00:00:00 GMT+0300 (Itä-Euroopan kesäaika)')).toBe('15.4.2026');
    });

    it('returns empty string for empty input', () => {
      expect(formatDateDisplay('')).toBe('');
    });
  });

  describe('formatTimeDisplay', () => {
    it('formats HH:mm or HH:mm:ss to HH:mm', () => {
      expect(formatTimeDisplay('11:45')).toBe('11:45');
      expect(formatTimeDisplay('11:45:00')).toBe('11:45');
      expect(formatTimeDisplay('13:15:00')).toBe('13:15');
    });

    it('formats full JS Date string to HH:mm', () => {
      expect(formatTimeDisplay('Sat Dec 30 1899 11:45:00 GMT+0139 (Itä-Euroopan normaaliaika)')).toBe('11:45');
      expect(formatTimeDisplay('Sat Dec 30 1899 13:15:00 GMT+0139 (Itä-Euroopan normaaliaika)')).toBe('13:15');
    });

    it('returns empty string for empty input', () => {
      expect(formatTimeDisplay('')).toBe('');
    });
  });
});
