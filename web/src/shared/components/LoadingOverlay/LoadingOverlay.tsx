/**
 * @copyright 2026 Jouni Sipola by OQM. All rights reserved.
 * Permission granted for personal/internal use only. Commercial
 * use prohibited except by copyright holder. See LICENSE for details.
 */

/**
 * @description Full-screen dimmed overlay with a centered spinner.
 *   Rendered during API operations to block user interaction and signal loading.
 *   @see skills/SKILL.wire-react-to-gas.md
 */
import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './LoadingOverlay.module.css';

export interface LoadingOverlayProps {
  /** Whether the overlay is visible. */
  visible: boolean;
}

/**
 * Renders a dimmed full-screen overlay with a spinner when `visible` is true.
 * Uses ARIA attributes to communicate loading state to screen readers.
 */
export function LoadingOverlay({ visible }: LoadingOverlayProps) {
  const { t } = useTranslation();

  if (!visible) return null;

  return (
    <div
      className={styles.loadingOverlay}
      role="status"
      aria-live="polite"
      aria-label={t('loading.overlay')}
    >
      <div className={styles.spinner} />
    </div>
  );
}
