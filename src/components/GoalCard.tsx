/**
 * Atlas — GoalCard Component
 * Editorial card with image, title, and location badge
 */

import React, { memo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Image } from 'expo-image';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    interpolate,
} from 'react-native-reanimated';
import { useTheme } from '../theme';
import { Goal, categoryMeta, getGoalStatus } from '../features/goals';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface GoalCardProps {
    goal: Goal;
    onPress?: () => void;
    variant?: 'full' | 'compact' | 'grid';
}

function GoalCardComponent({ goal, onPress, variant = 'full' }: GoalCardProps) {
    const { colors, typography, spacing, radius, motion } = useTheme();
    const scale = useSharedValue(1);

    const status = getGoalStatus(goal);
    const category = categoryMeta[goal.category];

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const handlePressIn = () => {
        scale.value = withSpring(motion.presets.cardPress.scale, motion.springs.quick);
    };

    const handlePressOut = () => {
        scale.value = withSpring(1, motion.springs.quick);
    };

    const statusColor = colors.status[status];

    const styles = StyleSheet.create({
        container: {
            width: '100%',
            height: variant === 'full' ? '100%' : variant === 'grid' ? 200 : 120,
            borderRadius: variant === 'full' ? 0 : radius.large,
            overflow: 'hidden',
            backgroundColor: colors.background.secondary,
        },
        image: {
            ...StyleSheet.absoluteFillObject,
        },
        overlay: {
            ...StyleSheet.absoluteFillObject,
            backgroundColor: colors.overlay.dark,
            justifyContent: 'flex-end',
            padding: spacing.card.padding,
        },
        categoryBadge: {
            flexDirection: 'row',
            alignItems: 'center',
            alignSelf: 'flex-start',
            backgroundColor: colors.overlay.blur,
            paddingHorizontal: spacing.component.sm,
            paddingVertical: spacing.component.xs / 2,
            borderRadius: radius.full,
            marginBottom: spacing.component.sm,
        },
        categoryText: {
            ...typography.caption,
            color: colors.text.primary,
            marginLeft: 4,
        },
        title: {
            ...typography.headingLarge,
            color: colors.text.primary,
            marginBottom: spacing.component.xs,
        },
        description: {
            ...typography.body,
            color: colors.text.secondary,
            marginBottom: spacing.component.sm,
        },
        locationRow: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        locationText: {
            ...typography.caption,
            color: colors.text.secondary,
        },
        statusDot: {
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: statusColor,
            marginRight: spacing.component.xs,
        },
    });

    return (
        <AnimatedPressable
            style={[styles.container, animatedStyle]}
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
        >
            {goal.image && (
                <Image
                    source={{ uri: goal.image }}
                    style={styles.image}
                    contentFit="cover"
                    transition={motion.duration.medium}
                />
            )}

            <View style={styles.overlay}>
                <View style={styles.categoryBadge}>
                    <Text>{category.emoji}</Text>
                    <Text style={styles.categoryText}>{category.label}</Text>
                </View>

                <Text style={styles.title} numberOfLines={2}>
                    {goal.title}
                </Text>

                {variant === 'full' && goal.description && (
                    <Text style={styles.description} numberOfLines={2}>
                        {goal.description}
                    </Text>
                )}

                {goal.location && (
                    <View style={styles.locationRow}>
                        <View style={styles.statusDot} />
                        <Text style={styles.locationText}>
                            {goal.location.city}, {goal.location.country}
                        </Text>
                    </View>
                )}
            </View>
        </AnimatedPressable>
    );
}

export const GoalCard = memo(GoalCardComponent);
