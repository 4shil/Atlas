/**
 * Atlas Design System — Typography Tokens
 * Based on Atlas Design System v1.0
 * Editorial grotesk style, typography-driven layout
 */

import { Platform } from 'react-native';

// ============================================
// FONT FAMILIES
// ============================================
export const fontFamilies = {
    primary: Platform.select({
        ios: 'SF Pro Display',
        android: 'Roboto',
        default: 'System',
    }),
    mono: Platform.select({
        ios: 'SF Mono',
        android: 'Roboto Mono',
        default: 'monospace',
    }),
} as const;

// ============================================
// TYPE SCALE (sizes in points)
// ============================================
export const typeScale = {
    hero: 72,
    displayLarge: 48,
    headingLarge: 32,
    headingMedium: 24,
    headingSmall: 20,
    body: 16,
    bodySmall: 14,
    caption: 12,
    micro: 10,
} as const;

// ============================================
// LINE HEIGHTS
// ============================================
export const lineHeights = {
    tight: 1.1,
    normal: 1.4,
    relaxed: 1.6,
} as const;

// ============================================
// FONT WEIGHTS
// ============================================
export const fontWeights = {
    light: '300' as const,
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
};

// ============================================
// LETTER SPACING (Editorial tight spacing)
// ============================================
export const letterSpacing = {
    tight: -1.5,
    snug: -0.5,
    normal: 0,
    wide: 0.5,
    wider: 1,
} as const;

// ============================================
// SEMANTIC TYPOGRAPHY STYLES
// ============================================
export const typography = {
    hero: {
        fontFamily: fontFamilies.primary,
        fontSize: typeScale.hero,
        fontWeight: fontWeights.bold,
        lineHeight: typeScale.hero * lineHeights.tight,
        letterSpacing: letterSpacing.tight,
    },

    displayLarge: {
        fontFamily: fontFamilies.primary,
        fontSize: typeScale.displayLarge,
        fontWeight: fontWeights.bold,
        lineHeight: typeScale.displayLarge * lineHeights.tight,
        letterSpacing: letterSpacing.tight,
    },

    headingLarge: {
        fontFamily: fontFamilies.primary,
        fontSize: typeScale.headingLarge,
        fontWeight: fontWeights.semibold,
        lineHeight: typeScale.headingLarge * lineHeights.tight,
        letterSpacing: letterSpacing.snug,
    },

    headingMedium: {
        fontFamily: fontFamilies.primary,
        fontSize: typeScale.headingMedium,
        fontWeight: fontWeights.semibold,
        lineHeight: typeScale.headingMedium * lineHeights.normal,
        letterSpacing: letterSpacing.snug,
    },

    headingSmall: {
        fontFamily: fontFamilies.primary,
        fontSize: typeScale.headingSmall,
        fontWeight: fontWeights.medium,
        lineHeight: typeScale.headingSmall * lineHeights.normal,
        letterSpacing: letterSpacing.normal,
    },

    body: {
        fontFamily: fontFamilies.primary,
        fontSize: typeScale.body,
        fontWeight: fontWeights.regular,
        lineHeight: typeScale.body * lineHeights.relaxed,
        letterSpacing: letterSpacing.normal,
    },

    bodySmall: {
        fontFamily: fontFamilies.primary,
        fontSize: typeScale.bodySmall,
        fontWeight: fontWeights.regular,
        lineHeight: typeScale.bodySmall * lineHeights.relaxed,
        letterSpacing: letterSpacing.normal,
    },

    caption: {
        fontFamily: fontFamilies.primary,
        fontSize: typeScale.caption,
        fontWeight: fontWeights.regular,
        lineHeight: typeScale.caption * lineHeights.normal,
        letterSpacing: letterSpacing.wide,
    },

    label: {
        fontFamily: fontFamilies.primary,
        fontSize: typeScale.caption,
        fontWeight: fontWeights.medium,
        lineHeight: typeScale.caption * lineHeights.normal,
        letterSpacing: letterSpacing.wider,
        textTransform: 'uppercase' as const,
    },

    mono: {
        fontFamily: fontFamilies.mono,
        fontSize: typeScale.bodySmall,
        fontWeight: fontWeights.regular,
        lineHeight: typeScale.bodySmall * lineHeights.normal,
        letterSpacing: letterSpacing.normal,
    },
} as const;

export type Typography = typeof typography;
export type TypographyStyle = keyof Typography;
