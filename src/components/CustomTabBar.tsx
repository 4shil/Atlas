import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Platform, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withRepeat,
    withSequence,
    withTiming,
    interpolateColor,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useRouter } from 'expo-router';
import { useTheme } from '../theme';

const TAB_ICONS: Record<string, keyof typeof MaterialIcons.glyphMap> = {
    index: 'space-dashboard',
    gallery: 'photo-library',
    map: 'explore',
    archive: 'auto-awesome',
};

const FAB_AFTER = 'gallery';

const TAB_LABELS: Record<string, string> = {
    index: 'Home',
    gallery: 'Gallery',
    map: 'Map',
    archive: 'Archive',
};

const ICON_SIZE = 22;
const SPRING_CONFIG = { damping: 16, stiffness: 160, mass: 0.7 };

export function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
    const insets = useSafeAreaInsets();
    const bottomPad = Math.max(insets.bottom, 14);
    const router = useRouter();
    const { isDark } = useTheme();

    // #17 - FAB breathing animation
    const fabScale = useSharedValue(1);
    useEffect(() => {
        fabScale.value = withRepeat(
            withSequence(withTiming(1.07, { duration: 1200 }), withTiming(1.0, { duration: 1200 })),
            -1,
            true
        );
    }, []);
    const fabScaleStyle = useAnimatedStyle(() => ({
        transform: [{ scale: fabScale.value }],
    }));

    // #18 - Tab labels first-run
    const [showAllLabels, setShowAllLabels] = useState(false);
    useEffect(() => {
        AsyncStorage.getItem('tabs_intro_done').then(val => {
            if (val === null) {
                setShowAllLabels(true);
                setTimeout(() => {
                    setShowAllLabels(false);
                    AsyncStorage.setItem('tabs_intro_done', '1');
                }, 3000);
            }
        });
    }, []);

    return (
        <View style={[styles.wrapper, { bottom: bottomPad }]} pointerEvents="box-none">
            <View
                style={[
                    styles.container,
                    { borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)' },
                ]}
            >
                <BlurView
                    intensity={60}
                    tint={isDark ? 'dark' : 'light'}
                    style={StyleSheet.absoluteFill}
                >
                    <View
                        style={[
                            styles.blurTint,
                            {
                                backgroundColor: isDark
                                    ? 'rgba(15, 15, 20, 0.55)'
                                    : 'rgba(255, 255, 255, 0.7)',
                            },
                        ]}
                    />
                </BlurView>
                <View
                    style={[
                        styles.innerHighlight,
                        {
                            backgroundColor: isDark
                                ? 'rgba(255, 255, 255, 0.18)'
                                : 'rgba(0, 0, 0, 0.06)',
                        },
                    ]}
                />

                <View style={styles.tabRow}>
                    {state.routes.map((route, index) => {
                        const isAfterFab = route.name === 'map';
                        const isFocused = state.index === index;
                        const iconName = TAB_ICONS[route.name] ?? 'circle';
                        const label = TAB_LABELS[route.name] ?? route.name;

                        return (
                            <React.Fragment key={route.key}>
                                {isAfterFab && (
                                    // #17 - FAB with breathing animation
                                    <Animated.View style={fabScaleStyle}>
                                        <TouchableOpacity
                                            activeOpacity={0.85}
                                            onPress={() => {
                                                Haptics.impactAsync(
                                                    Haptics.ImpactFeedbackStyle.Medium
                                                );
                                                router.push('/add-goal');
                                            }}
                                            style={{
                                                width: 52,
                                                height: 52,
                                                borderRadius: 26,
                                                backgroundColor: '#2563eb',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                marginHorizontal: 4,
                                                shadowColor: '#2563eb',
                                                shadowOpacity: 0.6,
                                                shadowRadius: 12,
                                                shadowOffset: { width: 0, height: 4 },
                                                elevation: 8,
                                            }}
                                            accessibilityLabel="Add Goal"
                                        >
                                            <MaterialIcons name="add" size={28} color="white" />
                                        </TouchableOpacity>
                                    </Animated.View>
                                )}
                                <TabItem
                                    key={route.key}
                                    iconName={iconName}
                                    label={label}
                                    isFocused={isFocused}
                                    showAllLabels={showAllLabels}
                                    isDark={isDark}
                                    onPress={() => {
                                        const event = navigation.emit({
                                            type: 'tabPress',
                                            target: route.key,
                                            canPreventDefault: true,
                                        });
                                        if (!isFocused && !event.defaultPrevented) {
                                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                            navigation.navigate(route.name, route.params);
                                        }
                                    }}
                                    onLongPress={() => {
                                        navigation.emit({
                                            type: 'tabLongPress',
                                            target: route.key,
                                        });
                                    }}
                                />
                            </React.Fragment>
                        );
                    })}
                </View>
            </View>
        </View>
    );
}

interface TabItemProps {
    iconName: keyof typeof MaterialIcons.glyphMap;
    label: string;
    isFocused: boolean;
    showAllLabels: boolean;
    isDark: boolean;
    onPress: () => void;
    onLongPress: () => void;
}

function TabItem({
    iconName,
    label,
    isFocused,
    showAllLabels,
    isDark,
    onPress,
    onLongPress,
}: TabItemProps) {
    const progress = useSharedValue(isFocused ? 1 : 0);

    useEffect(() => {
        progress.value = withSpring(isFocused ? 1 : 0, SPRING_CONFIG);
    }, [isFocused]);

    const pillStyle = useAnimatedStyle(() => ({
        backgroundColor: interpolateColor(
            progress.value,
            [0, 1],
            ['transparent', isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)']
        ),
    }));

    const iconStyle = useAnimatedStyle(() => ({
        opacity: withSpring(isFocused ? 1 : 0.4, SPRING_CONFIG),
        transform: [{ translateY: withSpring(isFocused ? -2 : 0, SPRING_CONFIG) }],
    }));

    const showLabel = isFocused || showAllLabels;
    const labelStyle = useAnimatedStyle(() => ({
        opacity: withSpring(showLabel ? 1 : 0, SPRING_CONFIG),
        transform: [
            { translateY: withSpring(showLabel ? 0 : 6, SPRING_CONFIG) },
            { scale: withSpring(showLabel ? 1 : 0.7, SPRING_CONFIG) },
        ],
    }));

    return (
        <TouchableOpacity
            activeOpacity={0.7}
            onPress={onPress}
            onLongPress={onLongPress}
            accessibilityRole="tab"
            accessibilityState={{ selected: isFocused }}
            accessibilityLabel={label}
            style={styles.tabItem}
        >
            <Animated.View style={[styles.pill, pillStyle]}>
                <Animated.View style={iconStyle}>
                    <MaterialIcons
                        name={iconName}
                        size={ICON_SIZE}
                        color={
                            isFocused
                                ? isDark
                                    ? '#ffffff'
                                    : '#111827'
                                : isDark
                                  ? '#666'
                                  : '#9ca3af'
                        }
                    />
                </Animated.View>
                <Animated.Text
                    style={[styles.label, { color: isDark ? '#fff' : '#111827' }, labelStyle]}
                    numberOfLines={1}
                >
                    {label}
                </Animated.Text>
            </Animated.View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        position: 'absolute',
        left: 0,
        right: 0,
        alignItems: 'center',
        zIndex: 100,
    },
    container: {
        borderRadius: 26,
        overflow: 'hidden',
        borderWidth: StyleSheet.hairlineWidth,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.5,
                shadowRadius: 24,
            },
            android: { elevation: 16 },
        }),
    },
    blurTint: {
        ...StyleSheet.absoluteFillObject,
    },
    innerHighlight: {
        position: 'absolute',
        top: 0,
        left: 16,
        right: 16,
        height: StyleSheet.hairlineWidth,
    },
    tabRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 4,
        paddingVertical: 4,
    },
    tabItem: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    pill: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 18,
        paddingVertical: 10,
        borderRadius: 22,
        gap: 7,
    },
    label: {
        fontSize: 12,
        fontWeight: '600',
        letterSpacing: 0.2,
    },
});
