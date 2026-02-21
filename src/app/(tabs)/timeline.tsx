/**
 * Atlas — Timeline Screen
 * Chronological vertical scroll of goals
 */

import React, { useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, SectionList } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme';
import { useGoals, Goal } from '../../features/goals';
import { HeaderOverlay, FloatingActionButton, BlurOverlay } from '../../components';
import TimelineItem from '../../components/TimelineItem';

interface YearSection {
    title: string;
    data: Goal[];
}

export default function TimelineScreen() {
    const router = useRouter();
    const { colors, typography, spacing, radius } = useTheme();
    const insets = useSafeAreaInsets();
    const goals = useGoals();
    const headerOffset = insets.top + spacing.screen.top;
    const bottomOffset = insets.bottom + spacing.screen.bottom;

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

    const styles = useMemo(() => StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background.primary,
        },
        listContent: {
            paddingTop: headerOffset,
            paddingBottom: bottomOffset,
            paddingHorizontal: spacing.screen.horizontal,
        },
        sectionHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: spacing.component.sm,
            backgroundColor: colors.background.primary,
            marginTop: spacing.component.sm,
        },
        yearPill: {
            backgroundColor: colors.background.tertiary,
            paddingHorizontal: spacing.component.md,
            paddingVertical: spacing.component.xs / 2,
            borderRadius: radius.full,
            marginRight: spacing.component.md,
        },
        yearText: {
            ...typography.label,
            color: colors.text.primary,
            fontWeight: 'bold',
        },
        yearLine: {
            flex: 1,
            height: StyleSheet.hairlineWidth,
            backgroundColor: colors.border.subtle,
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
    }), [colors, spacing, radius, typography, headerOffset, bottomOffset]);

    const renderSectionHeader = ({ section }: { section: YearSection }) => (
        <View style={styles.sectionHeader}>
            <View style={styles.yearPill}>
                <Text style={styles.yearText}>{section.title}</Text>
            </View>
            <View style={styles.yearLine} />
        </View>
    );

    const renderItem = ({ item, index, section }: { item: Goal; index: number; section: YearSection }) => {
        const isLast = index === section.data.length - 1;
        return (
            <TimelineItem
                item={item}
                index={index}
                isLast={isLast}
                onPress={handleGoalPress}
            />
        );
    };

    // Empty state
    if (sections.length === 0) {
        return (
            <View style={styles.container}>
                <HeaderOverlay title="Timeline" transparent />
                <View style={styles.emptyContainer}>
                    <BlurOverlay style={styles.emptyCard} intensity={30}>
                        <Text style={styles.emptyIcon}>📅</Text>
                        <Text style={styles.emptyTitle}>Write your story</Text>
                        <Text style={styles.emptyDescription}>
                            Your life timeline will unfold as you add dreams with target dates.
                        </Text>
                    </BlurOverlay>
                </View>
                <FloatingActionButton onPress={handleCreatePress} icon="add" />
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
                stickySectionHeadersEnabled={true}
                showsVerticalScrollIndicator={false}
            />

            <FloatingActionButton onPress={handleCreatePress} icon="add" />
        </View>
    );
}

