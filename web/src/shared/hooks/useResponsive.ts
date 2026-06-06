/**
 * @copyright 2026 Jouni Sipola by OQM. All rights reserved.
 * Permission granted for personal/internal use only. Commercial
 * use prohibited except by copyright holder. See LICENSE for details.
 */

/**
 * @description Responsive design hooks using MUI breakpoints.
 *   Provides mobile/tablet/desktop detection and dialog fullScreen behavior.
 *   Uses MUI theme breakpoints: xs=0, sm=600px, md=960px, lg=1280px, xl=1920px.
 */
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

/**
 * Returns true when viewport is below sm breakpoint (< 600px).
 * Use for mobile-specific logic like temporary drawers and fullscreen dialogs.
 */
export function useIsMobile(): boolean {
  const theme = useTheme();
  return useMediaQuery(theme.breakpoints.down('sm'));
}

/**
 * Returns true when viewport is between sm and md breakpoints (600px - 960px).
 * Use for tablet-specific layout adjustments.
 */
export function useIsTablet(): boolean {
  const theme = useTheme();
  return useMediaQuery(theme.breakpoints.between('sm', 'md'));
}

/**
 * Returns true when viewport is md breakpoint or above (≥ 960px).
 * Use for desktop-specific features.
 */
export function useIsDesktop(): boolean {
  const theme = useTheme();
  return useMediaQuery(theme.breakpoints.up('md'));
}

/**
 * Returns dialog props for responsive fullScreen behavior.
 * Dialogs become fullscreen on mobile (< 600px) for better UX.
 * 
 * Usage:
 * ```tsx
 * const { fullScreen } = useResponsiveDialog();
 * <Dialog open={open} fullScreen={fullScreen} maxWidth="sm">...</Dialog>
 * ```
 */
export function useResponsiveDialog() {
  const fullScreen = useIsMobile();
  return { fullScreen };
}
