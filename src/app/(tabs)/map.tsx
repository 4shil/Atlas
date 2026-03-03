import React from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import { useGoalStore, Goal } from '../../store/useGoalStore';
import MapWrapper from '../../components/MapWrapper';
import { useRouter } from 'expo-router';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { useSettingsStore } from '../../store/useSettingsStore';
import { formatTemperature } from '../../utils/unitUtils';

interface WeatherData {
    temp: string; // raw celsius as string from API
    desc: string;
}

export default function DarkAdventureMap() {
    const { goals } = useGoalStore();
    const router = useRouter();
    const [showOnlyPending, setShowOnlyPending] = React.useState(true);
    const [recenterTrigger, setRecenterTrigger] = React.useState(0);
    const [currentCity, setCurrentCity] = React.useState<string | null>(null);
    const [weather, setWeather] = React.useState<WeatherData | null>(null);
    const unitSystem = useSettingsStore(s => s.unitSystem);

    // Fetch user location + weather on mount
    React.useEffect(() => {
        (async () => {
            try {
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') return;

                const loc = await Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.Balanced,
                });
                const { latitude, longitude } = loc.coords;

                // Reverse geocode for city name
                const [place] = await Location.reverseGeocodeAsync({ latitude, longitude });
                if (place) {
                    setCurrentCity(
                        `${place.city ?? place.region ?? 'Unknown'}, ${place.country ?? ''}`
                    );
                }

                // Live weather from wttr.in (free, no API key)
                const res = await fetch(
                    `https://wttr.in/?format=j1&lat=${latitude}&lon=${longitude}`
                );
                if (res.ok) {
                    const data = await res.json();
                    const current = data?.current_condition?.[0];
                    if (current) {
                        setWeather({
                            temp: `${current.temp_C}°C`,
                            desc: current.weatherDesc?.[0]?.value ?? '',
                        });
                    }
                }
            } catch (_) {
                // Location/weather unavailable — fail silently
            }
        })();
    }, []);

    const [categoryFilter, setCategoryFilter] = React.useState<string>('All');

    const CATEGORIES = ['All', 'Travel', 'Adventure', 'Fitness', 'Learning', 'Life'];

    const visibleGoals = React.useMemo(() => {
        let filtered = showOnlyPending ? goals.filter(g => !g.completed) : goals;
        if (categoryFilter !== 'All') {
            filtered = filtered.filter(g => g.category === categoryFilter);
        }
        return filtered;
    }, [goals, showOnlyPending, categoryFilter]);

    return (
        <ScreenWrapper bgClass="bg-black dark:bg-black bg-slate-50" edges={[]}>
            {/* Top Map Area 60% */}
            <View className="relative h-[60%] w-full bg-[#050505] z-10 overflow-hidden">
                <LinearGradient
                    colors={['rgba(0,0,0,0.8)', 'transparent', 'rgba(0,0,0,0.9)']}
                    className="absolute inset-0 pointer-events-none z-10"
                />
                <View className="absolute inset-0 bg-blue-900/10 pointer-events-none z-10" />

                {/* Top Floating Buttons */}
                <View className="absolute top-0 left-0 right-0 pt-16 px-6 flex-row justify-between items-start z-30 pointer-events-box-none">
                    <TouchableOpacity
                        className="w-10 h-10 rounded-full dark:bg-white/10 bg-black/10 items-center justify-center border dark:border-white/[0.08] border-black/[0.08]"
                        activeOpacity={0.7}
                        onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            if (router.canGoBack()) {
                                router.back();
                            } else {
                                router.push('/(tabs)');
                            }
                        }}
                        accessibilityRole="button"
                        accessibilityLabel="Go back"
                    >
                        <MaterialIcons name="arrow-back" size={20} color="white" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        className="w-10 h-10 rounded-full dark:bg-white/10 bg-black/10 items-center justify-center border dark:border-white/[0.08] border-black/[0.08]"
                        activeOpacity={0.7}
                        onPress={() => {
                            Haptics.selectionAsync();
                            setShowOnlyPending(prev => !prev);
                        }}
                        accessibilityRole="button"
                        accessibilityLabel="Filter map"
                    >
                        <MaterialIcons
                            name={showOnlyPending ? 'tune' : 'filter-alt-off'}
                            size={20}
                            color="white"
                        />
                    </TouchableOpacity>
                </View>

                <MapWrapper goals={visibleGoals} recenterTrigger={recenterTrigger} />
            </View>

            {/* Bottom Sheet 48% */}
            <View className="relative flex-1 -mt-10 w-full z-20 rounded-t-[32px] bg-black/70 border-t dark:border-white/[0.08] border-black/[0.08] overflow-hidden flex-col">
                <View className="w-full items-center pt-4 pb-2">
                    <View className="w-10 h-1 bg-white/20 rounded-full" />
                </View>

                <ScrollView
                    className="flex-1 px-6 pb-8 pt-2"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 40 }}
                >
                    {/* Current Location */}
                    <View className="mb-8">
                        <Text className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-3">
                            Currently In
                        </Text>
                        <View className="flex-row items-center justify-between">
                            <View>
                                <Text className="text-3xl font-bold text-white tracking-tight">
                                    {currentCity ?? 'Locating...'}
                                </Text>
                                <View className="flex-row items-center mt-2 space-x-2">
                                    <MaterialIcons name="cloud" size={18} color="#60a5fa" />
                                    <Text className="text-sm font-medium text-blue-400 ml-2">
                                        {weather
                                            ? `${formatTemperature(parseInt(weather.temp), unitSystem)} • ${weather.desc}`
                                            : '—'}
                                    </Text>
                                </View>
                            </View>
                            <TouchableOpacity
                                className="w-12 h-12 rounded-full dark:bg-white/10 bg-black/10 border dark:border-white/[0.08] border-black/[0.08] items-center justify-center"
                                activeOpacity={0.7}
                                onPress={() => {
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                    setRecenterTrigger(prev => prev + 1);
                                }}
                                accessibilityRole="button"
                                accessibilityLabel="Recenter map"
                            >
                                <MaterialIcons name="my-location" size={20} color="#60a5fa" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Category Filter Pills */}
                    <View className="mb-6">
                        <Text className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-3">
                            Filter by Category
                        </Text>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ gap: 8 }}
                        >
                            {CATEGORIES.map(cat => (
                                <TouchableOpacity
                                    key={cat}
                                    onPress={() => {
                                        Haptics.selectionAsync();
                                        setCategoryFilter(cat);
                                    }}
                                    style={{
                                        paddingHorizontal: 14,
                                        paddingVertical: 7,
                                        borderRadius: 20,
                                        backgroundColor:
                                            categoryFilter === cat
                                                ? 'rgba(96,165,250,0.2)'
                                                : 'rgba(255,255,255,0.06)',
                                        borderWidth: 1,
                                        borderColor:
                                            categoryFilter === cat
                                                ? 'rgba(96,165,250,0.5)'
                                                : 'rgba(255,255,255,0.08)',
                                    }}
                                >
                                    <Text
                                        style={{
                                            color:
                                                categoryFilter === cat
                                                    ? '#60a5fa'
                                                    : 'rgba(255,255,255,0.5)',
                                            fontSize: 12,
                                            fontWeight: '600',
                                        }}
                                    >
                                        {cat}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    {/* Next Goals */}
                    <View>
                        <View className="flex-row justify-between items-end mb-5">
                            <Text className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">
                                Next Goals
                            </Text>
                            <TouchableOpacity
                                activeOpacity={0.7}
                                onPress={() => {
                                    Haptics.selectionAsync();
                                    router.push('/(tabs)/archive');
                                }}
                                accessibilityRole="button"
                                accessibilityLabel="See all goals"
                            >
                                <Text className="text-xs text-blue-400 font-semibold">See all</Text>
                            </TouchableOpacity>
                        </View>

                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            className="overflow-visible pb-4"
                            contentContainerStyle={{ paddingRight: 16 }}
                        >
                            {visibleGoals.length === 0 ? (
                                <Text className="text-gray-500">
                                    No goals to show for this filter.
                                </Text>
                            ) : (
                                visibleGoals.slice(0, 5).map((goal: Goal) => (
                                    <View
                                        key={goal.id}
                                        className="w-[260px] h-[170px] relative rounded-3xl overflow-hidden mr-4 border dark:border-white/10 border-black/10"
                                    >
                                        <Image
                                            source={{ uri: goal.image }}
                                            className="absolute inset-0 w-full h-full opacity-60"
                                            resizeMode="cover"
                                        />
                                        <LinearGradient
                                            colors={[
                                                'transparent',
                                                'rgba(0,0,0,0.4)',
                                                'rgba(0,0,0,1)',
                                            ]}
                                            className="absolute inset-0"
                                        />

                                        <View className="absolute inset-0 p-5 flex-col justify-between">
                                            <View className="self-end hidden">
                                                <View className="w-8 h-8 rounded-full dark:bg-white/10 bg-black/10 border border-white/20 items-center justify-center">
                                                    <MaterialIcons
                                                        name="bookmark-border"
                                                        size={16}
                                                        color="white"
                                                    />
                                                </View>
                                            </View>
                                            <View className="flex-1 justify-end flex-row items-end">
                                                <View className="flex-1">
                                                    <Text
                                                        className="text-white dark:text-white font-bold text-xl leading-tight mb-1"
                                                        numberOfLines={1}
                                                    >
                                                        {goal.title}
                                                    </Text>
                                                    <View className="flex-row items-center">
                                                        <MaterialIcons
                                                            name="near-me"
                                                            size={14}
                                                            color="#3b82f6"
                                                        />
                                                        <Text className="text-gray-400 text-xs font-medium ml-1">
                                                            {goal.location.city},{' '}
                                                            {goal.location.country}
                                                        </Text>
                                                    </View>
                                                </View>
                                                <TouchableOpacity
                                                    className="w-10 h-10 rounded-full bg-blue-600 items-center justify-center shadow-lg shadow-blue-900/40"
                                                    onPress={() => {
                                                        Haptics.selectionAsync();
                                                        router.push({
                                                            pathname: '/goal-detail',
                                                            params: { id: goal.id },
                                                        });
                                                    }}
                                                >
                                                    <MaterialIcons
                                                        name="arrow-forward"
                                                        size={20}
                                                        color="white"
                                                    />
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    </View>
                                ))
                            )}
                        </ScrollView>
                    </View>
                </ScrollView>
            </View>
        </ScreenWrapper>
    );
}
