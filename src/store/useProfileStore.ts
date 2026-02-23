import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserProfile {
    name: string;
    bio: string;
    avatarUri: string | null;
    hasOnboarded: boolean;
}

interface ProfileState {
    profile: UserProfile;
    updateProfile: (updates: Partial<UserProfile>) => void;
    setHasOnboarded: () => void;
}

export const useProfileStore = create<ProfileState>()(
    persist(
        (set) => ({
            profile: {
                name: 'Traveller',
                bio: 'Living for the next adventure ✈️',
                avatarUri: null,
                hasOnboarded: false,
            },
            updateProfile: (updates) =>
                set((state) => ({
                    profile: { ...state.profile, ...updates },
                })),
            setHasOnboarded: () =>
                set((state) => ({
                    profile: { ...state.profile, hasOnboarded: true },
                })),
        }),
        {
            name: 'atlas-profile-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
