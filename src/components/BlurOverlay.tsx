/**
 * Atlas — BlurOverlay Component
 * Frosted glass effect overlay
 */

import React, { memo } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '../theme';

interface BlurOverlayProps {
    intensity?: number;
    tint?: 'dark' | 'light' | 'default';
    style?: ViewStyle;
    children?: React.ReactNode;
}

function BlurOverlayComponent({
    intensity = 50,
    tint = 'dark',
    style,
    children
}: BlurOverlayProps) {
    const { isDark } = useTheme();

    const resolvedTint = tint === 'default'
        ? (isDark ? 'dark' : 'light')
        : tint;

    return (
        <BlurView
            intensity={intensity}
            tint={resolvedTint}
            style={[styles.container, style]}
        >
            {children}
        </BlurView>
    );
}

const styles = StyleSheet.create({
    container: {
        overflow: 'hidden',
    },
});

export const BlurOverlay = memo(BlurOverlayComponent);
