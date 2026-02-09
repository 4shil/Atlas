/**
 * Atlas — Gallery Screen (Home)
 * Cinematic fullscreen goal carousel
 */

import React, { useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import Carousel from 'react-native-reanimated-carousel';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    interpolate,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../src/theme';
import { useGoals, useGoalsStore } from '../../src/features/goals';
import { GoalCard, FloatingActionButton, HeaderOverlay } from '../../src/components';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function GalleryScreen() {
    const router = useRouter();
    const { colors, typography, spacing } = useTheme();
    const insets = useSafeAreaInsets();
    const goals = useGoals();
    const activeGoals = useGoalsStore(state => state.getActiveGoals());

    const handleGoalPress = useCallback((id: string) => {
        router.push(`/goal/${id}`);
    }, [router]);

    const handleCreatePress = useCallback(() => {
        router.push('/goal/create');
    }, [router]);

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background.primary,
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
        carouselContainer: {
            flex: 1,
        },
        pageIndicator: {
            position: 'absolute',
            top: insets.top + 60,
            right: spacing.screen.horizontal,
            backgroundColor: colors.overlay.blur,
            paddingHorizontal: spacing.component.sm,
            paddingVertical: spacing.component.xs / 2,
            borderRadius: 12,
        },
        pageText: {
            ...typography.caption,
            color: colors.text.primary,
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

    return (
        <View style={styles.container}>
            <HeaderOverlay title="Atlas" transparent />

            <View style={styles.carouselContainer}>
                <Carousel
                    loop
                    width={SCREEN_WIDTH}
                    height={SCREEN_HEIGHT}
                    data={activeGoals}
                    scrollAnimationDuration={600}
                    mode="parallax"
                    modeConfig={{
                        parallaxScrollingScale: 0.9,
                        parallaxScrollingOffset: 50,
                    }}
                    renderItem={({ item }) => (
                        <GoalCard
                            goal={item}
                            variant="full"
                            onPress={() => handleGoalPress(item.id)}
                        />
                    )}
                />
            </View>

            <FloatingActionButton
                onPress={handleCreatePress}
                icon="+"
            />
        </View>
    );
}
