/**
 * Atlas — HeaderOverlay Component
 * Transparent header with blur background
 */

import React, { memo, type ComponentProps } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useTheme } from '../theme';

type IconName = ComponentProps<typeof Ionicons>['name'];

interface HeaderOverlayProps {
    title?: string;
    leftAction?: {
        icon: IconName;
        onPress: () => void;
    };
    rightAction?: {
        icon: IconName;
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
            overflow: 'hidden',
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
                    <Ionicons name={leftAction.icon} size={22} color={colors.text.primary} />
                </Pressable>
            ) : (
                <View style={styles.placeholder} />
            )}

            {title && <Text style={styles.title}>{title}</Text>}

            {rightAction ? (
                <Pressable style={styles.actionButton} onPress={rightAction.onPress}>
                    <Ionicons name={rightAction.icon} size={22} color={colors.text.primary} />
                </Pressable>
            ) : (
                <View style={styles.placeholder} />
            )}
        </Animated.View>
    );

    return (
        <View style={styles.container}>
            <BlurView intensity={transparent ? 30 : 80} style={StyleSheet.absoluteFill} />
            {content}
        </View>
    );
}

export const HeaderOverlay = memo(HeaderOverlayComponent);
