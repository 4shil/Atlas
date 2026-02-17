/**
 * Atlas Theme Provider
 * Provides theme context with semantic tokens
 */

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { themes, type ThemeMode, type Colors } from './tokens/colors';
import { typography, type Typography } from './tokens/typography';
import { spacing, space, type Spacing, type Space } from './tokens/spacing';
import { radius, elevation, zIndex, type Radius, type Elevation, type ZIndex } from './tokens/layout';
import { duration, springs, easing, motionPresets } from './tokens/motion';

// ============================================
// THEME CONTEXT TYPE
// ============================================
interface ThemeContextType {
    // Current theme mode
    mode: ThemeMode;
    setMode: (mode: ThemeMode) => void;
    toggleMode: () => void;

    // Design tokens
    colors: Colors;
    typography: Typography;
    spacing: Spacing;
    space: Space;
    radius: Radius;
    elevation: Elevation;
    zIndex: ZIndex;

    // Motion tokens
    motion: {
        duration: typeof duration;
        springs: typeof springs;
        easing: typeof easing;
        presets: typeof motionPresets;
    };

    // Utilities
    isDark: boolean;
    isReducedMotion: boolean;
    setReducedMotion: (value: boolean) => void;
}

// ============================================
// CONTEXT
// ============================================
const ThemeContext = createContext<ThemeContextType | null>(null);

// ============================================
// PROVIDER COMPONENT
// ============================================
interface ThemeProviderProps {
    children: React.ReactNode;
    defaultMode?: ThemeMode;
}

export function ThemeProvider({ children, defaultMode }: ThemeProviderProps) {
    const systemColorScheme = useColorScheme();

    // Determine initial mode
    const initialMode: ThemeMode = defaultMode ??
        (systemColorScheme === 'light' ? 'light' : 'dark');

    const [mode, setMode] = useState<ThemeMode>(initialMode);
    const [isReducedMotion, setReducedMotion] = useState(false);

    // Toggle between dark and light
    const toggleMode = useCallback(() => {
        setMode(current => current === 'dark' ? 'light' : 'dark');
    }, []);

    // Memoized theme value
    const value = useMemo<ThemeContextType>(() => ({
        mode,
        setMode,
        toggleMode,

        colors: themes[mode],
        typography,
        spacing,
        space,
        radius,
        elevation,
        zIndex,

        motion: {
            duration,
            springs,
            easing,
            presets: motionPresets,
        },

        isDark: mode === 'dark',
        isReducedMotion,
        setReducedMotion,
    }), [mode, isReducedMotion, toggleMode]);

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
}

// ============================================
// HOOK
// ============================================
export function useTheme(): ThemeContextType {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}

// ============================================
// CONVENIENCE HOOKS
// ============================================
export function useColors(): Colors {
    return useTheme().colors;
}

export function useTypography(): Typography {
    return useTheme().typography;
}

export function useSpacing() {
    const theme = useTheme();
    return { spacing: theme.spacing, space: theme.space };
}

export function useMotion() {
    return useTheme().motion;
}
