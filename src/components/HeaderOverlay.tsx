/**
 * Atlas — HeaderOverlay Component
 * Transparent header with blur background
 */

import React, { memo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn } from 'react-native-reanimated';
import { BlurOverlay } from './BlurOverlay';
import { useTheme } from '../theme';

interface HeaderOverlayProps {
    title?: string;
    leftAction?: {
        icon: string;
        onPress: () => void;
    };
    rightAction?: {
        icon: string;
        onPress: () => void;
    };
    transparent?: boolean;
}

function HeaderOverlayComponent({
    title,
    leftAction,
    rightAction,
    transparent = true,
}: HeaderOverlayProps) {
    const { colors, typography, spacing, zIndex, radius } = useTheme();
    const insets = useSafeAreaInsets();

    const styles = StyleSheet.create({
        container: {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            zIndex: zIndex.header,
        },
        content: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: insets.top + spacing.component.sm,
            paddingBottom: spacing.component.sm,
            paddingHorizontal: spacing.screen.horizontal,
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderBottomColor: transparent ? 'transparent' : colors.border.subtle,
        },
        actionButton: {
            width: spacing.touch.comfortable,
            height: spacing.touch.comfortable,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: radius.full,
            backgroundColor: colors.overlay.light,
        },
        actionIcon: {
            fontSize: 24,
            color: colors.text.primary,
        },
        title: {
            ...typography.headingSmall,
            color: colors.text.primary,
            flex: 1,
            textAlign: 'center',
        },
        placeholder: {
            width: spacing.touch.minimum,
        },
    });

    const content = (
        <Animated.View style={styles.content} entering={FadeIn.duration(180)}>
            {leftAction ? (
                <Pressable style={styles.actionButton} onPress={leftAction.onPress}>
                    <Text style={styles.actionIcon}>{leftAction.icon}</Text>
                </Pressable>
            ) : (
                <View style={styles.placeholder} />
            )}

            {title && <Text style={styles.title}>{title}</Text>}

            {rightAction ? (
                <Pressable style={styles.actionButton} onPress={rightAction.onPress}>
                    <Text style={styles.actionIcon}>{rightAction.icon}</Text>
                </Pressable>
            ) : (
                <View style={styles.placeholder} />
            )}
        </Animated.View>
    );

    if (transparent) {
        return (
            <BlurOverlay style={styles.container} intensity={30}>
                {content}
            </BlurOverlay>
        );
    }

    return (
        <BlurOverlay style={styles.container} intensity={80}>
            {content}
        </BlurOverlay>
    );
}

export const HeaderOverlay = memo(HeaderOverlayComponent);
