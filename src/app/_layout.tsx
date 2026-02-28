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
import { ErrorBoundary } from '../components/ErrorBoundary';

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
                <Stack.Screen name="auth" options={{ headerShown: false, gestureEnabled: false }} />
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="add-goal" options={{ presentation: 'modal' }} />
                <Stack.Screen name="goal-detail" options={{ presentation: 'card' }} />
                <Stack.Screen name="profile" options={{ presentation: 'card' }} />
                <Stack.Screen name="inspiration" options={{ presentation: 'modal' }} />
                <Stack.Screen name="onboarding" options={{ presentation: 'fullScreenModal', gestureEnabled: false }} />
                <Stack.Screen name="notifications" options={{ presentation: 'modal' }} />
            </Stack>
        </>
    );
}

export default function RootLayout() {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaProvider>
                <ErrorBoundary>
                    <ThemeProvider>
                        <RootLayoutNav />
                    </ThemeProvider>
                </ErrorBoundary>
            </SafeAreaProvider>
        </GestureHandlerRootView>
    );
}
