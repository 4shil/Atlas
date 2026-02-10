/**
 * Atlas — Gallery Screen (Home)
 * Cinematic fullscreen goal carousel
 */

import React, { useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions, Pressable, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme';
import { useGoals, useGoalsStore } from '../../features/goals';
import { GoalCard, FloatingActionButton, HeaderOverlay } from '../../components';

import Carousel from 'react-native-reanimated-carousel';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');


export default function GalleryScreen() {
    const router = useRouter();
    const { colors, typography, spacing } = useTheme();
    const insets = useSafeAreaInsets();
    const goals = useGoals();
    const activeGoals = useGoalsStore(state => state.getActiveGoals());

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
            minHeight: Platform.OS === 'web' ? '100vh' as any : undefined,
        },
        emptyContainer: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: spacing.screen.horizontal,
            paddingTop: insets.top + 60,
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
        goalsList: {
            flex: 1,
            paddingTop: insets.top + 60,
            paddingHorizontal: spacing.screen.horizontal,
            paddingBottom: 100 + insets.bottom,
        },
        goalItem: {
            backgroundColor: colors.background.secondary,
            borderRadius: 16,
            padding: spacing.component.md,
            marginBottom: spacing.list.gap,
        },
        goalTitle: {
            ...typography.headingMedium,
            color: colors.text.primary,
            marginBottom: 4,
        },
        goalDescription: {
            ...typography.body,
            color: colors.text.secondary,
        },
    });

    // Empty state
    if (activeGoals.length === 0) {
        return (
            <View style={styles.container}>
                <HeaderOverlay title="Atlas" transparent />
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyIcon}>🌍</Text>
                    <Text style={styles.emptyTitle}>Your journey begins here</Text>
                    <Text style={styles.emptyDescription}>
                        Create your first dream destination and start building your life's gallery.
                    </Text>
                </View>
                <FloatingActionButton
                    onPress={handleCreatePress}
                    icon="+"
                    label="NEW DREAM"
                />
            </View>
        );
    }

    // Simple list view for now (carousel can be added back later)
    return (
        <View style={styles.container}>
            <HeaderOverlay title="Atlas" transparent />

            <Carousel
                loop={false}
                width={SCREEN_WIDTH}
                height={SCREEN_HEIGHT}
                vertical={true}
                data={activeGoals}
                scrollAnimationDuration={1000}
                mode="parallax"
                modeConfig={{
                    parallaxScrollingScale: 0.9,
                    parallaxScrollingOffset: 50,
                }}
                renderItem={({ item }) => (
                    <View style={{ flex: 1 }}>
                        <GoalCard
                            goal={item}
                            onPress={() => handleGoalPress(item.id)}
                            variant="full"
                        />
                    </View>
                )}
            />

            <FloatingActionButton
                onPress={handleCreatePress}
                icon="+"
            />
        </View>
    );
}
