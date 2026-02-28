/**
 * Auth Store
 * Manages Supabase auth session state.
 * Syncs with Supabase onAuthStateChange listener.
 */

import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Session, User } from '@supabase/supabase-js';

interface AuthState {
    session: Session | null;
    user: User | null;
    loading: boolean;
    initialized: boolean;

    // Actions
    signInWithEmail: (email: string, password: string) => Promise<{ error: string | null }>;
    signUpWithEmail: (email: string, password: string) => Promise<{ error: string | null }>;
    signOut: () => Promise<void>;
    resetPassword: (email: string) => Promise<{ error: string | null }>;
    initialize: () => () => void; // returns unsubscribe fn
}

export const useAuthStore = create<AuthState>((set, get) => ({
    session: null,
    user: null,
    loading: false,
    initialized: false,

    initialize: () => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            set({ session, user: session?.user ?? null, initialized: true });
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            set({ session, user: session?.user ?? null });
        });

        return () => subscription.unsubscribe();
    },

    signInWithEmail: async (email, password) => {
        set({ loading: true });
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        set({ loading: false });
        return { error: error?.message ?? null };
    },

    signUpWithEmail: async (email, password) => {
        set({ loading: true });
        const { error } = await supabase.auth.signUp({ email, password });
        set({ loading: false });
        return { error: error?.message ?? null };
    },

    signOut: async () => {
        await supabase.auth.signOut();
        set({ session: null, user: null });
    },

    resetPassword: async (email) => {
        const { error } = await supabase.auth.resetPasswordForEmail(email);
        return { error: error?.message ?? null };
    },
}));
