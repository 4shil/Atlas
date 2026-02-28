/**
 * Semantic Color Utilities
 * Automatically adapts to dark/light mode via NativeWind dark: prefix
 */

import { useTheme } from './ThemeProvider';

export function useSemanticColors() {
    const { isDark } = useTheme();

    return {
        // Backgrounds
        background: isDark ? 'bg-black' : 'bg-white',
        surfacePrimary: isDark ? 'bg-white/5' : 'bg-black/5',
        surfaceSecondary: isDark ? 'bg-white/10' : 'bg-black/10',

        // Text
        textPrimary: isDark ? 'text-white' : 'text-black',
        textSecondary: isDark ? 'text-white/60' : 'text-black/60',
        textTertiary: isDark ? 'text-white/40' : 'text-black/40',

        // Borders
        borderPrimary: isDark ? 'border-white/10' : 'border-black/10',
        borderSecondary: isDark ? 'border-white/5' : 'border-black/5',

        // Interactive
        buttonPrimary: isDark ? 'bg-blue-600 active:bg-blue-700' : 'bg-blue-500 active:bg-blue-600',
        buttonSecondary: isDark ? 'bg-white/10' : 'bg-black/10',

        // Status
        success: isDark ? 'text-green-400' : 'text-green-600',
        warning: isDark ? 'text-yellow-400' : 'text-yellow-600',
        error: isDark ? 'text-red-400' : 'text-red-600',
        info: isDark ? 'text-blue-400' : 'text-blue-600',
    };
}

// Alternative: CSS class strings for use in className directly
export const semanticClasses = {
    background: 'dark:bg-black bg-white',
    surfacePrimary: 'dark:bg-white/5 bg-black/5',
    surfaceSecondary: 'dark:bg-white/10 bg-black/10',
    textPrimary: 'dark:text-white text-black',
    textSecondary: 'dark:text-white/60 text-black/60',
    textTertiary: 'dark:text-white/40 text-black/40',
    borderPrimary: 'dark:border-white/10 border-black/10',
    borderSecondary: 'dark:border-white/5 border-black/5',
    buttonPrimary: 'dark:bg-blue-600 bg-blue-500',
    buttonSecondary: 'dark:bg-white/10 bg-black/10',
    success: 'dark:text-green-400 text-green-600',
    warning: 'dark:text-yellow-400 text-yellow-600',
    error: 'dark:text-red-400 text-red-600',
    info: 'dark:text-blue-400 text-blue-600',
};
