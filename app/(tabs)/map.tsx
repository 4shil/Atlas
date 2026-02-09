/**
 * Atlas — Map Screen
 * Interactive world map with goal pins
 */

import React, { useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../src/theme';
import { useGoalsWithLocation, useGoalsStore, getGoalStatus } from '../../src/features/goals';
import { HeaderOverlay, FloatingActionButton } from '../../src/components';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Dark map style for cinematic feel
const darkMapStyle = [
    { elementType: 'geometry', stylers: [{ color: '#1d1d1d' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#757575' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#212121' }] },
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#000000' }] },
    { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#2c2c2c' }] },
];

export default function MapScreen() {
    const router = useRouter();
    const mapRef = useRef<MapView>(null);
    const { colors, typography, spacing } = useTheme();
    const insets = useSafeAreaInsets();
    const goalsWithLocation = useGoalsWithLocation();

    const handleMarkerPress = useCallback((id: string) => {
        router.push(`/goal/${id}`);
    }, [router]);

    const handleCreatePress = useCallback(() => {
        router.push('/goal/create');
    }, [router]);

    const getMarkerColor = (status: string) => {
        switch (status) {
            case 'completed': return colors.status.completed;
            case 'planned': return colors.status.planned;
            case 'wishlist': return colors.status.wishlist;
            default: return colors.accent.primary;
        }
    };

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background.primary,
        },
        map: {
            width: SCREEN_WIDTH,
            height: SCREEN_HEIGHT,
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
        legendContainer: {
            position: 'absolute',
            bottom: 100 + insets.bottom,
            left: spacing.screen.horizontal,
            backgroundColor: colors.overlay.blur,
            borderRadius: 12,
            padding: spacing.component.sm,
        },
        legendItem: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 4,
        },
        legendDot: {
            width: 10,
            height: 10,
            borderRadius: 5,
            marginRight: 8,
        },
        legendText: {
            ...typography.caption,
            color: colors.text.primary,
        },
    });

    // Empty state
    if (goalsWithLocation.length === 0) {
        return (
            <View style={styles.container}>
                <HeaderOverlay title="World Map" transparent />
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

    return (
        <View style={styles.container}>
            <HeaderOverlay title="World Map" transparent />

            <MapView
                ref={mapRef}
                style={styles.map}
                provider={PROVIDER_GOOGLE}
                customMapStyle={darkMapStyle}
                initialRegion={{
                    latitude: 20,
                    longitude: 0,
                    latitudeDelta: 100,
                    longitudeDelta: 100,
                }}
            >
                {goalsWithLocation.map((goal) => {
                    if (!goal.location) return null;
                    const status = getGoalStatus(goal);

                    return (
                        <Marker
                            key={goal.id}
                            coordinate={{
                                latitude: goal.location.latitude,
                                longitude: goal.location.longitude,
                            }}
                            title={goal.title}
                            description={`${goal.location.city}, ${goal.location.country}`}
                            pinColor={getMarkerColor(status)}
                            onPress={() => handleMarkerPress(goal.id)}
                        />
                    );
                })}
            </MapView>

            {/* Legend */}
            <View style={styles.legendContainer}>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: colors.status.completed }]} />
                    <Text style={styles.legendText}>Completed</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: colors.status.planned }]} />
                    <Text style={styles.legendText}>Planned</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: colors.status.wishlist }]} />
                    <Text style={styles.legendText}>Wishlist</Text>
                </View>
            </View>

            <FloatingActionButton onPress={handleCreatePress} icon="+" />
        </View>
    );
}
