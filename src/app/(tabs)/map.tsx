import React from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, Dimensions } from 'react-native';
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
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    interpolate,
    runOnJS,
} from 'react-native-reanimated';
import {
    PanGestureHandler,
    GestureHandlerRootView,
    Gesture,
    GestureDetector,
} from 'react-native-gesture-handler';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// Map panel heights
const MAP_COLLAPSED_HEIGHT = SCREEN_HEIGHT * 0.6;
const MAP_EXPANDED_HEIGHT = SCREEN_HEIGHT;
const SNAP_THRESHOLD = 80;

interface WeatherData {
    temp: string;
    desc: string;
}

export default function DarkAdventureMap() {
    const { goals } = useGoalStore();
    const router = useRouter();
    const [showOnlyPending, setShowOnlyPending] = React.useState(true);
    const [recenterTrigger, setRecenterTrigger] = React.useState(0);
    const [currentCity, setCurrentCity] = React.useState<string | null>(null);
    const [weather, setWeather] = React.useState<WeatherData | null>(null);
    const [isExpanded, setIsExpanded] = React.useState(false);
    const unitSystem = useSettingsStore(s => s.unitSystem);

    // Animated map height
    const mapHeight = useSharedValue(MAP_COLLAPSED_HEIGHT);
    const startHeight = useSharedValue(MAP_COLLAPSED_HEIGHT);

    const expandMap = React.useCallback(() => {
        mapHeight.value = withSpring(MAP_EXPANDED_HEIGHT, { damping: 20, stiffness: 200 });
        setIsExpanded(true);
    }, [mapHeight]);

    const collapseMap = React.useCallback(() => {
        mapHeight.value = withSpring(MAP_COLLAPSED_HEIGHT, { damping: 20, stiffness: 200 });
        setIsExpanded(false);
    }, [mapHeight]);

    // Pan gesture for drag handle
    const panGesture = Gesture.Pan()
        .onBegin(() => {
            startHeight.value = mapHeight.value;
        })
        .onUpdate(e => {
            const newHeight = startHeight.value + e.translationY;
            mapHeight.value = Math.max(
                MAP_COLLAPSED_HEIGHT,
                Math.min(MAP_EXPANDED_HEIGHT, newHeight)
            );
        })
        .onEnd(e => {
            const current = mapHeight.value;
            const mid = (MAP_COLLAPSED_HEIGHT + MAP_EXPANDED_HEIGHT) / 2;
            if (e.translationY < -SNAP_THRESHOLD || current > mid) {
                // Expand
                mapHeight.value = withSpring(MAP_EXPANDED_HEIGHT, { damping: 20, stiffness: 200 });
                runOnJS(setIsExpanded)(true);
            } else {
                // Collapse
                mapHeight.value = withSpring(MAP_COLLAPSED_HEIGHT, { damping: 20, stiffness: 200 });
                runOnJS(setIsExpanded)(false);
            }
        });

    const mapAnimatedStyle = useAnimatedStyle(() => ({
        height: mapHeight.value,
    }));

    // Sheet opacity: hide when map expanded
    const sheetOpacity = useAnimatedStyle(() => ({
        opacity: interpolate(
            mapHeight.value,
            [MAP_COLLAPSED_HEIGHT, MAP_COLLAPSED_HEIGHT + 100],
            [1, 0]
        ),
        pointerEvents: isExpanded ? 'none' : 'auto',
    }));

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
                const [place] = await Location.reverseGeocodeAsync({ latitude, longitude });
                if (place) {
                    setCurrentCity(
                        `${place.city ?? place.region ?? 'Unknown'}, ${place.country ?? ''}`
                    );
                }
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
            } catch (_) {}
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
            {/* Animated Map Panel */}
            <Animated.View
                style={[{ width: '100%', zIndex: 10, overflow: 'hidden' }, mapAnimatedStyle]}
            >
                <LinearGradient
                    colors={['rgba(0,0,0,0.8)', 'transparent', 'rgba(0,0,0,0.9)']}
                    style={
                        { position: 'absolute', inset: 0, zIndex: 10, pointerEvents: 'none' } as any
                    }
                />
                <View
                    style={
                        {
                            position: 'absolute',
                            inset: 0,
                            backgroundColor: 'rgba(0,30,80,0.1)',
                            zIndex: 10,
                            pointerEvents: 'none',
                        } as any
                    }
                />

                {/* Top Buttons */}
                <View
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        paddingTop: 56,
                        paddingHorizontal: 24,
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        zIndex: 30,
                    }}
                >
                    <TouchableOpacity
                        style={{
                            width: 40,
                            height: 40,
                            borderRadius: 20,
                            backgroundColor: 'rgba(255,255,255,0.1)',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderWidth: 1,
                            borderColor: 'rgba(255,255,255,0.08)',
                        }}
                        activeOpacity={0.7}
                        onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            if (router.canGoBack()) router.back();
                            else router.push('/(tabs)');
                        }}
                    >
                        <MaterialIcons name="arrow-back" size={20} color="white" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={{
                            width: 40,
                            height: 40,
                            borderRadius: 20,
                            backgroundColor: 'rgba(255,255,255,0.1)',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderWidth: 1,
                            borderColor: 'rgba(255,255,255,0.08)',
                        }}
                        activeOpacity={0.7}
                        onPress={() => {
                            Haptics.selectionAsync();
                            setShowOnlyPending(prev => !prev);
                        }}
                    >
                        <MaterialIcons
                            name={showOnlyPending ? 'tune' : 'filter-alt-off'}
                            size={20}
                            color="white"
                        />
                    </TouchableOpacity>
                </View>

                <MapWrapper
                    goals={visibleGoals}
                    recenterTrigger={recenterTrigger}
                    isFullscreen={isExpanded}
                />

                {/* Drag Handle — sits at bottom of map panel */}
                <GestureDetector gesture={panGesture}>
                    <View
                        style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            height: 36,
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 40,
                        }}
                        onTouchEnd={() => {
                            if (!isExpanded) expandMap();
                            else collapseMap();
                        }}
                    >
                        <View
                            style={{
                                width: 40,
                                height: 4,
                                borderRadius: 2,
                                backgroundColor: 'rgba(255,255,255,0.35)',
                            }}
                        />
                    </View>
                </GestureDetector>

                {/* Collapse button when expanded */}
                {isExpanded && (
                    <TouchableOpacity
                        style={{
                            position: 'absolute',
                            bottom: 48,
                            alignSelf: 'center',
                            left: '50%',
                            marginLeft: -56,
                            zIndex: 50,
                            flexDirection: 'row',
                            alignItems: 'center',
                            backgroundColor: 'rgba(0,0,0,0.75)',
                            borderRadius: 24,
                            paddingHorizontal: 20,
                            paddingVertical: 10,
                            borderWidth: 1,
                            borderColor: 'rgba(255,255,255,0.15)',
                            gap: 6,
                        }}
                        onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                            collapseMap();
                        }}
                    >
                        <MaterialIcons name="keyboard-arrow-down" size={20} color="white" />
                        <Text style={{ color: 'white', fontSize: 13, fontWeight: '600' }}>
                            Collapse
                        </Text>
                    </TouchableOpacity>
                )}
            </Animated.View>

            {/* Bottom Sheet */}
            <Animated.View
                style={[
                    {
                        flex: 1,
                        marginTop: -10,
                        zIndex: 20,
                        borderTopLeftRadius: 32,
                        borderTopRightRadius: 32,
                        backgroundColor: 'rgba(5,5,5,0.92)',
                        borderTopWidth: 1,
                        borderTopColor: 'rgba(255,255,255,0.08)',
                        overflow: 'hidden',
                    },
                    sheetOpacity,
                ]}
                pointerEvents={isExpanded ? 'none' : 'auto'}
            >
                <View style={{ alignItems: 'center', paddingTop: 16, paddingBottom: 8 }}>
                    <View
                        style={{
                            width: 40,
                            height: 4,
                            borderRadius: 2,
                            backgroundColor: 'rgba(255,255,255,0.2)',
                        }}
                    />
                </View>

                <ScrollView
                    style={{ flex: 1, paddingHorizontal: 24 }}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 40, paddingTop: 8 }}
                >
                    {/* Current Location */}
                    <View style={{ marginBottom: 32 }}>
                        <Text
                            style={{
                                fontSize: 10,
                                fontWeight: '700',
                                color: '#6b7280',
                                letterSpacing: 3,
                                marginBottom: 12,
                                textTransform: 'uppercase',
                            }}
                        >
                            Currently In
                        </Text>
                        <View
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                            }}
                        >
                            <View>
                                <Text
                                    style={{
                                        fontSize: 30,
                                        fontWeight: '700',
                                        color: 'white',
                                        letterSpacing: -0.5,
                                    }}
                                >
                                    {currentCity ?? 'Locating...'}
                                </Text>
                                <View
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        marginTop: 8,
                                    }}
                                >
                                    <MaterialIcons name="cloud" size={18} color="#60a5fa" />
                                    <Text
                                        style={{
                                            fontSize: 13,
                                            fontWeight: '500',
                                            color: '#60a5fa',
                                            marginLeft: 8,
                                        }}
                                    >
                                        {weather
                                            ? `${formatTemperature(parseInt(weather.temp), unitSystem)} • ${weather.desc}`
                                            : '—'}
                                    </Text>
                                </View>
                            </View>
                            <TouchableOpacity
                                style={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: 24,
                                    backgroundColor: 'rgba(255,255,255,0.08)',
                                    borderWidth: 1,
                                    borderColor: 'rgba(255,255,255,0.08)',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                                activeOpacity={0.7}
                                onPress={() => {
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                    setRecenterTrigger(prev => prev + 1);
                                }}
                            >
                                <MaterialIcons name="my-location" size={20} color="#60a5fa" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Category Pills */}
                    <View style={{ marginBottom: 24 }}>
                        <Text
                            style={{
                                fontSize: 10,
                                fontWeight: '700',
                                color: '#6b7280',
                                letterSpacing: 3,
                                marginBottom: 12,
                                textTransform: 'uppercase',
                            }}
                        >
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
                        <View
                            style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                alignItems: 'flex-end',
                                marginBottom: 20,
                            }}
                        >
                            <Text
                                style={{
                                    fontSize: 10,
                                    fontWeight: '700',
                                    color: '#6b7280',
                                    letterSpacing: 3,
                                    textTransform: 'uppercase',
                                }}
                            >
                                Next Goals
                            </Text>
                            <TouchableOpacity
                                activeOpacity={0.7}
                                onPress={() => {
                                    Haptics.selectionAsync();
                                    router.push('/(tabs)/archive');
                                }}
                            >
                                <Text style={{ fontSize: 12, color: '#60a5fa', fontWeight: '600' }}>
                                    See all
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ paddingRight: 16 }}
                        >
                            {visibleGoals.length === 0 ? (
                                <Text style={{ color: '#6b7280' }}>
                                    No goals to show for this filter.
                                </Text>
                            ) : (
                                visibleGoals.slice(0, 5).map((goal: Goal) => (
                                    <View
                                        key={goal.id}
                                        style={{
                                            width: 260,
                                            height: 170,
                                            borderRadius: 24,
                                            overflow: 'hidden',
                                            marginRight: 16,
                                            borderWidth: 1,
                                            borderColor: 'rgba(255,255,255,0.1)',
                                            position: 'relative',
                                        }}
                                    >
                                        <Image
                                            source={{ uri: goal.image }}
                                            style={{
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                right: 0,
                                                bottom: 0,
                                                opacity: 0.6,
                                            }}
                                            contentFit="cover"
                                        />
                                        <LinearGradient
                                            colors={[
                                                'transparent',
                                                'rgba(0,0,0,0.4)',
                                                'rgba(0,0,0,1)',
                                            ]}
                                            style={{
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                right: 0,
                                                bottom: 0,
                                            }}
                                        />
                                        <View
                                            style={{
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                right: 0,
                                                bottom: 0,
                                                padding: 20,
                                                justifyContent: 'flex-end',
                                            }}
                                        >
                                            <View
                                                style={{
                                                    flexDirection: 'row',
                                                    alignItems: 'flex-end',
                                                }}
                                            >
                                                <View style={{ flex: 1 }}>
                                                    <Text
                                                        style={{
                                                            color: 'white',
                                                            fontWeight: '700',
                                                            fontSize: 18,
                                                            lineHeight: 22,
                                                            marginBottom: 4,
                                                        }}
                                                        numberOfLines={1}
                                                    >
                                                        {goal.title}
                                                    </Text>
                                                    <View
                                                        style={{
                                                            flexDirection: 'row',
                                                            alignItems: 'center',
                                                        }}
                                                    >
                                                        <MaterialIcons
                                                            name="near-me"
                                                            size={14}
                                                            color="#3b82f6"
                                                        />
                                                        <Text
                                                            style={{
                                                                color: '#9ca3af',
                                                                fontSize: 11,
                                                                fontWeight: '500',
                                                                marginLeft: 4,
                                                            }}
                                                        >
                                                            {goal.location.city},{' '}
                                                            {goal.location.country}
                                                        </Text>
                                                    </View>
                                                </View>
                                                <TouchableOpacity
                                                    style={{
                                                        width: 40,
                                                        height: 40,
                                                        borderRadius: 20,
                                                        backgroundColor: '#2563eb',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                    }}
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
            </Animated.View>
        </ScreenWrapper>
    );
}
