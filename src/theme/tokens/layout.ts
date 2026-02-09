/**
 * Atlas Design System — Radius & Elevation Tokens
 */

// ============================================
// RADIUS TOKENS
// ============================================
export const radius = {
    none: 0,
    small: 8,
    medium: 16,
    large: 24,
    hero: 32,
    full: 9999,
} as const;

// ============================================
// ELEVATION TOKENS
// ============================================
export const elevation = {
    none: {
        shadowColor: 'transparent',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0,
        shadowRadius: 0,
        elevation: 0,
    },

    card: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
    },

    overlay: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
        elevation: 8,
    },

    modal: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 16 },
        shadowOpacity: 0.35,
        shadowRadius: 24,
        elevation: 16,
    },
} as const;

// ============================================
// Z-INDEX LAYERS
// ============================================
export const zIndex = {
    base: 0,
    card: 10,
    header: 100,
    overlay: 200,
    modal: 300,
    notification: 400,
    tooltip: 500,
} as const;

export type Radius = typeof radius;
export type Elevation = typeof elevation;
export type ZIndex = typeof zIndex;
