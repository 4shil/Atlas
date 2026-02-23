import React from 'react';
import { View, Text } from 'react-native';

interface ProgressRingProps {
    completed: number;
    total: number;
}

export function ProgressRing({ completed, total }: ProgressRingProps) {
    const pct = total === 0 ? 0 : Math.round((completed / total) * 100);
    const radius = 28;
    const circumference = 2 * Math.PI * radius;
    const strokeDash = (pct / 100) * circumference;

    return (
        <View className="items-center justify-center">
            <View style={{ width: 72, height: 72 }}>
                <svg width="72" height="72" viewBox="0 0 72 72">
                    <circle cx="36" cy="36" r={radius} fill="none" stroke="#1f2937" strokeWidth="5" />
                    <circle
                        cx="36" cy="36" r={radius}
                        fill="none" stroke="#3b82f6" strokeWidth="5"
                        strokeDasharray={`${strokeDash} ${circumference}`}
                        strokeLinecap="round"
                        transform="rotate(-90 36 36)"
                    />
                </svg>
                <View className="absolute inset-0 items-center justify-center">
                    <Text className="text-white font-bold text-sm">{pct}%</Text>
                </View>
            </View>
            <Text className="text-gray-500 text-xs mt-1">Complete</Text>
        </View>
    );
}
