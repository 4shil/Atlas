/**
 * Atlas — Tab Navigation Layout
 */

import { Tabs } from 'expo-router';
import { Text, View, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme';

function TabIcon({ icon, label, focused }: { icon: string; label: string; focused: boolean }) {
    const { colors, typography } = useTheme();

    return (
        <View style={styles.tabIcon}>
            <Text style={[
                styles.icon,
                { color: focused ? colors.accent.primary : colors.text.secondary }
            ]}>
                {icon}
            </Text>
            <Text style={[
                typography.caption,
                { color: focused ? colors.accent.primary : colors.text.secondary }
            ]}>
                {label}
            </Text>
        </View>
    );
}

export default function TabLayout() {
    const { colors, isDark } = useTheme();
    const insets = useSafeAreaInsets();

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    position: 'absolute',
                    backgroundColor: isDark ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.8)',
                    borderTopWidth: 0,
                    height: 80 + insets.bottom,
                    paddingBottom: insets.bottom,
                },
                tabBarActiveTintColor: colors.accent.primary,
                tabBarInactiveTintColor: colors.text.secondary,
                tabBarShowLabel: false,
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    tabBarIcon: ({ focused }) => (
                        <TabIcon icon="🎬" label="Gallery" focused={focused} />
                    ),
                }}
            />
            <Tabs.Screen
                name="map"
                options={{
                    tabBarIcon: ({ focused }) => (
                        <TabIcon icon="🗺️" label="Map" focused={focused} />
                    ),
                }}
            />
            <Tabs.Screen
                name="timeline"
                options={{
                    tabBarIcon: ({ focused }) => (
                        <TabIcon icon="📅" label="Timeline" focused={focused} />
                    ),
                }}
            />
            <Tabs.Screen
                name="archive"
                options={{
                    tabBarIcon: ({ focused }) => (
                        <TabIcon icon="📦" label="Archive" focused={focused} />
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
        paddingTop: 8,
    },
    icon: {
        fontSize: 24,
        marginBottom: 4,
    },
});
