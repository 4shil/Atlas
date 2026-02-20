/**
 * Atlas — Map Screen
 * Interactive world map with goal pins
 */

import React, { useCallback, useMemo } from 'react';
import { View, StyleSheet, Dimensions, Platform, Text } from 'react-native';
import { useRouter } from 'expo-router';
import MapView, { Marker, PROVIDER_DEFAULT, PROVIDER_GOOGLE } from 'react-native-maps';
import { useTheme } from '../../theme';
import { useGoalsWithLocation, getGoalStatus } from '../../features/goals';
import { HeaderOverlay, FloatingActionButton, BlurOverlay } from '../../components';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Cinematic Dark Map Style
const mapStyle = [
    {
        "elementType": "geometry",
        "stylers": [{ "color": "#212121" }]
    },
    {
        "elementType": "labels.icon",
        "stylers": [{ "visibility": "off" }]
    },
    {
        "elementType": "labels.text.fill",
        "stylers": [{ "color": "#757575" }]
    },
    {
        "elementType": "labels.text.stroke",
        "stylers": [{ "color": "#212121" }]
    },
    {
        "featureType": "administrative",
        "elementType": "geometry",
        "stylers": [{ "color": "#757575" }]
    },
    {
        "featureType": "administrative.country",
        "elementType": "labels.text.fill",
        "stylers": [{ "color": "#9e9e9e" }]
    },
    {
        "featureType": "administrative.land_parcel",
        "stylers": [{ "visibility": "off" }]
    },
    {
        "featureType": "administrative.locality",
        "elementType": "labels.text.fill",
        "stylers": [{ "color": "#bdbdbd" }]
    },
    {
        "featureType": "poi",
        "elementType": "labels.text.fill",
        "stylers": [{ "color": "#757575" }]
    },
    {
        "featureType": "poi.park",
        "elementType": "geometry",
        "stylers": [{ "color": "#181818" }]
    },
    {
        "featureType": "poi.park",
        "elementType": "labels.text.fill",
        "stylers": [{ "color": "#616161" }]
    },
    {
        "featureType": "poi.park",
        "elementType": "labels.text.stroke",
        "stylers": [{ "color": "#1b1b1b" }]
    },
    {
        "featureType": "road",
        "elementType": "geometry.fill",
        "stylers": [{ "color": "#2c2c2c" }]
    },
    {
        "featureType": "road.arterial",
        "elementType": "geometry",
        "stylers": [{ "color": "#373737" }]
    },
    {
        "featureType": "road.highway",
        "elementType": "geometry",
        "stylers": [{ "color": "#3c3c3c" }]
    },
    {
        "featureType": "road.highway.controlled_access",
        "elementType": "geometry",
        "stylers": [{ "color": "#4e4e4e" }]
    },
    {
        "featureType": "road.local",
        "elementType": "labels.text.fill",
        "stylers": [{ "color": "#616161" }]
    },
    {
        "featureType": "transit",
        "elementType": "labels.text.fill",
        "stylers": [{ "color": "#757575" }]
    },
    {
        "featureType": "water",
        "elementType": "geometry",
        "stylers": [{ "color": "#000000" }]
    },
    {
        "featureType": "water",
        "elementType": "labels.text.fill",
        "stylers": [{ "color": "#3d3d3d" }]
    }
];

export default function MapScreen() {
    const router = useRouter();
    const { colors, typography, spacing, radius } = useTheme();
    const goalsWithLocation = useGoalsWithLocation();

    const handleMarkerPress = useCallback((id: string) => {
        router.push(`/goal/${id}` as any);
    }, [router]);

    const handleCreatePress = useCallback(() => {
        router.push('/goal/create' as any);
    }, [router]);

    const initialRegion = useMemo(() => {
        // Default to a world view or user's first goal
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
    }, [goalsWithLocation]);

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
    });

    return (
        <View style={styles.container}>
            <MapView
                style={styles.map}
                provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : PROVIDER_DEFAULT}
                customMapStyle={mapStyle}
                initialRegion={initialRegion}
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
                            onCalloutPress={() => handleMarkerPress(goal.id)}
                            pinColor={pinColor}
                        />
                    )
                })}
            </MapView>

            <HeaderOverlay title="Locations" transparent />

            {goalsWithLocation.length === 0 && (
                <BlurOverlay style={styles.emptyOverlay} intensity={30}>
                    <Text style={styles.emptyTitle}>No pinned goals yet</Text>
                    <Text style={styles.emptyDescription}>
                        Add a location to a dream and it will appear on your world map.
                    </Text>
                </BlurOverlay>
            )}

            <FloatingActionButton onPress={handleCreatePress} icon="+" />
        </View>
    );
}
