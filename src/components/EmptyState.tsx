import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, {
    FadeInDown,
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    Easing,
} from 'react-native-reanimated';

interface EmptyStateProps {
    icon: string;
    title: string;
    subtitle: string;
    actionLabel?: string;
    onAction?: () => void;
}

export function EmptyState({ icon, title, subtitle, actionLabel, onAction }: EmptyStateProps) {
    // #23 - Rotating icon
    const rotation = useSharedValue(0);
    useEffect(() => {
        rotation.value = withRepeat(withTiming(360, { duration: 4000, easing: Easing.linear }), -1);
    }, []);
    const iconRotateStyle = useAnimatedStyle(() => ({
        transform: [{ rotate: `${rotation.value}deg` }],
    }));

    return (
        <Animated.View
            entering={FadeInDown.duration(400)}
            className="flex-1 items-center justify-center px-8 py-20"
        >
            <View className="w-20 h-20 rounded-full bg-white/5 border border-white/10 items-center justify-center mb-6">
                <Animated.View style={iconRotateStyle}>
                    <MaterialIcons name={icon as any} size={36} color="rgba(255,255,255,0.2)" />
                </Animated.View>
            </View>
            <Text className="text-white text-xl font-bold text-center mb-2">{title}</Text>
            <Text className="text-white/40 text-sm text-center leading-5">{subtitle}</Text>
            {actionLabel && onAction && (
                <TouchableOpacity
                    className="mt-8 bg-blue-600 px-6 py-3 rounded-2xl"
                    onPress={onAction}
                    activeOpacity={0.85}
                >
                    <Text className="text-white font-semibold text-sm">{actionLabel}</Text>
                </TouchableOpacity>
            )}
        </Animated.View>
    );
}
