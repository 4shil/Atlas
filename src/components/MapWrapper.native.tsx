import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import MapView, { Marker, Callout } from 'react-native-maps';
import { MaterialIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import type { Goal } from '../store/useGoalStore';
import { useRouter } from 'expo-router';

interface MapWrapperProps {
    goals: Goal[];
    recenterTrigger?: number;
    isFullscreen?: boolean;
    mapStyle?: 'standard' | 'satellite';
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
            </MapView>
        </View>
    );
}
