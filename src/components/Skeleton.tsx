import React, { useEffect, useRef } from 'react';
import { Animated, View, ViewStyle } from 'react-native';

interface SkeletonProps {
    width?: number | string;
    height?: number;
    borderRadius?: number;
    style?: ViewStyle;
}

export function Skeleton({ width = '100%', height = 16, borderRadius = 8, style }: SkeletonProps) {
    const opacity = useRef(new Animated.Value(0.3)).current;

    useEffect(() => {
        const pulse = Animated.loop(
            Animated.sequence([
                Animated.timing(opacity, { toValue: 0.7, duration: 800, useNativeDriver: true }),
                Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
            ])
        );
        pulse.start();
        return () => pulse.stop();
    }, []);

    return (
        <Animated.View
            style={[
                {
                    width: width as any,
                    height,
                    borderRadius,
                    backgroundColor: 'rgba(255,255,255,0.12)',
                    opacity,
                },
                style,
            ]}
        />
    );
}

// Pre-built skeletons for common layouts
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
