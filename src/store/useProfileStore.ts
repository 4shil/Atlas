import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase as supabaseClient } from '../lib/supabase';
 
const supabase = supabaseClient as any;

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

            updateProfile: async updates => {
                // 1. Local — instant
                set(state => ({ profile: { ...state.profile, ...updates } }));

                // 2. Cloud — background
                getSession().then(session => {
                    if (!session) return;
                    const p = get().profile;
                    supabase
                        .from('profiles')
                        .update({ name: p.name, bio: p.bio, avatar_url: p.avatarUri })
                        .eq('id', session.user.id)
                        .then(({ error }: { error: any }) => {
                            if (error) console.error('[ProfileStore] update:', error.message);
                        });
                });
            },

            setHasOnboarded: async () => {
                // 1. Local — instant
                set(state => ({ profile: { ...state.profile, hasOnboarded: true } }));

                // 2. Cloud — background
                getSession().then(session => {
                    if (!session) return;
                    supabase
                        .from('profiles')
                        .update({ has_onboarded: true })
                        .eq('id', session.user.id)
                        .then(({ error }: { error: any }) => {
                            if (error) console.error('[ProfileStore] onboard:', error.message);
                        });
                });
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
                            name: (data as any)?.name ?? 'Traveller',
                            bio: (data as any)?.bio ?? INITIAL_PROFILE.bio,
                            avatarUri: (data as any)?.avatar_url ?? null,
                            hasOnboarded: (data as any)?.has_onboarded ?? false,
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
