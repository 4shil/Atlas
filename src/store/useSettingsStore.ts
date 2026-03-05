import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const noopStorage = {
    getItem: async (_key: string) => null,
    setItem: async (_key: string, _value: string) => {},
    removeItem: async (_key: string) => {},
};

const persistStorage = createJSONStorage(() =>
    Platform.OS === 'web' && typeof window === 'undefined' ? noopStorage : (AsyncStorage as any)
);

export type ThemeMode = 'dark' | 'light' | 'system';
export type MapStylePref = 'standard' | 'satellite';

export interface SettingsState {
    darkMode: boolean;
    themeMode: ThemeMode;
    unitSystem: 'metric' | 'imperial';
    pushNotifications: boolean;
    dailyReminders: boolean;
    notificationSound: boolean;
    locationServices: boolean;
    mapStylePref: MapStylePref;
    defaultCategory: string;
    showCompletedOnMap: boolean;

    // Actions
    setDarkMode: (value: boolean) => void;
    setThemeMode: (value: ThemeMode) => void;
    setUnitSystem: (value: 'metric' | 'imperial') => void;
    setPushNotifications: (value: boolean) => void;
    setDailyReminders: (value: boolean) => void;
    setNotificationSound: (value: boolean) => void;
    setLocationServices: (value: boolean) => void;
    setMapStylePref: (value: MapStylePref) => void;
    setDefaultCategory: (value: string) => void;
    setShowCompletedOnMap: (value: boolean) => void;
    resetSettings: () => void;
}

const INITIAL_SETTINGS = {
    darkMode: true,
    themeMode: 'dark' as ThemeMode,
    unitSystem: 'metric' as const,
    pushNotifications: true,
    dailyReminders: false,
    notificationSound: true,
    locationServices: true,
    mapStylePref: 'standard' as MapStylePref,
    defaultCategory: 'Travel',
    showCompletedOnMap: true,
};

export const useSettingsStore = create<SettingsState>()(
    persist(
        set => ({
            ...INITIAL_SETTINGS,

            setDarkMode: value => set({ darkMode: value }),
            setThemeMode: value => {
                const isDark = value === 'dark' || value === 'system';
                set({ themeMode: value, darkMode: isDark });
            },
            setUnitSystem: value => set({ unitSystem: value }),
            setPushNotifications: value => set({ pushNotifications: value }),
            setDailyReminders: value => set({ dailyReminders: value }),
            setNotificationSound: value => set({ notificationSound: value }),
            setLocationServices: value => set({ locationServices: value }),
            setMapStylePref: value => set({ mapStylePref: value }),
            setDefaultCategory: value => set({ defaultCategory: value }),
            setShowCompletedOnMap: value => set({ showCompletedOnMap: value }),
            resetSettings: () => set(INITIAL_SETTINGS),
        }),
        {
            name: 'atlas-settings-storage',
            storage: persistStorage,
        }
    )
);
