import React from 'react';
import { View, Text, Pressable, Modal, StyleSheet, Dimensions, Platform } from 'react-native';
import * as Location from 'expo-location';
import { useTheme } from '../theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HeaderOverlay } from './HeaderOverlay';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import React_useState from 'react';

interface LocationData {
    latitude: number;
    longitude: number;
    city: string;
    country: string;
}

interface LocationPickerProps {
    visible: boolean;
    onClose: () => void;
    onSelect: (location: LocationData) => void;
    initialLocation?: LocationData | null;
}

// Web fallback — simple text input for location
export function LocationPicker({ visible, onClose, onSelect, initialLocation }: LocationPickerProps) {
    const { colors, spacing, typography, radius, elevation } = useTheme();
    const insets = useSafeAreaInsets();
    const [city, setCity] = React.useState(initialLocation?.city || '');
    const [country, setCountry] = React.useState(initialLocation?.country || '');

    if (!visible) return null;

    return (
        <Modal animationType="slide" visible={visible} onRequestClose={onClose}>
            <View style={{ flex: 1, backgroundColor: colors.background.primary, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
                <HeaderOverlay
                    leftAction={{ icon: 'close', onPress: onClose }}
                    title="Pick Location"
                />
                <Text style={{ ...typography.headingSmall, color: colors.text.primary, marginBottom: 20, marginTop: 80 }}>
                    Map is only available on mobile
                </Text>
                <Text style={{ color: colors.text.secondary }}>
                    Use the mobile app to pick a location on the map.
                </Text>
                <Pressable
                    style={{
                        marginTop: 30, height: 50, borderRadius: 12,
                        alignItems: 'center', justifyContent: 'center',
                        backgroundColor: colors.accent.primary, paddingHorizontal: 30
                    }}
                    onPress={onClose}
                >
                    <Text style={{ ...typography.label, color: colors.text.inverted }}>CLOSE</Text>
                </Pressable>
            </View>
        </Modal>
    );
}
