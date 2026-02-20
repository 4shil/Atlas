/**
 * Atlas — Tab Navigation Layout
 */

import { Tabs } from 'expo-router';
import { Text, View, StyleSheet } from 'react-native';
import type { ComponentProps } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';

type TabIconName = ComponentProps<typeof Ionicons>['name'];

function TabIcon({ icon, label, focused }: { icon: TabIconName; label: string; focused: boolean }) {
    const { colors, typography, spacing } = useTheme();
    const iconColor = focused ? colors.accent.primary : colors.text.secondary;

    return (
        <View style={[styles.tabIcon, { paddingTop: spacing.component.xs }]}>
            <Ionicons name={icon} size={22} color={iconColor} />
            <Text style={[
                typography.caption,
                { color: iconColor, marginTop: spacing.component.xs / 2 }
            ]}>
                {label}
            </Text>
        </View>
    );
}

export default function TabLayout() {
    const { colors, spacing, isDark, radius, elevation } = useTheme();
    const insets = useSafeAreaInsets();
    const tabBarBaseHeight = spacing.touch.large + spacing.component.md;

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    position: 'absolute',
                    backgroundColor: 'transparent',
                    borderTopWidth: 0,
                    height: tabBarBaseHeight + insets.bottom,
                    marginHorizontal: spacing.screen.horizontal,
                    marginBottom: spacing.component.sm,
                    borderRadius: radius.hero,
                    overflow: 'hidden',
                    paddingBottom: insets.bottom,
                    ...elevation.overlay,
                },
                tabBarBackground: () => (
                    <BlurView
                        intensity={40}
                        tint={isDark ? 'dark' : 'light'}
                        style={[StyleSheet.absoluteFill, { backgroundColor: colors.overlay.blur, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border.subtle }]}
                    />
                ),
                tabBarActiveTintColor: colors.accent.primary,
                tabBarInactiveTintColor: colors.text.secondary,
                tabBarShowLabel: false,
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    tabBarIcon: ({ focused }) => (
                        <TabIcon icon={focused ? 'film' : 'film-outline'} label="Gallery" focused={focused} />
                    ),
                }}
            />
            <Tabs.Screen
                name="map"
                options={{
                    tabBarIcon: ({ focused }) => (
                        <TabIcon icon={focused ? 'map' : 'map-outline'} label="Map" focused={focused} />
                    ),
                }}
            />
            <Tabs.Screen
                name="timeline"
                options={{
                    tabBarIcon: ({ focused }) => (
                        <TabIcon icon={focused ? 'calendar' : 'calendar-outline'} label="Timeline" focused={focused} />
                    ),
                }}
            />
            <Tabs.Screen
                name="archive"
                options={{
                    tabBarIcon: ({ focused }) => (
                        <TabIcon icon={focused ? 'archive' : 'archive-outline'} label="Archive" focused={focused} />
                    ),
                }}
            />
        </Tabs>
    );
}

const styles = StyleSheet.create({
    tabIcon: {
        alignItems: 'center',
        justifyContent: 'center',
    },
});
