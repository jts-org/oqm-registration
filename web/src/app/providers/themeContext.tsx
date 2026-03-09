/**
* @copyright 2026 Jouni Sipola by OQM. All rights reserved.
* Permission granted for personal/internal use only. Commercial
* use prohibited except by copyright holder. See LICENSE for details.
*/

import React, { createContext, useContext } from 'react';
import { getTheme } from '../../theme.config';

export const ThemeContext = createContext(getTheme('kickboxing'));
export function useTheme() { return useContext(ThemeContext); }