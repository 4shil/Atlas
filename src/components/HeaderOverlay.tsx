/**
 * Atlas — HeaderOverlay Component
 * Transparent header with blur background
 */

import React, { memo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurOverlay } from './BlurOverlay';
import { useTheme } from '@/theme';

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
    const { colors, typography, spacing } = useTheme();
    const insets = useSafeAreaInsets();

    const styles = StyleSheet.create({
        container: {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 100,
        },
        content: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: insets.top + spacing.component.sm,
            paddingBottom: spacing.component.sm,
            paddingHorizontal: spacing.screen.horizontal,
        },
        actionButton: {
            width: spacing.touch.minimum,
            height: spacing.touch.minimum,
            alignItems: 'center',
            justifyContent: 'center',
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
        <View style={styles.content}>
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
        </View>
    );

    if (transparent) {
        return <View style={styles.container}>{content}</View>;
    }

    return (
        <BlurOverlay style={styles.container} intensity={80}>
            {content}
        </BlurOverlay>
    );
}

export const HeaderOverlay = memo(HeaderOverlayComponent);
