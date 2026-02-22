import { Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import { BlurView } from 'expo-blur';
import { View, Platform, StyleSheet } from 'react-native';

export default function TabLayout() {
    const { colors, isDark } = useTheme();

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    position: 'absolute',
                    backgroundColor: isDark ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.7)',
                    borderTopWidth: 0,
                    elevation: 0,
                    shadowOpacity: 0,
                    height: Platform.OS === 'ios' ? 85 : 65,
                    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
                },
                tabBarBackground: () => (
                    <BlurView
                        tint={isDark ? 'dark' : 'light'}
                        intensity={80}
                        style={StyleSheet.absoluteFill}
                    />
                ),
                tabBarActiveTintColor: isDark ? '#ffffff' : '#000000',
                tabBarInactiveTintColor: isDark ? '#6b7280' : '#9ca3af',
                tabBarShowLabel: false,
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Dashboard',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialIcons name="grid-view" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="gallery"
                options={{
                    title: 'Gallery',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialIcons name="photo-library" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="map"
                options={{
                    title: 'Map',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialIcons name="map" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="archive"
                options={{
                    title: 'Archive',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialIcons name="inventory-2" size={size} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}
