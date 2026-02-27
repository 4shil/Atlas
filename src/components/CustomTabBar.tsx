import React, { useEffect } from 'react';
import { View, TouchableOpacity, Platform, StyleSheet, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    interpolateColor,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';

const TAB_ICONS: Record<string, keyof typeof MaterialIcons.glyphMap> = {
    index: 'space-dashboard',
    gallery: 'photo-library',
    map: 'explore',
    archive: 'auto-awesome',
};

const TAB_LABELS: Record<string, string> = {
    index: 'Home',
    gallery: 'Gallery',
    map: 'Map',
    archive: 'Archive',
};

const ICON_SIZE = 24;
const SPRING_CONFIG = { damping: 18, stiffness: 200, mass: 0.8 };

export function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
    const insets = useSafeAreaInsets();
    const bottomPad = Math.max(insets.bottom, 12);

    return (
        <View
            style={[styles.wrapper, { bottom: bottomPad }]}
            pointerEvents="box-none"
        >
            <View style={styles.container}>
                {/* Glassmorphic blur layer */}
                <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill}>
                    <View style={styles.blurOverlay} />
                </BlurView>

                {/* Subtle top border glow */}
                <View style={styles.topBorder} />

                {/* Tab items */}
                <View style={styles.tabRow}>
                    {state.routes.map((route, index) => {
                        const isFocused = state.index === index;
                        const iconName = TAB_ICONS[route.name] ?? 'circle';
                        const label = TAB_LABELS[route.name] ?? route.name;

                        return (
                            <TabItem
                                key={route.key}
                                iconName={iconName}
                                label={label}
                                isFocused={isFocused}
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
    onPress: () => void;
    onLongPress: () => void;
}

function TabItem({ iconName, label, isFocused, onPress, onLongPress }: TabItemProps) {
    const progress = useSharedValue(isFocused ? 1 : 0);

    useEffect(() => {
        progress.value = withSpring(isFocused ? 1 : 0, SPRING_CONFIG);
    }, [isFocused]);

    const pillStyle = useAnimatedStyle(() => ({
        backgroundColor: interpolateColor(
            progress.value,
            [0, 1],
            ['transparent', 'rgba(99, 102, 241, 0.15)']
        ),
        borderColor: interpolateColor(
            progress.value,
            [0, 1],
            ['transparent', 'rgba(99, 102, 241, 0.3)']
        ),
        transform: [{ scale: withSpring(isFocused ? 1 : 0.92, SPRING_CONFIG) }],
    }));

    const iconStyle = useAnimatedStyle(() => ({
        opacity: withSpring(isFocused ? 1 : 0.45, SPRING_CONFIG),
        transform: [
            { translateY: withSpring(isFocused ? -1 : 0, SPRING_CONFIG) },
        ],
    }));

    const labelStyle = useAnimatedStyle(() => ({
        opacity: withSpring(isFocused ? 1 : 0, SPRING_CONFIG),
        transform: [
            { translateY: withSpring(isFocused ? 0 : 4, SPRING_CONFIG) },
            { scale: withSpring(isFocused ? 1 : 0.8, SPRING_CONFIG) },
        ],
    }));

    const dotStyle = useAnimatedStyle(() => ({
        opacity: withSpring(isFocused ? 1 : 0, { damping: 14, stiffness: 180 }),
        transform: [
            { scaleX: withSpring(isFocused ? 1 : 0, SPRING_CONFIG) },
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
                        color={isFocused ? '#a5b4fc' : '#6b7280'}
                    />
                </Animated.View>

                <Animated.Text
                    style={[styles.label, labelStyle]}
                    numberOfLines={1}
                >
                    {label}
                </Animated.Text>
            </Animated.View>

            {/* Active indicator dot */}
            <Animated.View style={[styles.dot, dotStyle]} />
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
        flexDirection: 'row',
        borderRadius: 28,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        // Shadow
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.45,
                shadowRadius: 16,
            },
            android: {
                elevation: 12,
            },
        }),
    },
    blurOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(10, 10, 20, 0.72)',
    },
    topBorder: {
        position: 'absolute',
        top: 0,
        left: 20,
        right: 20,
        height: 0.5,
        backgroundColor: 'rgba(165, 180, 252, 0.15)',
    },
    tabRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 6,
        paddingVertical: 6,
    },
    tabItem: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    pill: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 22,
        borderWidth: 1,
        gap: 6,
    },
    label: {
        fontSize: 12,
        fontWeight: '600',
        color: '#a5b4fc',
        letterSpacing: 0.3,
    },
    dot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#818cf8',
        marginTop: 4,
    },
});
