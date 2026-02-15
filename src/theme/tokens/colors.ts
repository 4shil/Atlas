/**
 * Atlas Design System — Color Tokens
 * Based on Atlas Design System v1.0
 */

// ============================================
// RAW COLOR TOKENS (Primitive Values)
// ============================================
export const rawColors = {
    black: '#000000',
    white: '#FFFFFF',

    gray: {
        900: '#111111',
        700: '#333333',
        500: '#888888',
        300: '#CCCCCC',
        100: '#F5F5F5',
    },

    blue: {
        muted: '#4A6FFF',
        soft: '#6B8AFF',
    },

    green: {
        muted: '#4CAF50',
        soft: '#66BB6A',
    },

    purple: {
        soft: '#7C5CFF',
        muted: '#9575CD',
    },

    red: {
        muted: '#EF5350',
    },
} as const;

export interface Colors {
    background: {
        primary: string;
        secondary: string;
        tertiary: string;
        inverted: string;
    };
    text: {
        primary: string;
        secondary: string;
        tertiary: string;
        inverted: string;
        muted: string;
    };
    accent: {
        primary: string;
        secondary: string;
    };
    status: {
        completed: string;
        planned: string;
        wishlist: string;
        error: string;
    };
    border: {
        subtle: string;
        medium: string;
        strong: string;
    };
    overlay: {
        blur: string;
        light: string;
        dark: string;
    };
}

// ============================================
// SEMANTIC COLOR TOKENS (Intent-Driven)
// ============================================
export const semanticColors = {
    background: {
        primary: rawColors.black,
        secondary: rawColors.gray[900],
        tertiary: rawColors.gray[700],
        inverted: rawColors.white,
    },

    text: {
        primary: rawColors.white,
        secondary: rawColors.gray[500],
        tertiary: rawColors.gray[300],
        inverted: rawColors.black,
        muted: rawColors.gray[500],
    },

    accent: {
        primary: rawColors.blue.muted,
        secondary: rawColors.purple.soft,
    },

    status: {
        completed: rawColors.green.muted,
        planned: rawColors.blue.muted,
        wishlist: rawColors.purple.soft,
        error: rawColors.red.muted,
    },

    border: {
        subtle: rawColors.gray[700],
        medium: rawColors.gray[500],
        strong: rawColors.gray[300],
    },

    overlay: {
        blur: 'rgba(0, 0, 0, 0.6)',
        light: 'rgba(0, 0, 0, 0.3)',
        dark: 'rgba(0, 0, 0, 0.8)',
    },
} satisfies Colors;

// ============================================
// THEME VARIANTS
// ============================================
export type ThemeMode = 'dark' | 'light' | 'highContrast';

export const themes: Record<ThemeMode, Colors> = {
    dark: semanticColors,

    light: {
        background: {
            primary: rawColors.white,
            secondary: rawColors.gray[100],
            tertiary: rawColors.gray[300],
            inverted: rawColors.black,
        },
        text: {
            primary: rawColors.black,
            secondary: rawColors.gray[700],
            tertiary: rawColors.gray[500],
            inverted: rawColors.white,
            muted: rawColors.gray[500],
        },
        accent: semanticColors.accent,
        status: semanticColors.status,
        border: {
            subtle: rawColors.gray[300],
            medium: rawColors.gray[500],
            strong: rawColors.gray[700],
        },
        overlay: {
            blur: 'rgba(255, 255, 255, 0.6)',
            light: 'rgba(255, 255, 255, 0.3)',
            dark: 'rgba(0, 0, 0, 0.5)',
        },
    },

    highContrast: {
        background: {
            primary: rawColors.black,
            secondary: rawColors.black,
            tertiary: rawColors.gray[900],
            inverted: rawColors.white,
        },
        text: {
            primary: rawColors.white,
            secondary: rawColors.white,
            tertiary: rawColors.gray[300],
            inverted: rawColors.black,
            muted: rawColors.gray[300],
        },
        accent: {
            primary: '#00BFFF', // Brighter for accessibility
            secondary: '#FF69B4',
        },
        status: {
            completed: '#00FF7F',
            planned: '#00BFFF',
            wishlist: '#FF69B4',
            error: '#FF4500',
        },
        border: {
            subtle: rawColors.white,
            medium: rawColors.white,
            strong: rawColors.white,
        },
        overlay: {
            blur: 'rgba(0, 0, 0, 0.9)',
            light: 'rgba(0, 0, 0, 0.5)',
            dark: 'rgba(0, 0, 0, 0.95)',
        },
    },
};
