/**
 * Atlas — Goal Detail Screen
 * Fullscreen goal view with actions
 */

import React, { useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, SlideInUp } from 'react-native-reanimated';
import { useTheme } from '../../theme';
import { useGoalsStore, categoryMeta, getGoalStatus } from '../../features/goals';
import { HeaderOverlay, BlurOverlay } from '../../components';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function GoalDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { colors, typography, spacing, radius } = useTheme();
    const insets = useSafeAreaInsets();

    const goal = useGoalsStore(state => state.getGoalById(id));
    const markComplete = useGoalsStore(state => state.markComplete);
    const markIncomplete = useGoalsStore(state => state.markIncomplete);
    const deleteGoal = useGoalsStore(state => state.deleteGoal);

    // Style generation with memoization to prevent re-creation on render
    const styles = useMemo(() => StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background.primary,
        },
        errorContainer: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
        },
        scrollContent: {
            paddingBottom: insets.bottom + 100, // Space for action bar
        },
        imageContainer: {
            height: SCREEN_WIDTH * 1.2, // Cinematic portrait aspect
            width: '100%',
            backgroundColor: colors.background.tertiary,
        },
        image: {
            ...StyleSheet.absoluteFillObject,
        },
        imageOverlay: {
            ...StyleSheet.absoluteFillObject,
            justifyContent: 'flex-end',
        },
        imageGradient: {
            height: 300,
            justifyContent: 'flex-end',
            padding: spacing.screen.horizontal,
            paddingBottom: spacing.section.gap,
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
            color: colors.text.inverted,
            textShadowColor: 'rgba(0,0,0,0.5)',
            textShadowOffset: { width: 0, height: 2 },
            textShadowRadius: 4,
        },
        content: {
            padding: spacing.screen.horizontal,
            marginTop: spacing.section.margin,
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
            lineHeight: 24,
        },
        metaRow: {
            flexDirection: 'row',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: spacing.component.md,
            marginBottom: spacing.section.gap,
        },
        metaItem: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.background.secondary,
            paddingHorizontal: spacing.component.sm,
            paddingVertical: spacing.component.xs,
            borderRadius: radius.medium,
        },
        metaIcon: {
            fontSize: 16,
            marginRight: 6,
        },
        metaText: {
            ...typography.bodySmall,
            color: colors.text.primary,
        },
        actionsContainer: {
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            paddingHorizontal: spacing.screen.horizontal,
            paddingTop: spacing.component.md,
            paddingBottom: insets.bottom + spacing.component.md,
        },
        actionButton: {
            flex: 1,
            height: spacing.touch.large,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: radius.medium,
        },
        primaryAction: {
            backgroundColor: goal?.completed ? colors.background.tertiary : colors.status.completed,
            marginBottom: spacing.component.sm,
        },
        dangerAction: {
            backgroundColor: 'transparent',
            borderWidth: 1,
            borderColor: colors.status.error,
        },
        actionText: {
            ...typography.label,
            color: colors.text.inverted,
        },
        dangerText: {
            ...typography.label,
            color: colors.status.error,
        },
        notesSection: {
            backgroundColor: colors.background.secondary,
            borderRadius: radius.medium,
            padding: spacing.component.md,
            borderLeftWidth: 2,
            borderLeftColor: colors.accent.primary,
        },
        notesText: {
            ...typography.body,
            color: colors.text.secondary,
            fontStyle: 'italic',
        },
    }), [colors, spacing, radius, insets, typography, goal?.completed]);

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

    return (
        <View style={styles.container}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Immersive Hero */}
                <View style={styles.imageContainer}>
                    {goal.image ? (
                        <Image source={{ uri: goal.image }} style={styles.image} contentFit="cover" transition={400} />
                    ) : (
                        <View style={[styles.image, { backgroundColor: colors.background.secondary, alignItems: 'center', justifyContent: 'center' }]}>
                            <Text style={{ fontSize: 100 }}>{category.emoji}</Text>
                        </View>
                    )}
                    <View style={styles.imageOverlay}>
                        {/* Gradient scrim for text readability */}
                        <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.3)' }]} />
                        <Animated.View
                            style={styles.imageGradient}
                            entering={FadeIn.duration(600)}
                        >
                            <View style={[styles.statusBadge, { backgroundColor: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)' }]}>
                                <View style={[styles.statusDot, { backgroundColor: colors.status[status] }]} />
                                <Text style={[styles.statusText, { color: '#FFFFFF' }]}>{status}</Text>
                            </View>
                            <Text style={styles.title}>{goal.title}</Text>
                        </Animated.View>
                    </View>
                </View>

                {/* Main Content */}
                <Animated.View style={styles.content} entering={SlideInUp.delay(200).duration(500)}>

                    {/* Meta Data Row (Category, Location, Date) */}
                    <View style={styles.metaRow}>
                        <View style={styles.metaItem}>
                            <Text style={styles.metaIcon}>{category.emoji}</Text>
                            <Text style={styles.metaText}>{category.label}</Text>
                        </View>

                        {goal.location && (
                            <View style={styles.metaItem}>
                                <Text style={styles.metaIcon}>📍</Text>
                                <Text style={styles.metaText}>{goal.location.city}</Text>
                            </View>
                        )}

                        <View style={styles.metaItem}>
                            <Text style={styles.metaIcon}>📅</Text>
                            <Text style={styles.metaText}>{formatDate(goal.timelineDate)}</Text>
                        </View>
                    </View>

                    {/* Description */}
                    {goal.description && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>DESCRIPTION</Text>
                            <Text style={styles.sectionContent}>{goal.description}</Text>
                        </View>
                    )}

                    {/* Notes / Reflection */}
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

            <HeaderOverlay
                leftAction={{ icon: '←', onPress: () => router.back() }}
                transparent
            />

            {/* Floating Actions */}
            <BlurOverlay style={styles.actionsContainer} intensity={20}>
                <Pressable
                    style={[styles.actionButton, styles.primaryAction]}
                    onPress={handleComplete}
                >
                    <Text style={styles.actionText}>
                        {goal.completed ? 'MARK AS INCOMPLETE' : 'COMPLETE DREAM'}
                    </Text>
                </Pressable>

                <Pressable
                    style={[styles.actionButton, styles.dangerAction]}
                    onPress={handleDelete}
                >
                    <Text style={styles.dangerText}>DELETE DREAM</Text>
                </Pressable>
            </BlurOverlay>
        </View>
    );
}
