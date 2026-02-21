import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Pressable, Modal, Dimensions } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { useTheme } from '../theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HeaderOverlay } from './HeaderOverlay';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { Platform } from 'react-native';

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

const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

export function LocationPicker({ visible, onClose, onSelect, initialLocation }: LocationPickerProps) {
    const { colors, spacing } = useTheme();
    const insets = useSafeAreaInsets();

    // Default to a neutral location (e.g., center of map or user location)
    const [region, setRegion] = useState<Region>({
        latitude: initialLocation?.latitude || 37.78825,
        longitude: initialLocation?.longitude || -122.4324,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
    });

    const [selectedCoord, setSelectedCoord] = useState<{ latitude: number; longitude: number } | null>(
        initialLocation ? { latitude: initialLocation.latitude, longitude: initialLocation.longitude } : null
    );

    const [locationName, setLocationName] = useState<string>('');
    const [isLoadingAddress, setIsLoadingAddress] = useState(false);
    const [permissionDenied, setPermissionDenied] = useState(false);

    useEffect(() => {
        if (!visible) {
            return;
        }

        let mounted = true;

        const initializePicker = async () => {
            if (initialLocation) {
                setSelectedCoord({
                    latitude: initialLocation.latitude,
                    longitude: initialLocation.longitude,
                });
                setLocationName(`${initialLocation.city}, ${initialLocation.country}`);
                setRegion({
                    latitude: initialLocation.latitude,
                    longitude: initialLocation.longitude,
                    latitudeDelta: LATITUDE_DELTA,
                    longitudeDelta: LONGITUDE_DELTA,
                });
                setPermissionDenied(false);
                return;
            }

            setSelectedCoord(null);
            setLocationName('');

            const permission = await Location.requestForegroundPermissionsAsync();
            if (!mounted) {
                return;
            }

            if (permission.status !== 'granted') {
                setPermissionDenied(true);
                return;
            }

            setPermissionDenied(false);

            try {
                const current = await Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.Balanced,
                });

                if (!mounted) {
                    return;
                }

                setRegion({
                    latitude: current.coords.latitude,
                    longitude: current.coords.longitude,
                    latitudeDelta: LATITUDE_DELTA,
                    longitudeDelta: LONGITUDE_DELTA,
                });
            } catch {
                setPermissionDenied(true);
            }
        };

        initializePicker();

        return () => {
            mounted = false;
        };
    }, [visible, initialLocation]);

    const handleMapPress = async (e: any) => {
        const coordinate = e.nativeEvent.coordinate;
        setSelectedCoord(coordinate);
        fetchAddress(coordinate.latitude, coordinate.longitude);
    };

    const fetchAddress = async (latitude: number, longitude: number) => {
        setIsLoadingAddress(true);
        try {
            const result = await Location.reverseGeocodeAsync({ latitude, longitude });
            if (result.length > 0) {
                const address = result[0];
                const city = address.city || address.subregion || address.district || '';
                const country = address.country || '';
                const name = [city, country].filter(Boolean).join(', ');
                setLocationName(name);
            }
        } catch (error) {
            console.warn('Reverse geocoding failed', error);
            setLocationName('Unknown Location');
        } finally {
            setIsLoadingAddress(false);
        }
    };

    const handleConfirm = () => {
        if (selectedCoord) {
            const [city, country] = locationName.split(', ').map(s => s.trim());
            onSelect({
                latitude: selectedCoord.latitude,
                longitude: selectedCoord.longitude,
                city: city || 'Unknown City',
                country: country || 'Unknown Country',
            });
            onClose();
        }
    };

    if (!visible) return null;

    return (
        <Modal animationType="slide" visible={visible} onRequestClose={onClose}>
            <View style={styles.container}>
                <MapView
                    style={styles.map}
                    provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : PROVIDER_DEFAULT}
                    region={region}
                    onRegionChangeComplete={setRegion}
                    onPress={handleMapPress}
                    showsUserLocation
                    showsMyLocationButton
                >
                    {selectedCoord && (
                        <Marker coordinate={selectedCoord} />
                    )}
                </MapView>

                <HeaderOverlay
                    leftAction={{ icon: 'close', onPress: onClose }}
                    title="Pick Location"
                />

                {permissionDenied && !selectedCoord && (
                    <View style={styles.permissionBanner}>
                        <Text style={[styles.permissionText, { color: colors.text.primary }]}>Location permission is off. Move the map and tap to pick manually.</Text>
                    </View>
                )}

                {/* Bottom Sheet for Selection */}
                {selectedCoord && (
                    <Animated.View
                        entering={FadeIn.duration(300)}
                        exiting={FadeOut.duration(300)}
                        style={[styles.bottomSheet, { paddingBottom: insets.bottom + spacing.component.md }]}
                    >
                        <View style={styles.locationInfo}>
                            <Text style={[styles.locationLabel, { color: colors.text.secondary }]}>
                                SELECTED LOCATION
                            </Text>
                            <Text style={[styles.locationName, { color: colors.text.primary }]}>
                                {isLoadingAddress ? 'Loading...' : locationName || 'Selected Location'}
                            </Text>
                        </View>

                        <Pressable
                            style={[styles.confirmButton, { backgroundColor: colors.accent.primary }]}
                            onPress={handleConfirm}
                            disabled={isLoadingAddress}
                        >
                            <Text style={[styles.confirmButtonText, { color: colors.text.inverted }]}>
                                CONFIRM LOCATION
                            </Text>
                        </Pressable>
                    </Animated.View>
                )}
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    map: {
        width: '100%',
        height: '100%',
    },
    bottomSheet: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(20, 20, 20, 0.95)',
        paddingTop: 24,
        paddingHorizontal: 24,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    permissionBanner: {
        position: 'absolute',
        top: 110,
        left: 16,
        right: 16,
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 10,
        backgroundColor: 'rgba(0,0,0,0.7)',
    },
    permissionText: {
        fontSize: 13,
        fontWeight: '500',
        textAlign: 'center',
    },
    locationInfo: {
        marginBottom: 24,
    },
    locationLabel: {
        fontSize: 12,
        fontWeight: '600',
        letterSpacing: 1,
        marginBottom: 8,
        textTransform: 'uppercase',
    },
    locationName: {
        fontSize: 20,
        fontWeight: '500',
    },
    confirmButton: {
        height: 56,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    confirmButtonText: {
        fontSize: 14,
        fontWeight: '600',
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
});
