/**
 * Atlas — Archive Screen
 * Completed goals memory vault
 */

import React, { useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Image } from 'expo-image';
import { useTheme } from '../../theme';
import { useCompletedGoals, Goal, categoryMeta } from '../../features/goals';
import { BlurOverlay, HeaderOverlay } from '../../components';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ArchiveScreen() {
    const router = useRouter();
    const { colors, typography, spacing, radius } = useTheme();
    const insets = useSafeAreaInsets();
    const completedGoals = useCompletedGoals();
    const headerOffset = insets.top + spacing.screen.top;
    const gridGap = spacing.component.xs;
    const numColumns = 2;
    const itemWidth = (SCREEN_WIDTH - spacing.screen.horizontal * 2 - gridGap) / numColumns;
    const groupedGoals = completedGoals.reduce<Record<string, Goal[]>>((acc, goal) => {
        const completedYear = goal.completedAt
            ? new Date(goal.completedAt).getFullYear().toString()
            : new Date(goal.timelineDate).getFullYear().toString();

        if (!acc[completedYear]) {
            acc[completedYear] = [];
        }

        acc[completedYear].push(goal);
        return acc;
    }, {});

    const groupedByYear = Object.entries(groupedGoals)
        .sort(([a], [b]) => Number(b) - Number(a))
        .map(([year, goals]) => ({
            year,
            goals: goals.sort((a, b) => {
                const dateA = a.completedAt ? new Date(a.completedAt).getTime() : new Date(a.timelineDate).getTime();
                const dateB = b.completedAt ? new Date(b.completedAt).getTime() : new Date(b.timelineDate).getTime();
                return dateB - dateA;
            }),
        }));

    const handleGoalPress = useCallback((id: string) => {
        router.push(`/goal/${id}` as any);
    }, [router]);

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background.primary,
        },
        listContent: {
            paddingTop: headerOffset,
            paddingBottom: spacing.screen.bottom + insets.bottom,
            paddingHorizontal: spacing.screen.horizontal,
        },
        statsContainer: {
            marginBottom: spacing.section.margin,
            borderRadius: radius.large,
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: colors.border.subtle,
            padding: spacing.component.md,
        },
        statsTitle: {
            ...typography.displayLarge,
            color: colors.text.primary,
            marginBottom: spacing.component.xs,
        },
        statsSubtitle: {
            ...typography.body,
            color: colors.text.secondary,
        },
        yearSection: {
            marginBottom: spacing.section.margin,
        },
        yearHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: spacing.component.sm,
        },
        yearPill: {
            backgroundColor: colors.background.tertiary,
            borderRadius: radius.full,
            paddingHorizontal: spacing.component.sm,
            paddingVertical: spacing.component.xs / 2,
            marginRight: spacing.component.sm,
        },
        yearText: {
            ...typography.label,
            color: colors.text.primary,
        },
        yearLine: {
            flex: 1,
            height: StyleSheet.hairlineWidth,
            backgroundColor: colors.border.subtle,
        },
        yearGrid: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            marginRight: -gridGap,
        },
        gridItem: {
            width: itemWidth,
            height: itemWidth * 1.3,
            marginBottom: gridGap,
            marginRight: gridGap,
            borderRadius: radius.medium,
            overflow: 'hidden',
            backgroundColor: colors.background.secondary,
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: colors.border.subtle,
        },
        gridImage: {
            width: '100%',
            height: '70%',
        },
        gridContent: {
            flex: 1,
            padding: spacing.component.xs,
            justifyContent: 'center',
        },
        gridTitle: {
            ...typography.bodySmall,
            color: colors.text.primary,
            fontWeight: '600',
        },
        gridDate: {
            ...typography.caption,
            color: colors.text.secondary,
            marginTop: spacing.component.xs / 4,
        },
        completedBadge: {
            position: 'absolute',
            top: spacing.component.xs,
            left: spacing.component.xs,
            backgroundColor: colors.status.completed,
            width: spacing.component.md,
            height: spacing.component.md,
            borderRadius: radius.full,
            alignItems: 'center',
            justifyContent: 'center',
        },
        completedCheck: {
            color: colors.text.inverted,
            fontSize: 14,
            fontWeight: 'bold',
        },
        emptyContainer: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: spacing.screen.horizontal,
        },
        emptyCard: {
            width: '100%',
            borderRadius: radius.large,
            padding: spacing.component.lg,
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: colors.border.subtle,
            alignItems: 'center',
        },
        emptyIcon: {
            fontSize: 64,
            marginBottom: spacing.component.md,
        },
        emptyTitle: {
            ...typography.headingLarge,
            color: colors.text.primary,
            textAlign: 'center',
            marginBottom: spacing.component.sm,
        },
        emptyDescription: {
            ...typography.body,
            color: colors.text.secondary,
            textAlign: 'center',
        },
    });

    const renderItem = ({ item, index }: { item: Goal; index: number }) => {
        const completedDate = item.completedAt
            ? new Date(item.completedAt).toLocaleDateString('en-US', {
                month: 'short',
                year: 'numeric',
            })
            : '';

        return (
            <Animated.View key={item.id} entering={FadeIn.delay(index * 50).duration(300)}>
                <Pressable style={styles.gridItem} onPress={() => handleGoalPress(item.id)}>
                    {item.image ? (
                        <Image source={{ uri: item.image }} style={styles.gridImage} contentFit="cover" />
                    ) : (
                        <View style={[styles.gridImage, { backgroundColor: colors.background.tertiary, alignItems: 'center', justifyContent: 'center' }]}>
                            <Text style={{ fontSize: typography.headingLarge.fontSize }}>{categoryMeta[item.category].emoji}</Text>
                        </View>
                    )}

                    <View style={styles.completedBadge}>
                        <Text style={styles.completedCheck}>✓</Text>
                    </View>

                    <View style={styles.gridContent}>
                        <Text style={styles.gridTitle} numberOfLines={1}>{item.title}</Text>
                        <Text style={styles.gridDate}>{completedDate}</Text>
                    </View>
                </Pressable>
            </Animated.View>
        );
    };

    const renderHeader = () => (
        <BlurOverlay style={styles.statsContainer} intensity={26}>
            <Text style={styles.statsTitle}>{completedGoals.length}</Text>
            <Text style={styles.statsSubtitle}>
                {completedGoals.length === 1 ? 'dream achieved' : 'dreams achieved'}
            </Text>
        </BlurOverlay>
    );

    // Empty state
    if (completedGoals.length === 0) {
        return (
            <View style={styles.container}>
                <HeaderOverlay title="Archive" transparent />
                <View style={styles.emptyContainer}>
                    <BlurOverlay style={styles.emptyCard} intensity={30}>
                        <Text style={styles.emptyIcon}>📦</Text>
                        <Text style={styles.emptyTitle}>Your memory vault</Text>
                        <Text style={styles.emptyDescription}>
                            Completed dreams will be preserved here for you to revisit and reflect upon.
                        </Text>
                    </BlurOverlay>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <HeaderOverlay title="Archive" transparent />

            <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
                {renderHeader()}

                {groupedByYear.map((group) => (
                    <View key={group.year} style={styles.yearSection}>
                        <View style={styles.yearHeader}>
                            <View style={styles.yearPill}>
                                <Text style={styles.yearText}>{group.year}</Text>
                            </View>
                            <View style={styles.yearLine} />
                        </View>

                        <View style={styles.yearGrid}>
                            {group.goals.map((goal, index) => renderItem({ item: goal, index }))}
                        </View>
                    </View>
                ))}
            </ScrollView>
        </View>
    );
}
