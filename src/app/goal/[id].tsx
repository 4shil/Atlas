/**
 * Atlas — Goal Detail Screen
 * Fullscreen goal view with actions
 */

import React, { useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, SlideInUp } from 'react-native-reanimated';
import { useTheme } from '../../theme';
import { useGoalsStore, categoryMeta, getGoalStatus } from '../../features/goals';
import { HeaderOverlay, BlurOverlay } from '../../components';

export default function GoalDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { colors, typography, spacing, radius } = useTheme();
    const insets = useSafeAreaInsets();

    const goal = useGoalsStore(state => state.getGoalById(id));
    const markComplete = useGoalsStore(state => state.markComplete);
    const markIncomplete = useGoalsStore(state => state.markIncomplete);
    const deleteGoal = useGoalsStore(state => state.deleteGoal);

    if (!goal) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
                <HeaderOverlay
                    title="Not Found"
                    leftAction={{ icon: '←', onPress: () => router.back() }}
                />
                <View style={styles.errorContainer}>
                    <Text style={[typography.headingLarge, { color: colors.text.primary }]}>
                        Goal not found
                    </Text>
                </View>
            </View>
        );
    }

    const status = getGoalStatus(goal);
    const category = categoryMeta[goal.category];

    const handleComplete = useCallback(() => {
        if (goal.completed) {
            markIncomplete(goal.id);
        } else {
            markComplete(goal.id);
        }
    }, [goal, markComplete, markIncomplete]);

    const handleDelete = useCallback(() => {
        Alert.alert(
            'Delete Dream',
            'Are you sure you want to delete this dream? This cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                        deleteGoal(goal.id);
                        router.back();
                    }
                },
            ]
        );
    }, [goal.id, deleteGoal, router]);

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background.primary,
        },
        errorContainer: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
        },
        imageContainer: {
            height: 400,
            width: '100%',
        },
        image: {
            ...StyleSheet.absoluteFillObject,
        },
        imageOverlay: {
            ...StyleSheet.absoluteFillObject,
            justifyContent: 'flex-end',
        },
        imageGradient: {
            height: 200,
            justifyContent: 'flex-end',
            padding: spacing.screen.horizontal,
        },
        statusBadge: {
            alignSelf: 'flex-start',
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: spacing.component.sm,
            paddingVertical: spacing.component.xs / 2,
            borderRadius: radius.full,
            marginBottom: spacing.component.sm,
        },
        statusDot: {
            width: 8,
            height: 8,
            borderRadius: 4,
            marginRight: 6,
        },
        statusText: {
            ...typography.caption,
            color: colors.text.primary,
            textTransform: 'capitalize',
        },
        title: {
            ...typography.displayLarge,
            color: colors.text.primary,
        },
        content: {
            padding: spacing.screen.horizontal,
            paddingBottom: insets.bottom + 100,
        },
        section: {
            marginBottom: spacing.section.gap,
        },
        sectionTitle: {
            ...typography.label,
            color: colors.text.secondary,
            marginBottom: spacing.component.xs,
        },
        sectionContent: {
            ...typography.body,
            color: colors.text.primary,
        },
        categoryRow: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        categoryEmoji: {
            fontSize: 24,
            marginRight: spacing.component.xs,
        },
        locationRow: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        locationIcon: {
            fontSize: 20,
            marginRight: spacing.component.xs,
        },
        actionsContainer: {
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            paddingHorizontal: spacing.screen.horizontal,
            paddingVertical: spacing.component.md,
            paddingBottom: insets.bottom + spacing.component.md,
            backgroundColor: colors.background.secondary,
            flexDirection: 'row',
            justifyContent: 'space-between',
        },
        actionButton: {
            flex: 1,
            height: spacing.touch.comfortable,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: radius.medium,
            marginHorizontal: spacing.component.xs / 2,
        },
        primaryAction: {
            backgroundColor: goal.completed ? colors.text.secondary : colors.status.completed,
        },
        dangerAction: {
            backgroundColor: colors.status.error,
        },
        actionText: {
            ...typography.label,
            color: colors.text.inverted,
        },
        notesSection: {
            backgroundColor: colors.background.secondary,
            borderRadius: radius.medium,
            padding: spacing.component.md,
        },
        notesText: {
            ...typography.body,
            color: colors.text.secondary,
            fontStyle: 'italic',
        },
    });

    return (
        <View style={styles.container}>
            <HeaderOverlay
                leftAction={{ icon: '←', onPress: () => router.back() }}
                transparent
            />

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Hero Image */}
                <View style={styles.imageContainer}>
                    {goal.image ? (
                        <Image source={{ uri: goal.image }} style={styles.image} contentFit="cover" />
                    ) : (
                        <View style={[styles.image, { backgroundColor: colors.background.secondary, alignItems: 'center', justifyContent: 'center' }]}>
                            <Text style={{ fontSize: 80 }}>{category.emoji}</Text>
                        </View>
                    )}
                    <View style={styles.imageOverlay}>
                        <Animated.View
                            style={[styles.imageGradient, { backgroundColor: 'rgba(0,0,0,0.6)' }]}
                            entering={FadeIn.duration(400)}
                        >
                            <View style={[styles.statusBadge, { backgroundColor: colors.overlay.blur }]}>
                                <View style={[styles.statusDot, { backgroundColor: colors.status[status] }]} />
                                <Text style={styles.statusText}>{status}</Text>
                            </View>
                            <Text style={styles.title}>{goal.title}</Text>
                        </Animated.View>
                    </View>
                </View>

                {/* Content */}
                <Animated.View style={styles.content} entering={SlideInUp.delay(200).duration(400)}>
                    {/* Description */}
                    {goal.description && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>DESCRIPTION</Text>
                            <Text style={styles.sectionContent}>{goal.description}</Text>
                        </View>
                    )}

                    {/* Category */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>CATEGORY</Text>
                        <View style={styles.categoryRow}>
                            <Text style={styles.categoryEmoji}>{category.emoji}</Text>
                            <Text style={styles.sectionContent}>{category.label}</Text>
                        </View>
                    </View>

                    {/* Location */}
                    {goal.location && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>LOCATION</Text>
                            <View style={styles.locationRow}>
                                <Text style={styles.locationIcon}>📍</Text>
                                <Text style={styles.sectionContent}>
                                    {goal.location.city}, {goal.location.country}
                                </Text>
                            </View>
                        </View>
                    )}

                    {/* Timeline Date */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>TARGET DATE</Text>
                        <Text style={styles.sectionContent}>{formatDate(goal.timelineDate)}</Text>
                    </View>

                    {/* Completed Date */}
                    {goal.completed && goal.completedAt && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>COMPLETED ON</Text>
                            <Text style={styles.sectionContent}>{formatDate(goal.completedAt)}</Text>
                        </View>
                    )}

                    {/* Notes */}
                    {goal.notes && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>REFLECTION</Text>
                            <View style={styles.notesSection}>
                                <Text style={styles.notesText}>"{goal.notes}"</Text>
                            </View>
                        </View>
                    )}
                </Animated.View>
            </ScrollView>

            {/* Actions */}
            <View style={styles.actionsContainer}>
                <Pressable
                    style={[styles.actionButton, styles.primaryAction]}
                    onPress={handleComplete}
                >
                    <Text style={styles.actionText}>
                        {goal.completed ? 'MARK INCOMPLETE' : 'MARK COMPLETE'}
                    </Text>
                </Pressable>
                <Pressable
                    style={[styles.actionButton, styles.dangerAction]}
                    onPress={handleDelete}
                >
                    <Text style={styles.actionText}>DELETE</Text>
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    errorContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
