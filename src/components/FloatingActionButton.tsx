/**
 * Atlas — FloatingActionButton Component
 * Primary action trigger with animated press
 */

import React, { memo, type ComponentProps } from 'react';
import { StyleSheet, Pressable, Text } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
type IconName = ComponentProps<typeof Ionicons>['name'];

interface FloatingActionButtonProps {
    onPress: () => void;
    icon?: IconName;
    label?: string;
    variant?: 'primary' | 'secondary';
    bottomOffset?: number;
}

function FloatingActionButtonComponent({
    onPress,
    icon = 'add',
    label,
    variant = 'primary',
    bottomOffset,
}: FloatingActionButtonProps) {
    const { colors, typography, spacing, radius, elevation, motion } = useTheme();
    const insets = useSafeAreaInsets();
    const scale = useSharedValue(1);
    const rotate = useSharedValue(0);
    const tabBarBaseHeight = spacing.touch.large + spacing.component.md;
    const defaultBottomOffset = insets.bottom + tabBarBaseHeight + spacing.component.md;
    const fabBottomOffset = bottomOffset ?? defaultBottomOffset;

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }, { rotate: `${rotate.value}deg` }],
    }));

    const handlePressIn = () => {
        scale.value = withSpring(motion.presets.cardPress.scale, motion.springs.quick);
        rotate.value = withSpring(icon === 'add' ? 15 : 0, motion.springs.quick);
    };

    const handlePressOut = () => {
        scale.value = withSpring(1, motion.springs.quick);
        rotate.value = withSpring(0, motion.springs.quick);
    };

    const isPrimary = variant === 'primary';

    const styles = StyleSheet.create({
        container: {
            position: 'absolute',
            bottom: fabBottomOffset,
            right: spacing.screen.horizontal,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: spacing.touch.large,
            height: spacing.touch.large,
            paddingHorizontal: label ? spacing.component.md : 0,
            borderRadius: label ? radius.hero : radius.full,
            backgroundColor: isPrimary ? colors.accent.primary : colors.background.secondary,
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: isPrimary ? colors.accent.primary : colors.border.subtle,
            ...elevation.overlay,
        },
        label: {
            ...typography.label,
            color: isPrimary ? colors.text.inverted : colors.text.primary,
            marginLeft: spacing.component.xs,
        },
    });

    return (
        <AnimatedPressable
            style={[styles.container, animatedStyle]}
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
        >
            <Ionicons
                name={icon}
                size={24}
                color={isPrimary ? colors.text.inverted : colors.text.primary}
            />
            {label && <Text style={styles.label}>{label}</Text>}
        </AnimatedPressable>
    );
}

export const FloatingActionButton = memo(FloatingActionButtonComponent);
