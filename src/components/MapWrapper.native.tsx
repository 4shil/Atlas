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
}

export default function MapWrapper({ goals, recenterTrigger = 0 }: MapWrapperProps) {
    const router = useRouter();
    const mapRef = React.useRef<MapView | null>(null);
    const goalsWithCoords = goals.filter(
        g => g.location.latitude !== 0 || g.location.longitude !== 0
    );

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
                    onPress={() =>
                        router.push({ pathname: '/goal-detail', params: { id: goal.id } })
                    }
                >
                    {/* Pin */}
                    <View
                        style={{
                            alignItems: 'center',
                        }}
                    >
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
                                name={
                                    goal.category === 'Foodie'
                                        ? 'restaurant'
                                        : goal.category === 'Stays'
                                          ? 'hotel'
                                          : goal.category === 'Travel'
                                            ? 'flight'
                                            : goal.category === 'Milestone'
                                              ? 'star'
                                              : 'hiking'
                                }
                                size={20}
                                color={goal.completed ? '#4ade80' : '#60a5fa'}
                            />
                        </View>
                        {/* Pin label */}
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
            ))}
        </MapView>
    );
}
