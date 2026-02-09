/**
 * Atlas — Timeline Screen
 * Chronological vertical scroll of goals
 */

import React, { useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, SectionList, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInRight } from 'react-native-reanimated';
import { Image } from 'expo-image';
import { useTheme } from '../../theme';
import { useGoals, Goal, getGoalStatus, categoryMeta } from '../../features/goals';
import { HeaderOverlay, FloatingActionButton } from '../../components';

interface YearSection {
    title: string;
    data: Goal[];
}

export default function TimelineScreen() {
    const router = useRouter();
    const { colors, typography, spacing, radius } = useTheme();
    const insets = useSafeAreaInsets();
    const goals = useGoals();

    // Group goals by year
    const sections = useMemo<YearSection[]>(() => {
        const grouped: Record<number, Goal[]> = {};

        goals.forEach(goal => {
            const year = new Date(goal.timelineDate).getFullYear();
            if (!grouped[year]) grouped[year] = [];
            grouped[year].push(goal);
        });

        return Object.entries(grouped)
            .sort(([a], [b]) => Number(b) - Number(a))
            .map(([year, items]) => ({
                title: year,
                data: items.sort((a, b) =>
                    new Date(b.timelineDate).getTime() - new Date(a.timelineDate).getTime()
                ),
            }));
    }, [goals]);

    const handleGoalPress = useCallback((id: string) => {
        router.push(`/goal/${id}` as any);
    }, [router]);

    const handleCreatePress = useCallback(() => {
        router.push('/goal/create' as any);
    }, [router]);

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background.primary,
        },
        listContent: {
            paddingTop: insets.top + 60,
            paddingBottom: 100 + insets.bottom,
            paddingHorizontal: spacing.screen.horizontal,
        },
        sectionHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: spacing.component.md,
            marginTop: spacing.section.margin,
        },
        yearText: {
            ...typography.displayLarge,
            color: colors.text.primary,
        },
        yearLine: {
            flex: 1,
            height: 1,
            backgroundColor: colors.border.subtle,
            marginLeft: spacing.component.md,
        },
        timelineItem: {
            flexDirection: 'row',
            marginBottom: spacing.list.gap,
        },
        timelineLine: {
            width: 2,
            backgroundColor: colors.border.subtle,
            marginRight: spacing.component.md,
        },
        timelineDot: {
            position: 'absolute',
            top: 20,
            left: -4,
            width: 10,
            height: 10,
            borderRadius: 5,
        },
        itemCard: {
            flex: 1,
            backgroundColor: colors.background.secondary,
            borderRadius: radius.medium,
            overflow: 'hidden',
        },
        itemImage: {
            width: '100%',
            height: 120,
        },
        itemContent: {
            padding: spacing.component.sm,
        },
        itemDate: {
            ...typography.caption,
            color: colors.text.secondary,
            marginBottom: 4,
        },
        itemTitle: {
            ...typography.headingSmall,
            color: colors.text.primary,
            marginBottom: 4,
        },
        itemLocation: {
            ...typography.caption,
            color: colors.text.secondary,
        },
        categoryBadge: {
            position: 'absolute',
            top: 8,
            right: 8,
            backgroundColor: colors.overlay.blur,
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 12,
        },
        categoryText: {
            fontSize: 12,
        },
        emptyContainer: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: spacing.screen.horizontal,
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

    const renderSectionHeader = ({ section }: { section: YearSection }) => (
        <View style={styles.sectionHeader}>
            <Text style={styles.yearText}>{section.title}</Text>
            <View style={styles.yearLine} />
        </View>
    );

    const renderItem = ({ item, index }: { item: Goal; index: number }) => {
        const status = getGoalStatus(item);
        const category = categoryMeta[item.category];
        const date = new Date(item.timelineDate).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
        });

        return (
            <Animated.View
                style={styles.timelineItem}
                entering={FadeInRight.delay(index * 100).duration(400)}
            >
                <View style={styles.timelineLine}>
                    <View style={[styles.timelineDot, { backgroundColor: colors.status[status] }]} />
                </View>

                <Pressable style={styles.itemCard} onPress={() => handleGoalPress(item.id)}>
                    {item.image && (
                        <View>
                            <Image source={{ uri: item.image }} style={styles.itemImage} contentFit="cover" />
                            <View style={styles.categoryBadge}>
                                <Text style={styles.categoryText}>{category.emoji}</Text>
                            </View>
                        </View>
                    )}
                    <View style={styles.itemContent}>
                        <Text style={styles.itemDate}>{date}</Text>
                        <Text style={styles.itemTitle} numberOfLines={1}>{item.title}</Text>
                        {item.location && (
                            <Text style={styles.itemLocation}>
                                📍 {item.location.city}, {item.location.country}
                            </Text>
                        )}
                    </View>
                </Pressable>
            </Animated.View>
        );
    };

    // Empty state
    if (sections.length === 0) {
        return (
            <View style={styles.container}>
                <HeaderOverlay title="Timeline" transparent />
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyIcon}>📅</Text>
                    <Text style={styles.emptyTitle}>Write your story</Text>
                    <Text style={styles.emptyDescription}>
                        Your life timeline will unfold as you add dreams with target dates.
                    </Text>
                </View>
                <FloatingActionButton onPress={handleCreatePress} icon="+" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <HeaderOverlay title="Timeline" transparent />

            <SectionList
                sections={sections}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                renderSectionHeader={renderSectionHeader}
                contentContainerStyle={styles.listContent}
                stickySectionHeadersEnabled={false}
                showsVerticalScrollIndicator={false}
            />

            <FloatingActionButton onPress={handleCreatePress} icon="+" />
        </View>
    );
}
