import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import MapView, { Marker, Callout } from 'react-native-maps';
import { MaterialIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import type { Goal } from '../store/useGoalStore';
import type { Attraction, AttractionType } from '../hooks/useNearbyAttractions';
import { useRouter } from 'expo-router';

interface MapWrapperProps {
    goals: Goal[];
    recenterTrigger?: number;
    isFullscreen?: boolean;
    mapStyle?: 'standard' | 'satellite';
    flyToCoords?: { latitude: number; longitude: number } | null;
    attractions?: Attraction[];
    onAttractionPress?: (attraction: Attraction) => void;
}

interface Cluster {
    id: string;
    latitude: number;
    longitude: number;
    goals: Goal[];
    isCluster: boolean;
}

const CLUSTER_DISTANCE = 0.5; // degrees

function clusterGoals(goals: Goal[]): Cluster[] {
    const clusters: Cluster[] = [];
    const used = new Set<string>();

    for (const goal of goals) {
        if (used.has(goal.id)) continue;
        const nearby = goals.filter(
            g =>
                !used.has(g.id) &&
                Math.abs(g.location.latitude - goal.location.latitude) < CLUSTER_DISTANCE &&
                Math.abs(g.location.longitude - goal.location.longitude) < CLUSTER_DISTANCE
        );
        nearby.forEach(g => used.add(g.id));

        const avgLat = nearby.reduce((sum, g) => sum + g.location.latitude, 0) / nearby.length;
        const avgLng = nearby.reduce((sum, g) => sum + g.location.longitude, 0) / nearby.length;

        clusters.push({
            id: nearby.map(g => g.id).join('-'),
            latitude: avgLat,
            longitude: avgLng,
            goals: nearby,
            isCluster: nearby.length > 1,
        });
    }

    return clusters;
}

export default function MapWrapper({
    goals,
    recenterTrigger = 0,
    isFullscreen = false,
    mapStyle = 'standard',
    flyToCoords,
    attractions = [],
    onAttractionPress,
}: MapWrapperProps) {
    const router = useRouter();
    const mapRef = React.useRef<MapView | null>(null);
    const goalsWithCoords = goals.filter(
        g => g.location.latitude !== 0 || g.location.longitude !== 0
    );

    const clusters = React.useMemo(() => clusterGoals(goalsWithCoords), [goalsWithCoords]);

    React.useEffect(() => {
        if (recenterTrigger === 0) return;

        const recenter = async () => {
            try {
                const { status } = await Location.requestForegroundPermissionsAsync();

                if (status === 'granted') {
                    const position = await Location.getCurrentPositionAsync({});
                    mapRef.current?.animateToRegion(
                        {
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude,
                            latitudeDelta: 8,
                            longitudeDelta: 8,
                        },
                        500
                    );
                    return;
                }
            } catch {}

            if (goalsWithCoords.length > 0) {
                mapRef.current?.animateToRegion(
                    {
                        latitude: goalsWithCoords[0].location.latitude,
                        longitude: goalsWithCoords[0].location.longitude,
                        latitudeDelta: 20,
                        longitudeDelta: 20,
                    },
                    500
                );
            }
        };

        recenter();
    }, [recenterTrigger, goalsWithCoords]);

    // Fly to searched coordinates
    React.useEffect(() => {
        if (!flyToCoords) return;
        mapRef.current?.animateToRegion(
            {
                latitude: flyToCoords.latitude,
                longitude: flyToCoords.longitude,
                latitudeDelta: 0.5,
                longitudeDelta: 0.5,
            },
            800
        );
    }, [flyToCoords]);

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'Foodie':
                return 'restaurant';
            case 'Stays':
                return 'hotel';
            case 'Travel':
                return 'flight';
            case 'Milestone':
                return 'star';
            default:
                return 'hiking';
        }
    };

    const getAttractionIcon = (
        type: AttractionType
    ): { icon: string; color: string; bg: string } => {
        switch (type) {
            case 'cafe':
                return { icon: 'local-cafe', color: '#f59e0b', bg: 'rgba(92,60,0,0.85)' };
            case 'restaurant':
                return { icon: 'restaurant', color: '#f97316', bg: 'rgba(92,40,0,0.85)' };
            case 'park':
                return { icon: 'park', color: '#4ade80', bg: 'rgba(0,60,20,0.85)' };
            case 'museum':
                return { icon: 'museum', color: '#a78bfa', bg: 'rgba(50,0,90,0.85)' };
            case 'hotel':
                return { icon: 'hotel', color: '#38bdf8', bg: 'rgba(0,40,80,0.85)' };
            case 'shop':
                return { icon: 'shopping-bag', color: '#f472b6', bg: 'rgba(80,0,50,0.85)' };
            default:
                return { icon: 'place', color: '#e2e8f0', bg: 'rgba(30,30,40,0.85)' };
        }
    };

    return (
        <View style={StyleSheet.absoluteFillObject}>
            <MapView
                ref={mapRef}
                style={StyleSheet.absoluteFillObject}
                initialRegion={{
                    latitude:
                        goalsWithCoords.length > 0 ? goalsWithCoords[0].location.latitude : 20,
                    longitude:
                        goalsWithCoords.length > 0 ? goalsWithCoords[0].location.longitude : 0,
                    latitudeDelta: 80,
                    longitudeDelta: 80,
                }}
                userInterfaceStyle="dark"
                mapType={mapStyle === 'satellite' ? 'satellite' : 'standard'}
            >
                {clusters.map(cluster => {
                    const goal = cluster.goals[0];
                    if (cluster.isCluster) {
                        // Cluster marker
                        return (
                            <Marker
                                key={cluster.id}
                                coordinate={{
                                    latitude: cluster.latitude,
                                    longitude: cluster.longitude,
                                }}
                                onPress={() => {
                                    mapRef.current?.animateToRegion(
                                        {
                                            latitude: cluster.latitude,
                                            longitude: cluster.longitude,
                                            latitudeDelta: CLUSTER_DISTANCE * 1.2,
                                            longitudeDelta: CLUSTER_DISTANCE * 1.2,
                                        },
                                        400
                                    );
                                }}
                            >
                                <View
                                    style={{
                                        width: 48,
                                        height: 48,
                                        borderRadius: 24,
                                        backgroundColor: 'rgba(96,165,250,0.85)',
                                        borderWidth: 2,
                                        borderColor: 'rgba(255,255,255,0.5)',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        shadowColor: '#60a5fa',
                                        shadowOffset: { width: 0, height: 2 },
                                        shadowOpacity: 0.6,
                                        shadowRadius: 8,
                                        elevation: 8,
                                    }}
                                >
                                    <Text
                                        style={{ color: 'white', fontWeight: '800', fontSize: 16 }}
                                    >
                                        {cluster.goals.length}
                                    </Text>
                                </View>
                            </Marker>
                        );
                    }

                    return (
                        <Marker
                            key={goal.id}
                            coordinate={{
                                latitude: goal.location.latitude,
                                longitude: goal.location.longitude,
                            }}
                            onPress={() =>
                                router.push({ pathname: '/goal-detail', params: { id: goal.id } })
                            }
                        >
                            <View style={{ alignItems: 'center' }}>
                                <View
                                    style={{
                                        width: 44,
                                        height: 44,
                                        borderRadius: 22,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        borderWidth: 2,
                                        borderColor: goal.completed
                                            ? 'rgba(74,222,128,0.6)'
                                            : 'rgba(96,165,250,0.5)',
                                        backgroundColor: goal.completed
                                            ? 'rgba(22,101,52,0.85)'
                                            : 'rgba(10,15,40,0.9)',
                                        shadowColor: goal.completed ? '#4ade80' : '#60a5fa',
                                        shadowOffset: { width: 0, height: 2 },
                                        shadowOpacity: 0.5,
                                        shadowRadius: 8,
                                        elevation: 8,
                                    }}
                                >
                                    <MaterialIcons
                                        name={getCategoryIcon(goal.category) as any}
                                        size={20}
                                        color={goal.completed ? '#4ade80' : '#60a5fa'}
                                    />
                                </View>
                                <View
                                    style={{
                                        backgroundColor: 'rgba(0,0,0,0.75)',
                                        borderRadius: 8,
                                        paddingHorizontal: 6,
                                        paddingVertical: 2,
                                        marginTop: 3,
                                        maxWidth: 100,
                                    }}
                                >
                                    <Text
                                        style={{ color: 'white', fontSize: 9, fontWeight: '600' }}
                                        numberOfLines={1}
                                    >
                                        {goal.title}
                                    </Text>
                                </View>
                            </View>
                        </Marker>
                    );
                })}
                {/* Attraction pins */}
                {attractions.map(attraction => {
                    const { icon, color, bg } = getAttractionIcon(attraction.type);
                    return (
                        <Marker
                            key={`attr-${attraction.id}`}
                            coordinate={{
                                latitude: attraction.latitude,
                                longitude: attraction.longitude,
                            }}
                            onPress={() => onAttractionPress?.(attraction)}
                        >
                            <View style={{ alignItems: 'center' }}>
                                <View
                                    style={{
                                        width: 34,
                                        height: 34,
                                        borderRadius: 17,
                                        backgroundColor: bg,
                                        borderWidth: 1.5,
                                        borderColor: color,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        shadowColor: color,
                                        shadowOffset: { width: 0, height: 2 },
                                        shadowOpacity: 0.5,
                                        shadowRadius: 6,
                                        elevation: 6,
                                    }}
                                >
                                    <MaterialIcons name={icon as any} size={16} color={color} />
                                </View>
                            </View>
                        </Marker>
                    );
                })}
            </MapView>
        </View>
    );
}
