/**
 * Atlas — Root Layout
 * App entry with providers
 */

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
                <Stack.Screen name="(tabs)" />
                <Stack.Screen
                    name="goal/[id]"
                    options={{
                        presentation: 'modal',
                        animation: isReducedMotion ? 'fade' : 'slide_from_bottom',
                    }}
                />
                <Stack.Screen
                    name="goal/create"
                    options={{
                        presentation: 'modal',
                        animation: isReducedMotion ? 'fade' : 'slide_from_bottom',
                    }}
                />
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
