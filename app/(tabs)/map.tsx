/**
 * Atlas — Map Screen
 * Interactive world map with goal pins
 * Note: Uses placeholder until react-native-maps is properly configured
 */

import React, { useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions, FlatList, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useTheme } from '../../src/theme';
import { useGoalsWithLocation, getGoalStatus, categoryMeta } from '../../src/features/goals';
import { HeaderOverlay, FloatingActionButton } from '../../src/components';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function MapScreen() {
    const router = useRouter();
    const { colors, typography, spacing, radius } = useTheme();
    const insets = useSafeAreaInsets();
    const goalsWithLocation = useGoalsWithLocation();

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
        headerSection: {
            marginBottom: spacing.section.margin,
        },
        headerTitle: {
            ...typography.displayLarge,
            color: colors.text.primary,
            marginBottom: spacing.component.xs,
        },
        headerSubtitle: {
            ...typography.body,
            color: colors.text.secondary,
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
        locationCard: {
            flexDirection: 'row',
            backgroundColor: colors.background.secondary,
            borderRadius: radius.medium,
            marginBottom: spacing.list.gap,
            overflow: 'hidden',
        },
        cardImage: {
            width: 100,
            height: 100,
        },
        cardImagePlaceholder: {
            width: 100,
            height: 100,
            backgroundColor: colors.background.tertiary,
            alignItems: 'center',
            justifyContent: 'center',
        },
        cardContent: {
            flex: 1,
            padding: spacing.component.sm,
            justifyContent: 'center',
        },
        cardTitle: {
            ...typography.headingSmall,
            color: colors.text.primary,
            marginBottom: 4,
        },
        cardLocation: {
            ...typography.body,
            color: colors.text.secondary,
            marginBottom: 4,
        },
        statusRow: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        statusDot: {
            width: 8,
            height: 8,
            borderRadius: 4,
            marginRight: 6,
        },
        statusText: {
            ...typography.caption,
            color: colors.text.muted,
            textTransform: 'capitalize',
        },
    });

    // Empty state
    if (goalsWithLocation.length === 0) {
        return (
            <View style={styles.container}>
                <HeaderOverlay title="Locations" transparent />
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyIcon}>🗺️</Text>
                    <Text style={styles.emptyTitle}>Your map awaits</Text>
                    <Text style={styles.emptyDescription}>
                        Add locations to your dreams and watch your world come alive.
                    </Text>
                </View>
                <FloatingActionButton onPress={handleCreatePress} icon="+" />
            </View>
        );
    }

    const renderLocationCard = ({ item }: { item: typeof goalsWithLocation[0] }) => {
        const status = getGoalStatus(item);
        const category = categoryMeta[item.category];

        return (
            <Pressable style={styles.locationCard} onPress={() => handleGoalPress(item.id)}>
                {item.image ? (
                    <Image source={{ uri: item.image }} style={styles.cardImage} contentFit="cover" />
                ) : (
                    <View style={styles.cardImagePlaceholder}>
                        <Text style={{ fontSize: 32 }}>{category.emoji}</Text>
                    </View>
                )}
                <View style={styles.cardContent}>
                    <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
                    {item.location && (
                        <Text style={styles.cardLocation}>
                            📍 {item.location.city}, {item.location.country}
                        </Text>
                    )}
                    <View style={styles.statusRow}>
                        <View style={[styles.statusDot, { backgroundColor: colors.status[status] }]} />
                        <Text style={styles.statusText}>{status}</Text>
                    </View>
                </View>
            </Pressable>
        );
    };

    return (
        <View style={styles.container}>
            <HeaderOverlay title="Locations" transparent />

            <FlatList
                data={goalsWithLocation}
                keyExtractor={(item) => item.id}
                renderItem={renderLocationCard}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={
                    <View style={styles.headerSection}>
                        <Text style={styles.headerTitle}>{goalsWithLocation.length}</Text>
                        <Text style={styles.headerSubtitle}>
                            {goalsWithLocation.length === 1 ? 'destination' : 'destinations'}
                        </Text>
                    </View>
                }
            />

            <FloatingActionButton onPress={handleCreatePress} icon="+" />
        </View>
    );
}
