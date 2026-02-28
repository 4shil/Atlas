import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';

export interface UserProfile {
    name: string;
    bio: string;
    avatarUri: string | null;
    hasOnboarded: boolean;
}

interface ProfileState {
    profile: UserProfile;
    syncing: boolean;
    updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
    setHasOnboarded: () => Promise<void>;
    syncFromCloud: () => Promise<void>;
    resetProfile: () => void;
}

const INITIAL_PROFILE: UserProfile = {
    name: 'Traveller',
    bio: 'Living for the next adventure 🌍',
    avatarUri: null,
    hasOnboarded: false,
};

async function getSession() {
    const { data } = await supabase.auth.getSession();
    return data.session;
}

export const useProfileStore = create<ProfileState>()(
    persist(
        (set, get) => ({
            profile: INITIAL_PROFILE,
            syncing: false,

            updateProfile: async (updates) => {
                set(state => ({
                    profile: { ...state.profile, ...updates },
                }));

                const session = await getSession();
                if (!session) return;

                const { error } = await supabase
                    .from('profiles')
                    .update({
                        name: get().profile.name,
                        bio: get().profile.bio,
                        avatar_url: get().profile.avatarUri,
                    })
                    .eq('id', session.user.id);

                if (error) console.error('[ProfileStore] update error:', error.message);
            },

            setHasOnboarded: async () => {
                set(state => ({
                    profile: { ...state.profile, hasOnboarded: true },
                }));

                const session = await getSession();
                if (!session) return;

                const { error } = await supabase
                    .from('profiles')
                    .update({ has_onboarded: true })
                    .eq('id', session.user.id);

                if (error) console.error('[ProfileStore] setHasOnboarded error:', error.message);
            },

            syncFromCloud: async () => {
                const session = await getSession();
                if (!session) return;

                set({ syncing: true });
                const { data, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', session.user.id)
                    .single();

                if (error) {
                    console.error('[ProfileStore] sync error:', error.message);
                } else if (data) {
                    set({
                        profile: {
                            name: data.name ?? 'Traveller',
                            bio: data.bio ?? INITIAL_PROFILE.bio,
                            avatarUri: data.avatar_url ?? null,
                            hasOnboarded: data.has_onboarded ?? false,
                        },
                    });
                }
                set({ syncing: false });
            },

            resetProfile: () => set({ profile: INITIAL_PROFILE }),
        }),
        {
            name: 'atlas-profile-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
