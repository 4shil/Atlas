import { View, Dimensions } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { ColorBendsBackground } from './ColorBendsBackground';
import { useTheme } from '../theme';

const { width, height } = Dimensions.get('window');

interface ScreenWrapperProps {
    children: React.ReactNode;
    blobs?: boolean;
    bgClass?: string;
    edges?: Edge[];
}

export function ScreenWrapper({ children, blobs = true, bgClass, edges = ['top', 'bottom'] }: ScreenWrapperProps) {
    const { isDark } = useTheme();

    // If bgClass explicitly provided, use it — else auto from theme
    const resolvedBg = bgClass ?? (isDark ? 'bg-black' : 'bg-white');

    return (
        // 'dark' class on root enables NativeWind dark: variants throughout entire subtree
        <SafeAreaView className={`flex-1 relative ${resolvedBg} ${isDark ? 'dark' : ''}`} edges={edges}>
            <StatusBar style={isDark ? 'light' : 'dark'} />

            {/* Animated spectral gradient background */}
            {blobs && (
                <View className="absolute inset-0 z-0 overflow-hidden" pointerEvents="none">
                    <ColorBendsBackground width={width} height={height} />
                </View>
            )}

            {/* Foreground Content Layer */}
            <View className="flex-1 z-10">
                {children}
            </View>
        </SafeAreaView>
    );
}
