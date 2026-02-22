import React from 'react';
import { View, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import type { Goal } from '../../store/useGoalStore';

interface MapWrapperProps {
    goals: Goal[];
}

export default function MapWrapper({ goals }: MapWrapperProps) {
    return (
        <View style={{ flex: 1, backgroundColor: '#0f0f13', alignItems: 'center', justifyContent: 'center' }}>
            <MaterialIcons name="map" size={48} color="#333" />
            <Text style={{ color: '#6b7280', marginTop: 16, fontSize: 14 }}>Map view is only available on mobile</Text>
        </View>
    );
}
