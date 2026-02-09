/**
 * Atlas Design System — Motion Tokens
 * Motion defines emotional tone
 */

import { Easing } from 'react-native-reanimated';

// ============================================
// DURATION TOKENS
// ============================================
export const duration = {
    instant: 0,
    fast: 150,
    medium: 300,
    slow: 600,
    cinematic: 1200,
    extraSlow: 2000,
} as const;

// ============================================
// EASING TOKENS
// ============================================
export const easing = {
    // Standard ease for most transitions
    standard: Easing.bezier(0.4, 0.0, 0.2, 1),

    // Decelerate - for entering elements
    decelerate: Easing.bezier(0.0, 0.0, 0.2, 1),

    // Accelerate - for exiting elements
    accelerate: Easing.bezier(0.4, 0.0, 1, 1),

    // Sharp - for quick UI feedback
    sharp: Easing.bezier(0.4, 0.0, 0.6, 1),

    // Cinematic glide - for immersive transitions
    cinematic: Easing.bezier(0.25, 0.1, 0.25, 1),
} as const;

// ============================================
// SPRING CONFIGURATIONS
// ============================================
export const springs = {
    // Soft spring - gentle, bouncy feel
    soft: {
        damping: 20,
        stiffness: 100,
        mass: 1,
    },

    // Medium spring - balanced response
    medium: {
        damping: 15,
        stiffness: 150,
        mass: 1,
    },

    // Heavy spring - weighted, premium feel
    heavy: {
        damping: 20,
        stiffness: 200,
        mass: 1.5,
    },

    // Quick spring - snappy UI feedback
    quick: {
        damping: 20,
        stiffness: 300,
        mass: 0.8,
    },

    // Cinematic spring - slow, dramatic
    cinematic: {
        damping: 25,
        stiffness: 80,
        mass: 2,
    },
} as const;

// ============================================
// MOTION PRESETS
// ============================================
export const motionPresets = {
    // For card interactions
    cardPress: {
        duration: duration.fast,
        scale: 0.98,
    },

    // For page transitions
    pageTransition: {
        duration: duration.medium,
        spring: springs.medium,
    },

    // For modal appearances
    modalEnter: {
        duration: duration.slow,
        spring: springs.heavy,
    },

    // For gallery swipes
    gallerySwipe: {
        duration: duration.cinematic,
        spring: springs.cinematic,
    },

    // For parallax effects
    parallax: {
        factor: 0.3, // 30% of scroll distance
    },
} as const;

export type Duration = typeof duration;
export type Springs = typeof springs;
export type MotionPresets = typeof motionPresets;
