import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
    StyleSheet,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface LocationResult {
    latitude: number;
    longitude: number;
    city: string;
    country: string;
}

interface LocationPickerWebProps {
    onLocationSelected: (location: LocationResult) => void;
}

interface NominatimResult {
    lat: string;
    lon: string;
    display_name: string;
    address?: {
        city?: string;
        town?: string;
        village?: string;
        county?: string;
        country?: string;
    };
}

export default function LocationPickerWeb({ onLocationSelected }: LocationPickerWebProps) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<NominatimResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const search = async () => {
        if (!query.trim()) return;
        setLoading(true);
        setError(null);
        try {
            const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&addressdetails=1`;
            const res = await fetch(url, {
                headers: { 'Accept-Language': 'en', 'User-Agent': 'Atlas-App/1.0' },
            });
            if (!res.ok) throw new Error('Search failed');
            const data: NominatimResult[] = await res.json();
            setResults(data);
            if (data.length === 0) setError('No results found. Try a different search.');
        } catch {
            setError('Could not search. Please check your connection and try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = (item: NominatimResult) => {
        const addr = item.address ?? {};
        const city = addr.city ?? addr.town ?? addr.village ?? addr.county ?? '';
        const country = addr.country ?? '';
        onLocationSelected({
            latitude: parseFloat(item.lat),
            longitude: parseFloat(item.lon),
            city,
            country,
        });
        setResults([]);
        setQuery('');
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>Search Location</Text>
            <View style={styles.row}>
                <TextInput
                    style={styles.input}
                    placeholder="City, country or place name..."
                    placeholderTextColor="rgba(255,255,255,0.3)"
                    value={query}
                    onChangeText={setQuery}
                    onSubmitEditing={search}
                    returnKeyType="search"
                    autoCorrect={false}
                />
                <TouchableOpacity style={styles.searchBtn} onPress={search}>
                    {loading ? (
                        <ActivityIndicator size="small" color="white" />
                    ) : (
                        <MaterialIcons name="search" size={22} color="white" />
                    )}
                </TouchableOpacity>
            </View>

            {error && <Text style={styles.error}>{error}</Text>}

            {results.length > 0 && (
                <FlatList
                    data={results}
                    keyExtractor={(_, i) => String(i)}
                    style={styles.list}
                    renderItem={({ item }) => {
                        const addr = item.address ?? {};
                        const city = addr.city ?? addr.town ?? addr.village ?? addr.county ?? '';
                        const country = addr.country ?? '';
                        return (
                            <TouchableOpacity
                                style={styles.resultItem}
                                onPress={() => handleSelect(item)}
                            >
                                <MaterialIcons
                                    name="place"
                                    size={16}
                                    color="#60a5fa"
                                    style={{ marginRight: 8 }}
                                />
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.resultCity} numberOfLines={1}>
                                        {city || item.display_name.split(',')[0]}
                                    </Text>
                                    <Text style={styles.resultCountry} numberOfLines={1}>
                                        {country}
                                    </Text>
                                </View>
                                <MaterialIcons
                                    name="chevron-right"
                                    size={16}
                                    color="rgba(255,255,255,0.3)"
                                />
                            </TouchableOpacity>
                        );
                    }}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
        backgroundColor: 'rgba(255,255,255,0.04)',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    label: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 11,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 10,
    },
    row: {
        flexDirection: 'row',
        gap: 8,
    },
    input: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.07)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 10,
        color: 'white',
        fontSize: 14,
    },
    searchBtn: {
        width: 44,
        height: 44,
        backgroundColor: '#3b82f6',
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    error: {
        color: '#f87171',
        fontSize: 12,
        marginTop: 8,
    },
    list: {
        marginTop: 12,
        maxHeight: 220,
    },
    resultItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 12,
        backgroundColor: 'rgba(255,255,255,0.04)',
        borderRadius: 10,
        marginBottom: 6,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.07)',
    },
    resultCity: {
        color: 'white',
        fontSize: 13,
        fontWeight: '600',
    },
    resultCountry: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 11,
        marginTop: 1,
    },
});
