import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
    useSharedValue,
    useAnimatedProps,
    withTiming,
    Easing,
} from 'react-native-reanimated';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface StatRingProps {
    value: number;
    maxValue: number;
    color: string;
    title: string;
    subtitle: string;
}

export function StatRing({ value, maxValue, color, title, subtitle }: StatRingProps) {
    const radius = 20;
    const strokeWidth = 4;
    const circumference = 2 * Math.PI * radius;

    const progress = useSharedValue(0);

    useEffect(() => {
        const targetValue = maxValue > 0 ? value / maxValue : 0;
        progress.value = withTiming(targetValue, {
            duration: 1000,
            easing: Easing.out(Easing.cubic),
        });
    }, [value, maxValue]);

    const animatedProps = useAnimatedProps(() => {
        const strokeDashoffset = circumference - progress.value * circumference;
        return {
            strokeDashoffset,
        };
    });

    return (
        <View
            style={{
                flex: 1,
                backgroundColor: 'rgba(255,255,255,0.05)',
                borderRadius: 14,
                padding: 12,
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.08)',
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
            }}
        >
            <View style={{ width: 48, height: 48, justifyContent: 'center', alignItems: 'center' }}>
                <Svg width={48} height={48} viewBox="0 0 48 48">
                    <Circle
                        cx={24}
                        cy={24}
                        r={radius}
                        stroke="rgba(255,255,255,0.1)"
                        strokeWidth={strokeWidth}
                        fill="none"
                    />
                    <AnimatedCircle
                        cx={24}
                        cy={24}
                        r={radius}
                        stroke={color}
                        strokeWidth={strokeWidth}
                        fill="none"
                        strokeDasharray={circumference}
                        animatedProps={animatedProps}
                        strokeLinecap="round"
                        rotation="-90"
                        origin="24, 24"
                    />
                </Svg>
                <Text
                    style={{
                        position: 'absolute',
                        color: 'white',
                        fontSize: 12,
                        fontWeight: '700',
                    }}
                >
                    {value}
                </Text>
            </View>
            <View style={{ flex: 1 }}>
                <Text style={{ color: 'white', fontSize: 14, fontWeight: '600' }}>{title}</Text>
                <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, marginTop: 2 }}>
                    {subtitle}
                </Text>
            </View>
        </View>
    );
}
