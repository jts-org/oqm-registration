/**
* @copyright 2026 Jouni Sipola by OQM. All rights reserved.
* Permission granted for personal/internal use only. Commercial
* use prohibited except by copyright holder. See LICENSE for details.
*/

/**
 * Theme Configuration
 * 
 * Defines color schemes and visual styling for the application.
 * Supports preset themes (dark, light) and custom theme definitions.
 */

// Dark theme (default)
export const darkTheme = {
  name: 'dark',
  colors: {
    // Background colors
    bgPrimary: '#0a0a0f',
    bgSecondary: '#12121a',
    bgCard: '#1a1a2e',
    bgCardHover: '#242444',
    
    // Accent colors
    accentPrimary: '#00d4aa',
    accentSecondary: '#667eea',
    accentWarning: '#ff6b6b',
    accentSuccess: '#22c55e',
    accentGold: '#ffd93d',
    
    // Text colors
    textPrimary: '#ffffff',
    textSecondary: '#a0a0b0',
    textMuted: '#6b6b7b',
    
    // Border color
    border: '#2a2a3e',
    
    // Surface color (for components)
    surface: '#1a1a2e',
    background: '#0a0a0f',
  },
  shadows: {
    sm: '0 2px 8px rgba(0, 0, 0, 0.3)',
    md: '0 4px 20px rgba(0, 0, 0, 0.4)',
    lg: '0 8px 40px rgba(0, 0, 0, 0.5)',
    glow: '0 0 20px rgba(0, 212, 170, 0.3)',
  },
  gradients: {
    primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    accent: 'linear-gradient(135deg, #00d4aa 0%, #00a885 100%)',
    dark: 'linear-gradient(180deg, #12121a 0%, #0a0a0f 100%)',
  },
};

// Light theme
export const lightTheme = {
  name: 'light',
  colors: {
    // Background colors
    bgPrimary: '#f5f5f7',
    bgSecondary: '#ffffff',
    bgCard: '#ffffff',
    bgCardHover: '#f0f0f5',
    
    // Accent colors
    accentPrimary: '#00a885',
    accentSecondary: '#5a67d8',
    accentWarning: '#e53e3e',
    accentSuccess: '#38a169',
    accentGold: '#d69e2e',
    
    // Text colors
    textPrimary: '#1a1a2e',
    textSecondary: '#4a5568',
    textMuted: '#718096',
    
    // Border color
    border: '#e2e8f0',
    
    // Surface color
    surface: '#ffffff',
    background: '#f5f5f7',
  },
  shadows: {
    sm: '0 1px 3px rgba(0, 0, 0, 0.1)',
    md: '0 4px 6px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 25px rgba(0, 0, 0, 0.1)',
    glow: '0 0 15px rgba(0, 168, 133, 0.2)',
  },
  gradients: {
    primary: 'linear-gradient(135deg, #5a67d8 0%, #805ad5 100%)',
    accent: 'linear-gradient(135deg, #00a885 0%, #38a169 100%)',
    dark: 'linear-gradient(180deg, #f5f5f7 0%, #e2e8f0 100%)',
  },
};

// Sport-specific theme presets
export const sportThemes = {
  // Kickboxing / MMA - aggressive, dark
  kickboxing: {
    ...darkTheme,
    name: 'kickboxing',
    colors: {
      ...darkTheme.colors,
      accentPrimary: '#ff4444',
      accentSecondary: '#ff8800',
    },
  },
  // Football / Soccer - classic green
  football: {
    ...darkTheme,
    name: 'football',
    colors: {
      ...darkTheme.colors,
      accentPrimary: '#22c55e',
      accentSecondary: '#16a34a',
    },
  },
  // Swimming - blue aquatic
  swimming: {
    ...darkTheme,
    name: 'swimming',
    colors: {
      ...darkTheme.colors,
      accentPrimary: '#0ea5e9',
      accentSecondary: '#0284c7',
    },
  },
  // Gymnastics - elegant purple
  gymnastics: {
    ...darkTheme,
    name: 'gymnastics',
    colors: {
      ...darkTheme.colors,
      accentPrimary: '#a855f7',
      accentSecondary: '#9333ea',
    },
  },
  // Tennis - vibrant yellow/lime
  tennis: {
    ...darkTheme,
    name: 'tennis',
    colors: {
      ...darkTheme.colors,
      accentPrimary: '#84cc16',
      accentSecondary: '#65a30d',
    },
  },
};

/**
 * Get theme by name
 * @param {string} themeName - Theme name ('dark', 'light', or sport name)
 * @returns {object} Theme configuration
 */
export function getTheme(themeName: 'dark' | 'light' | keyof typeof sportThemes) {
  switch (themeName) {
    case 'light':
      return lightTheme;
    case 'dark':
      return darkTheme;
    default:
      return sportThemes[themeName] || darkTheme;
  }
}

/**
 * Apply theme to CSS variables
 * @param {object} theme - Theme configuration object
 */
export function applyTheme(theme: ReturnType<typeof getTheme>) {
  const root = document.documentElement;
  
  // Apply colors
  Object.entries(theme.colors).forEach(([key, value]) => {
    const cssVar = `--color-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
    root.style.setProperty(cssVar, value);
  });
  
  // Apply shadows
  Object.entries(theme.shadows).forEach(([key, value]) => {
    root.style.setProperty(`--shadow-${key}`, value);
  });
  
  // Apply gradients
  Object.entries(theme.gradients).forEach(([key, value]) => {
    root.style.setProperty(`--gradient-${key}`, value);
  });
}

const themeConfig = { darkTheme, lightTheme, sportThemes, getTheme, applyTheme };
export default themeConfig;
