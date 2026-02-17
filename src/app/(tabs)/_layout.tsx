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
    const { colors, spacing, isDark } = useTheme();
    const insets = useSafeAreaInsets();
    const tabBarBaseHeight = spacing.touch.large + spacing.component.lg;

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    position: 'absolute',
                    backgroundColor: 'transparent',
                    borderTopWidth: StyleSheet.hairlineWidth,
                    borderTopColor: colors.border.subtle,
                    height: tabBarBaseHeight + insets.bottom,
                    paddingBottom: insets.bottom,
                },
                tabBarBackground: () => (
                    <BlurView
                        intensity={24}
                        tint={isDark ? 'dark' : 'light'}
                        style={[StyleSheet.absoluteFill, { backgroundColor: colors.overlay.blur }]}
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
