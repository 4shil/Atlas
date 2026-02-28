import { View } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '../theme';

interface ScreenWrapperProps {
    children: React.ReactNode;
    bgClass?: string;
    edges?: Edge[];
}

export function ScreenWrapper({
    children,
    bgClass,
    edges = ['top', 'bottom'],
}: ScreenWrapperProps) {
    const { isDark } = useTheme();

    // If bgClass explicitly provided, use it — else auto from theme
    const resolvedBg = bgClass ?? (isDark ? 'bg-black' : 'bg-white');

    return (
        // 'dark' class on root enables NativeWind dark: variants throughout entire subtree
        <SafeAreaView
            className={`flex-1 relative ${resolvedBg} ${isDark ? 'dark' : ''}`}
            edges={edges}
        >
            <StatusBar style={isDark ? 'light' : 'dark'} />

            {/* Foreground Content Layer */}
            <View className="flex-1 z-10">{children}</View>
        </SafeAreaView>
    );
}
