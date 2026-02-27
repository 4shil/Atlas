import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import { MaterialIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import type { Goal } from '../store/useGoalStore';
import { useRouter } from 'expo-router';

interface MapWrapperProps {
    goals: Goal[];
    recenterTrigger?: number;
}

export default function MapWrapper({ goals, recenterTrigger = 0 }: MapWrapperProps) {
    const router = useRouter();
    const mapRef = React.useRef<MapView | null>(null);
    const goalsWithCoords = goals.filter(g => g.location.latitude !== 0 || g.location.longitude !== 0);

    React.useEffect(() => {
        if (recenterTrigger === 0) return;

        const recenter = async () => {
            try {
                const { status } = await Location.requestForegroundPermissionsAsync();

                if (status === 'granted') {
                    const position = await Location.getCurrentPositionAsync({});
                    mapRef.current?.animateToRegion({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        latitudeDelta: 8,
                        longitudeDelta: 8,
                    }, 500);
                    return;
                }
            } catch {
            }

            if (goalsWithCoords.length > 0) {
                mapRef.current?.animateToRegion({
                    latitude: goalsWithCoords[0].location.latitude,
                    longitude: goalsWithCoords[0].location.longitude,
                    latitudeDelta: 20,
                    longitudeDelta: 20,
                }, 500);
            }
        };

        recenter();
    }, [recenterTrigger, goalsWithCoords]);

    return (
        <MapView
            ref={mapRef}
            style={StyleSheet.absoluteFillObject}
            initialRegion={{
                latitude: goalsWithCoords.length > 0 ? goalsWithCoords[0].location.latitude : 20,
                longitude: goalsWithCoords.length > 0 ? goalsWithCoords[0].location.longitude : 0,
                latitudeDelta: 80,
                longitudeDelta: 80,
            }}
            userInterfaceStyle="dark"
        >
            {goalsWithCoords.map(goal => (
                <Marker
                    key={goal.id}
                    coordinate={{
                        latitude: goal.location.latitude,
                        longitude: goal.location.longitude,
                    }}
                    title={goal.title}
                    description={goal.location.city ? `${goal.location.city}, ${goal.location.country}` : goal.location.country}
                    onCalloutPress={() => router.push({ pathname: '/goal-detail', params: { id: goal.id } })}
                >
                    <View style={{
                        width: 40, height: 40, borderRadius: 20,
                        alignItems: 'center', justifyContent: 'center',
                        borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
                        backgroundColor: goal.completed ? 'rgba(22,101,52,0.7)' : 'rgba(17,17,17,0.9)',
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.5,
                        shadowRadius: 6,
                        elevation: 8,
                    }}>
                        <MaterialIcons
                            name={
                                goal.category === 'Foodie' ? 'restaurant' :
                                    goal.category === 'Stays' ? 'hotel' :
                                        goal.category === 'Travel' ? 'flight' :
                                            goal.category === 'Milestone' ? 'star' :
                                                'hiking'
                            }
                            size={18}
                            color={goal.completed ? '#4ade80' : 'white'}
                        />
                    </View>
                </Marker>
            ))}
        </MapView>
    );
}
