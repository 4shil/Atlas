/**
 * Atlas — Root Layout
 * App entry with providers
 */

import '../../global.css';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider, useTheme } from '../theme';

function RootLayoutNav() {
    const { colors, isDark, isReducedMotion } = useTheme();

    return (
        <>
            <StatusBar style={isDark ? 'light' : 'dark'} />
            <Stack
                screenOptions={{
                    headerShown: false,
                    contentStyle: {
                        backgroundColor: colors.background.primary,
                    },
                    animation: isReducedMotion ? 'fade' : 'fade_from_bottom',
                }}
            >
                <Stack.Screen name="index" />
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="add-goal" options={{ presentation: 'modal' }} />
                {/* Hide stale standalone screens from routing */}
                <Stack.Screen name="dashboard" options={{ href: null }} />
                <Stack.Screen name="gallery" options={{ href: null }} />
                <Stack.Screen name="map" options={{ href: null }} />
                <Stack.Screen name="inspiration" options={{ href: null }} />
            </Stack>
        </>
    );
}

export default function RootLayout() {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaProvider>
                <ThemeProvider>
                    <RootLayoutNav />
                </ThemeProvider>
            </SafeAreaProvider>
        </GestureHandlerRootView>
    );
}
