import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface SettingsState {
    darkMode: boolean;
    unitSystem: 'metric' | 'imperial';
    pushNotifications: boolean;
    dailyReminders: boolean;
    locationServices: boolean;

    // Actions
    setDarkMode: (value: boolean) => void;
    setUnitSystem: (value: 'metric' | 'imperial') => void;
    setPushNotifications: (value: boolean) => void;
    setDailyReminders: (value: boolean) => void;
    setLocationServices: (value: boolean) => void;
    resetSettings: () => void;
}

const INITIAL_SETTINGS = {
    darkMode: true,
    unitSystem: 'metric' as const,
    pushNotifications: true,
    dailyReminders: false,
    locationServices: true,
};

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            ...INITIAL_SETTINGS,

            setDarkMode: (value) => set({ darkMode: value }),
            setUnitSystem: (value) => set({ unitSystem: value }),
            setPushNotifications: (value) => set({ pushNotifications: value }),
            setDailyReminders: (value) => set({ dailyReminders: value }),
            setLocationServices: (value) => set({ locationServices: value }),
            resetSettings: () => set(INITIAL_SETTINGS),
        }),
        {
            name: 'atlas-settings-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
