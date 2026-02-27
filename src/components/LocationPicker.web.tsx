import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, Modal, StyleSheet } from 'react-native';
import { useTheme } from '../theme';
import { HeaderOverlay } from './HeaderOverlay';

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

// Web fallback — text inputs for city and country since native maps aren't available
export function LocationPicker({ visible, onClose, onSelect, initialLocation }: LocationPickerProps) {
    const { colors, typography, radius } = useTheme();
    const [city, setCity] = useState(initialLocation?.city || '');
    const [country, setCountry] = useState(initialLocation?.country || '');

    const handleConfirm = () => {
        if (!city.trim() && !country.trim()) {
            onClose();
            return;
        }
        onSelect({
            latitude: initialLocation?.latitude || 0,
            longitude: initialLocation?.longitude || 0,
            city: city.trim() || 'Unknown City',
            country: country.trim() || 'Unknown Country',
        });
        onClose();
    };

    if (!visible) return null;

    return (
        <Modal animationType="slide" visible={visible} onRequestClose={onClose}>
            <View style={{ flex: 1, backgroundColor: colors.background.primary, padding: 20 }}>
                <HeaderOverlay
                    leftAction={{ icon: 'close', onPress: onClose }}
                    title="Pick Location"
                />

                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 }}>
                    <Text style={{ ...typography.headingSmall, color: colors.text.primary, marginBottom: 8, textAlign: 'center' }}>
                        Enter Location
                    </Text>
                    <Text style={{ color: colors.text.secondary, marginBottom: 30, textAlign: 'center', fontSize: 14 }}>
                        Map selection is available on mobile. Enter your location manually below.
                    </Text>

                    <View style={{ width: '100%', maxWidth: 400, marginBottom: 16 }}>
                        <Text style={{ color: colors.text.secondary, fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
                            City
                        </Text>
                        <TextInput
                            value={city}
                            onChangeText={setCity}
                            placeholder="e.g. Paris"
                            placeholderTextColor={colors.text.muted}
                            style={{
                                backgroundColor: colors.background.secondary,
                                color: colors.text.primary,
                                borderRadius: radius.medium,
                                paddingHorizontal: 16,
                                paddingVertical: 14,
                                fontSize: 16,
                                borderWidth: StyleSheet.hairlineWidth,
                                borderColor: colors.border.subtle,
                            }}
                        />
                    </View>

                    <View style={{ width: '100%', maxWidth: 400, marginBottom: 30 }}>
                        <Text style={{ color: colors.text.secondary, fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
                            Country
                        </Text>
                        <TextInput
                            value={country}
                            onChangeText={setCountry}
                            placeholder="e.g. France"
                            placeholderTextColor={colors.text.muted}
                            style={{
                                backgroundColor: colors.background.secondary,
                                color: colors.text.primary,
                                borderRadius: radius.medium,
                                paddingHorizontal: 16,
                                paddingVertical: 14,
                                fontSize: 16,
                                borderWidth: StyleSheet.hairlineWidth,
                                borderColor: colors.border.subtle,
                            }}
                        />
                    </View>

                    <Pressable
                        style={{
                            width: '100%',
                            maxWidth: 400,
                            height: 50,
                            borderRadius: radius.medium,
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: (city.trim() || country.trim()) ? colors.accent.primary : colors.background.tertiary,
                        }}
                        onPress={handleConfirm}
                    >
                        <Text style={{
                            ...typography.label,
                            color: (city.trim() || country.trim()) ? colors.text.inverted : colors.text.muted,
                        }}>
                            {(city.trim() || country.trim()) ? 'CONFIRM LOCATION' : 'CLOSE'}
                        </Text>
                    </Pressable>
                </View>
            </View>
        </Modal>
    );
}
