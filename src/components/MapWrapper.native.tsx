import React from 'react';
import { View, StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { MaterialIcons } from '@expo/vector-icons';
import type { Goal } from '../store/useGoalStore';

interface MapWrapperProps {
    goals: Goal[];
}

export default function MapWrapper({ goals }: MapWrapperProps) {
    const goalsWithCoords = goals.filter(g => g.location.latitude !== 0 || g.location.longitude !== 0);

    return (
        <MapView
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
                    description={`${goal.location.city}, ${goal.location.country}`}
                >
                    <View style={{
                        width: 40, height: 40, borderRadius: 20,
                        alignItems: 'center', justifyContent: 'center',
                        borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
                        backgroundColor: goal.completed ? 'rgba(22,101,52,0.6)' : '#111',
                    }}>
                        <MaterialIcons
                            name={goal.category === 'Foodie' ? 'restaurant' : goal.category === 'Stays' ? 'hotel' : goal.category === 'Travel' ? 'flight' : 'hiking'}
                            size={18}
                            color={goal.completed ? '#4ade80' : 'white'}
                        />
                    </View>
                </Marker>
            ))}
        </MapView>
    );
}
