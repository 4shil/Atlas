import React, { useEffect } from 'react';
import { View, TouchableOpacity, Platform, StyleSheet } from 'react-native';
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

const ICON_SIZE = 22;
const SPRING_CONFIG = { damping: 16, stiffness: 160, mass: 0.7 };

export function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
    const insets = useSafeAreaInsets();
    const bottomPad = Math.max(insets.bottom, 14);

    return (
        <View style={[styles.wrapper, { bottom: bottomPad }]} pointerEvents="box-none">
            <View style={styles.container}>
                {/* Apple-style frosted glass */}
                <BlurView intensity={60} tint="dark" style={StyleSheet.absoluteFill}>
                    <View style={styles.blurTint} />
                </BlurView>

                {/* Inner highlight along top edge */}
                <View style={styles.innerHighlight} />

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
                                    navigation.emit({ type: 'tabLongPress', target: route.key });
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
            ['transparent', 'rgba(255, 255, 255, 0.1)']
        ),
    }));

    const iconStyle = useAnimatedStyle(() => ({
        opacity: withSpring(isFocused ? 1 : 0.4, SPRING_CONFIG),
        transform: [{ translateY: withSpring(isFocused ? -2 : 0, SPRING_CONFIG) }],
    }));

    const labelStyle = useAnimatedStyle(() => ({
        opacity: withSpring(isFocused ? 1 : 0, SPRING_CONFIG),
        transform: [
            { translateY: withSpring(isFocused ? 0 : 6, SPRING_CONFIG) },
            { scale: withSpring(isFocused ? 1 : 0.7, SPRING_CONFIG) },
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
                        color={isFocused ? '#ffffff' : '#666'}
                    />
                </Animated.View>
                <Animated.Text style={[styles.label, labelStyle]} numberOfLines={1}>
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
        borderColor: 'rgba(255,255,255,0.12)',
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
        backgroundColor: 'rgba(15, 15, 20, 0.55)',
    },
    innerHighlight: {
        position: 'absolute',
        top: 0,
        left: 16,
        right: 16,
        height: StyleSheet.hairlineWidth,
        backgroundColor: 'rgba(255, 255, 255, 0.18)',
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
        color: '#fff',
        letterSpacing: 0.2,
    },
});
