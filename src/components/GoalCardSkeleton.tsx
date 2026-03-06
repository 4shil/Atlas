import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withSequence,
    withTiming,
} from 'react-native-reanimated';

function ShimmerBox({ style }: { style?: any }) {
    const opacity = useSharedValue(0.3);

    useEffect(() => {
        opacity.value = withRepeat(
            withSequence(withTiming(0.7, { duration: 800 }), withTiming(0.3, { duration: 800 })),
            -1,
            false
        );
    }, [opacity]);

    const animStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

    return <Animated.View style={[styles.shimmer, style, animStyle]} />;
}

export function GoalCardSkeleton() {
    return (
        <View style={styles.card}>
            <ShimmerBox style={styles.image} />
            <View style={styles.content}>
                <ShimmerBox style={styles.badge} />
                <ShimmerBox style={styles.title1} />
                <ShimmerBox style={styles.title2} />
                <View style={styles.row}>
                    <ShimmerBox style={styles.loc} />
                    <ShimmerBox style={styles.date} />
                </View>
            </View>
        </View>
    );
}

export function SkeletonList({ count = 3 }: { count?: number }) {
    return (
        <>
            {Array.from({ length: count }).map((_, i) => (
                <GoalCardSkeleton key={i} />
            ))}
        </>
    );
}

const styles = StyleSheet.create({
    card: {
        width: 300,
        height: 440,
        borderRadius: 28,
        overflow: 'hidden',
        backgroundColor: '#111',
        marginRight: 16,
    },
    image: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    content: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 20,
        gap: 10,
    },
    badge: { width: 64, height: 20, borderRadius: 6 },
    title1: { width: '90%', height: 22, borderRadius: 8 },
    title2: { width: '65%', height: 22, borderRadius: 8 },
    row: { flexDirection: 'row', gap: 10, marginTop: 4 },
    loc: { width: 80, height: 14, borderRadius: 6 },
    date: { width: 60, height: 14, borderRadius: 6 },
    shimmer: { backgroundColor: 'rgba(255,255,255,0.12)' },
});

// shimmer: opacity pulse via reanimated withRepeat
