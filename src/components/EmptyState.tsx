import React from 'react';
import { View, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface EmptyStateProps {
    icon?: string;
    title?: string;
    subtitle?: string;
}

export function EmptyState({
    icon = 'explore',
    title = 'No dreams yet',
    subtitle = 'Add your first adventure!',
}: EmptyStateProps) {
    return (
        <View style={{ alignItems: 'center', paddingVertical: 48 }}>
            <MaterialIcons name={icon as any} size={52} color="rgba(255,255,255,0.12)" />
            <Text
                style={{
                    color: 'rgba(255,255,255,0.35)',
                    fontSize: 16,
                    fontWeight: '600',
                    marginTop: 12,
                }}
            >
                {title}
            </Text>
            <Text
                style={{
                    color: 'rgba(255,255,255,0.2)',
                    fontSize: 13,
                    marginTop: 6,
                    textAlign: 'center',
                }}
            >
                {subtitle}
            </Text>
        </View>
    );
}
