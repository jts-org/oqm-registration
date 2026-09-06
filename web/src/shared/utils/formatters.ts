/**
 * @copyright 2026 Jouni Sipola by OQM. All rights reserved.
 * Permission granted for personal/internal use only. Commercial
 * use prohibited except by copyright holder. See LICENSE for details.
 */

/**
 * Format a date string (e.g. '2026-04-15' or JS Date string) into local display format 'D.M.YYYY' (e.g. '15.4.2026').
 */
export function formatDateDisplay(dateStr: string): string {
  if (!dateStr) return '';
  const trimmed = dateStr.trim();

  // Match ISO/YMD format 'YYYY-MM-DD'
  const ymdMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (ymdMatch) {
    const year = ymdMatch[1];
    const month = parseInt(ymdMatch[2], 10);
    const day = parseInt(ymdMatch[3], 10);
    return `${day}.${month}.${year}`;
  }

  // Fallback for full JS Date string e.g. "Wed Apr 15 2026 00:00:00 GMT+0300..."
  const parsed = new Date(trimmed);
  if (!isNaN(parsed.getTime())) {
    return `${parsed.getDate()}.${parsed.getMonth() + 1}.${parsed.getFullYear()}`;
  }

  return trimmed;
}

/**
 * Format a time string (e.g. '11:45', '11:45:00', or JS Date string) into 'HH:mm' (e.g. '11:45').
 */
export function formatTimeDisplay(timeStr: string): string {
  if (!timeStr) return '';
  const trimmed = timeStr.trim();

  // Extract HH:mm pattern if present in string (e.g. "11:45", "11:45:00", or embedded in a Date string)
  const match = trimmed.match(/(?:^|\s|T)(\d{1,2}):(\d{2})(?::\d{2})?/);
  if (match) {
    const hh = match[1].padStart(2, '0');
    const mm = match[2];
    return `${hh}:${mm}`;
  }

  const parsed = new Date(trimmed);
  if (!isNaN(parsed.getTime())) {
    const hh = String(parsed.getHours()).padStart(2, '0');
    const mm = String(parsed.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  }

  return trimmed;
}
