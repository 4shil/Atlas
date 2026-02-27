import { View, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { BlurView } from 'expo-blur';
import { ColorBendsBackground } from './ColorBendsBackground';

const { width, height } = Dimensions.get('window');

interface ScreenWrapperProps {
    children: React.ReactNode;
    blobs?: boolean;
    bgClass?: string;
    edges?: Edge[];
}

export function ScreenWrapper({ children, blobs = true, bgClass = 'bg-black', edges = ['top', 'bottom'] }: ScreenWrapperProps) {
    return (
        <SafeAreaView className={`flex-1 relative ${bgClass}`} edges={edges}>
            <StatusBar style="light" />

            {/* Background Render Layer */}
            {blobs && (
                <View className="absolute inset-0 z-0 overflow-hidden" pointerEvents="none">
                    <ColorBendsBackground width={width} height={height} />
                    {/* Keep a very incredibly light blur just to soften any pixelation from the shader */}
                    <BlurView intensity={10} tint="dark" style={StyleSheet.absoluteFill} />
                </View>
            )}

            {/* Foreground Content Layer */}
            <View className="flex-1 z-10">
                {children}
            </View>
        </SafeAreaView>
    );
}
