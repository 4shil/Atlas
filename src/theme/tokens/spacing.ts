/**
 * Atlas Design System — Spacing Tokens
 * Based on 8-point grid system
 */

// ============================================
// BASE SPACING SCALE (8-point grid)
// ============================================
export const space = {
    0: 0,
    1: 8,
    2: 16,
    3: 24,
    4: 32,
    5: 48,
    6: 64,
    7: 80,
    8: 96,
} as const;

// ============================================
// SEMANTIC SPACING
// ============================================
export const spacing = {
    // Component internal padding
    component: {
        xs: space[1],      // 8
        sm: space[2],      // 16
        md: space[3],      // 24
        lg: space[4],      // 32
    },

    // Screen margins
    screen: {
        horizontal: space[2],  // 16
        vertical: space[3],    // 24
        top: space[5],         // 48
        bottom: space[6],      // 64
    },

    // Card gaps
    card: {
        gap: space[2],         // 16
        padding: space[3],     // 24
        margin: space[2],      // 16
    },

    // Section rhythm
    section: {
        gap: space[5],         // 48
        margin: space[4],      // 32
    },

    // List items
    list: {
        gap: space[2],         // 16
        itemPadding: space[2], // 16
    },

    // Touch targets
    touch: {
        minimum: 44, // Accessibility minimum
        comfortable: 48,
        large: 56,
    },
} as const;

export type Space = typeof space;
export type Spacing = typeof spacing;
