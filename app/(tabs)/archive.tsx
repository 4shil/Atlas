/**
 * Atlas — Archive Screen
 * Completed goals memory vault
 */

import React, { useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Image } from 'expo-image';
import { useTheme } from '../../src/theme';
import { useCompletedGoals, Goal, categoryMeta } from '../../src/features/goals';
import { HeaderOverlay } from '../../src/components';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_GAP = 8;
const NUM_COLUMNS = 2;
const ITEM_WIDTH = (SCREEN_WIDTH - 32 - GRID_GAP) / NUM_COLUMNS;

export default function ArchiveScreen() {
    const router = useRouter();
    const { colors, typography, spacing, radius } = useTheme();
    const insets = useSafeAreaInsets();
    const completedGoals = useCompletedGoals();

    const handleGoalPress = useCallback((id: string) => {
        router.push(`/goal/${id}` as any);
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
        statsContainer: {
            marginBottom: spacing.section.margin,
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
        gridItem: {
            width: ITEM_WIDTH,
            height: ITEM_WIDTH * 1.3,
            marginBottom: GRID_GAP,
            marginRight: GRID_GAP,
            borderRadius: radius.medium,
            overflow: 'hidden',
            backgroundColor: colors.background.secondary,
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
            marginTop: 2,
        },
        completedBadge: {
            position: 'absolute',
            top: 8,
            left: 8,
            backgroundColor: colors.status.completed,
            width: 24,
            height: 24,
            borderRadius: 12,
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
            <Animated.View entering={FadeIn.delay(index * 50).duration(300)}>
                <Pressable style={styles.gridItem} onPress={() => handleGoalPress(item.id)}>
                    {item.image ? (
                        <Image source={{ uri: item.image }} style={styles.gridImage} contentFit="cover" />
                    ) : (
                        <View style={[styles.gridImage, { backgroundColor: colors.background.tertiary, alignItems: 'center', justifyContent: 'center' }]}>
                            <Text style={{ fontSize: 32 }}>{categoryMeta[item.category].emoji}</Text>
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
        <View style={styles.statsContainer}>
            <Text style={styles.statsTitle}>{completedGoals.length}</Text>
            <Text style={styles.statsSubtitle}>
                {completedGoals.length === 1 ? 'dream achieved' : 'dreams achieved'}
            </Text>
        </View>
    );

    // Empty state
    if (completedGoals.length === 0) {
        return (
            <View style={styles.container}>
                <HeaderOverlay title="Archive" transparent />
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyIcon}>📦</Text>
                    <Text style={styles.emptyTitle}>Your memory vault</Text>
                    <Text style={styles.emptyDescription}>
                        Completed dreams will be preserved here for you to revisit and reflect upon.
                    </Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <HeaderOverlay title="Archive" transparent />

            <FlatList
                data={completedGoals}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                ListHeaderComponent={renderHeader}
                numColumns={NUM_COLUMNS}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
}
