import React, { useEffect } from 'react';
import { View, ViewStyle } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    Easing,
    interpolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

interface SkeletonProps {
    width?: number | string;
    height?: number;
    borderRadius?: number;
    style?: ViewStyle;
}

export function Skeleton({ width = '100%', height = 16, borderRadius = 8, style }: SkeletonProps) {
    // #20 - Shimmer animation
    const shimmer = useSharedValue(0);

    useEffect(() => {
        shimmer.value = withRepeat(withTiming(1, { duration: 1000, easing: Easing.linear }), -1);
    }, []);

    const shimmerStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: interpolate(shimmer.value, [0, 1], [-200, 200]) }],
    }));

    return (
        <View
            style={[
                {
                    width: width as any,
                    height,
                    borderRadius,
                    backgroundColor: 'rgba(255,255,255,0.10)',
                    overflow: 'hidden',
                },
                style,
            ]}
        >
            <Animated.View
                style={[{ position: 'absolute', top: 0, bottom: 0, width: 200 }, shimmerStyle]}
            >
                <LinearGradient
                    colors={[
                        'rgba(255,255,255,0)',
                        'rgba(255,255,255,0.15)',
                        'rgba(255,255,255,0)',
                    ]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{ flex: 1 }}
                />
            </Animated.View>
        </View>
    );
}

export function GoalCardSkeleton() {
    return (
        <View className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden mb-4">
            <Skeleton height={200} borderRadius={0} />
            <View className="p-4 gap-y-3">
                <Skeleton height={18} width="70%" />
                <Skeleton height={12} width="45%" />
                <View className="flex-row gap-x-2 mt-1">
                    <Skeleton height={24} width={70} borderRadius={12} />
                    <Skeleton height={24} width={60} borderRadius={12} />
                </View>
            </View>
        </View>
    );
}

export function GoalListSkeleton({ count = 4 }: { count?: number }) {
    return (
        <>
            {Array.from({ length: count }).map((_, i) => (
                <GoalCardSkeleton key={i} />
            ))}
        </>
    );
}

export function ProfileHeaderSkeleton() {
    return (
        <View className="flex-row items-center px-6 py-4">
            <Skeleton width={48} height={48} borderRadius={24} />
            <View className="ml-3 gap-y-2">
                <Skeleton height={14} width={120} />
                <Skeleton height={10} width={80} />
            </View>
        </View>
    );
}
