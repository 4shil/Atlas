import { Tabs } from 'expo-router';
import { CustomTabBar } from '../../components/CustomTabBar';

export default function TabLayout() {
    return (
        <Tabs
            tabBar={(props) => <CustomTabBar {...props} />}
            screenOptions={{
                headerShown: false,
                tabBarStyle: { position: 'absolute' },
            }}
        >
            <Tabs.Screen name="index" options={{ title: 'Home' }} />
            <Tabs.Screen name="gallery" options={{ title: 'Gallery' }} />
            <Tabs.Screen name="map" options={{ title: 'Map' }} />
            <Tabs.Screen name="archive" options={{ title: 'Archive' }} />
        </Tabs>
    );
}
