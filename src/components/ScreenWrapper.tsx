import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { BlurView } from 'expo-blur';

interface ScreenWrapperProps {
    children: React.ReactNode;
    blobs?: boolean;
    bgClass?: string;
}

export function ScreenWrapper({ children, blobs = true, bgClass = 'bg-black' }: ScreenWrapperProps) {
    return (
        <SafeAreaView className={`flex-1 relative ${bgClass}`} edges={['top', 'bottom']}>
            <StatusBar style="light" />

            {/* Background Blobs Layer */}
            {blobs && (
                <View className="absolute inset-0 z-0 overflow-hidden" pointerEvents="none">
                    <View className="absolute top-[10%] left-[10%] w-[300px] h-[300px] bg-indigo-900 rounded-full opacity-60" />
                    <View className="absolute top-[10%] right-[10%] w-[250px] h-[250px] bg-red-900 rounded-full opacity-50" />
                    <View className="absolute bottom-[20%] left-[30%] w-[350px] h-[350px] bg-blue-900 rounded-full opacity-50" />
                    <BlurView intensity={100} tint="dark" style={StyleSheet.absoluteFill} />
                </View>
            )}

            {/* Foreground Content Layer */}
            <View className="flex-1 z-10">
                {children}
            </View>
        </SafeAreaView>
    );
}
