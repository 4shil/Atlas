/**
 * Atlas — Map Screen
 * Interactive world map with goal pins
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, StyleSheet, Dimensions, Platform, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import MapView, { Marker, PROVIDER_DEFAULT, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme';
import { cinematicDarkMapStyle } from '../../theme/tokens';
import { useGoalsWithLocation, getGoalStatus } from '../../features/goals';
import { HeaderOverlay, FloatingActionButton, BlurOverlay } from '../../components';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function MapScreen() {
    const router = useRouter();
    const { colors, typography, spacing, radius } = useTheme();
    const insets = useSafeAreaInsets();
    const goalsWithLocation = useGoalsWithLocation();
    const mapRef = useRef<MapView | null>(null);
    const [userRegion, setUserRegion] = useState<{
        latitude: number;
        longitude: number;
        latitudeDelta: number;
        longitudeDelta: number;
    } | null>(null);
    const [locationDenied, setLocationDenied] = useState(false);

    useEffect(() => {
        let mounted = true;

        const loadUserLocation = async () => {
            try {
                const permission = await Location.requestForegroundPermissionsAsync();

                if (permission.status !== 'granted') {
                    if (mounted) setLocationDenied(true);
                    return;
                }

                const current = await Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.Balanced,
                });

                if (!mounted) {
                    return;
                }

                setLocationDenied(false);
                setUserRegion({
                    latitude: current.coords.latitude,
                    longitude: current.coords.longitude,
                    latitudeDelta: 10,
                    longitudeDelta: 10,
                });
            } catch {
                if (mounted) {
                    setLocationDenied(true);
                }
            }
        };

        loadUserLocation();

        return () => {
            mounted = false;
        };
    }, []);

    const handleMarkerPress = useCallback((id: string) => {
        router.push(`/goal/${id}` as any);
    }, [router]);

    const handleCreatePress = useCallback(() => {
        router.push('/goal/create' as any);
    }, [router]);

    const handleRecenterPress = useCallback(async () => {
        try {
            const permission = await Location.requestForegroundPermissionsAsync();
            if (permission.status !== 'granted') {
                setLocationDenied(true);
                return;
            }

            const current = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced,
            });

            const nextRegion = {
                latitude: current.coords.latitude,
                longitude: current.coords.longitude,
                latitudeDelta: 10,
                longitudeDelta: 10,
            };

            setLocationDenied(false);
            setUserRegion(nextRegion);
            mapRef.current?.animateToRegion(nextRegion, 450);
        } catch {
            setLocationDenied(true);
        }
    }, []);

    const initialRegion = useMemo(() => {
        if (userRegion) {
            return userRegion;
        }

        if (goalsWithLocation.length > 0) {
            return {
                latitude: goalsWithLocation[0].location!.latitude,
                longitude: goalsWithLocation[0].location!.longitude,
                latitudeDelta: 10,
                longitudeDelta: 10,
            };
        }
        return {
            latitude: 20,
            longitude: 0,
            latitudeDelta: 60,
            longitudeDelta: 60,
        };
    }, [goalsWithLocation, userRegion]);

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background.primary,
        },
        map: {
            width: SCREEN_WIDTH,
            height: SCREEN_HEIGHT,
        },
        emptyOverlay: {
            position: 'absolute',
            left: spacing.screen.horizontal,
            right: spacing.screen.horizontal,
            bottom: spacing.screen.bottom + spacing.touch.large + spacing.component.md,
            borderRadius: radius.large,
            padding: spacing.component.md,
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: colors.border.subtle,
        },
        emptyTitle: {
            ...typography.headingSmall,
            color: colors.text.primary,
            marginBottom: spacing.component.xs,
        },
        emptyDescription: {
            ...typography.bodySmall,
            color: colors.text.secondary,
        },
        recenterButtonContainer: {
            position: 'absolute',
            right: spacing.screen.horizontal,
            bottom: insets.bottom + spacing.touch.large + spacing.component.md + spacing.touch.large + spacing.component.sm,
            width: spacing.touch.large,
            height: spacing.touch.large,
            borderRadius: radius.full,
            overflow: 'hidden',
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: colors.border.subtle,
            alignItems: 'center',
            justifyContent: 'center',
        },
    });

    return (
        <View style={styles.container}>
            <MapView
                ref={mapRef}
                style={styles.map}
                provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : PROVIDER_DEFAULT}
                customMapStyle={cinematicDarkMapStyle as any}
                initialRegion={initialRegion}
                showsUserLocation
                showsMyLocationButton
                rotateEnabled={false}
                pitchEnabled={false}
                toolbarEnabled={false}
            >
                {goalsWithLocation.map((goal) => {
                    const status = getGoalStatus(goal);
                    const pinColor =
                        status === 'completed'
                            ? colors.status.completed
                            : status === 'wishlist'
                                ? colors.status.wishlist
                                : colors.status.planned;

                    return (
                        <Marker
                            key={goal.id}
                            coordinate={{
                                latitude: goal.location!.latitude,
                                longitude: goal.location!.longitude,
                            }}
                            title={goal.title}
                            description={goal.location!.city}
                            onPress={() => handleMarkerPress(goal.id)}
                            onCalloutPress={() => handleMarkerPress(goal.id)}
                            pinColor={pinColor}
                        />
                    )
                })}
            </MapView>

            <HeaderOverlay title="Locations" transparent />

            {goalsWithLocation.length === 0 && (
                <BlurOverlay style={styles.emptyOverlay} intensity={30}>
                    <Text style={styles.emptyTitle}>
                        {locationDenied ? 'Location permission needed' : 'No pinned goals yet'}
                    </Text>
                    <Text style={styles.emptyDescription}>
                        {locationDenied
                            ? 'Enable location access to center the map around your real position.'
                            : 'Add a location to a dream and it will appear on your world map.'}
                    </Text>
                </BlurOverlay>
            )}

            <BlurOverlay style={styles.recenterButtonContainer} intensity={30}>
                <Pressable
                    style={{ width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}
                    onPress={handleRecenterPress}
                    hitSlop={8}
                >
                    <Ionicons name="locate" size={22} color={colors.text.primary} />
                </Pressable>
            </BlurOverlay>

            <FloatingActionButton onPress={handleCreatePress} icon="add" />
        </View>
    );
}
