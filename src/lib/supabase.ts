/**
 * Supabase Client
 * Single instance used across the app.
 * Credentials loaded from .env — never commit .env to git.
 */

import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import type { Database } from './database.types';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || supabaseUrl.includes('your-project')) {
    console.warn('[Supabase] EXPO_PUBLIC_SUPABASE_URL not configured. Running in local-only mode.');
}

const webAuthStorage = {
    getItem: async (key: string) => {
        if (typeof window === 'undefined' || !window.localStorage) return null;
        return window.localStorage.getItem(key);
    },
    setItem: async (key: string, value: string) => {
        if (typeof window === 'undefined' || !window.localStorage) return;
        window.localStorage.setItem(key, value);
    },
    removeItem: async (key: string) => {
        if (typeof window === 'undefined' || !window.localStorage) return;
        window.localStorage.removeItem(key);
    },
};

const authStorage =
    typeof window === 'undefined'
        ? webAuthStorage
        : Platform.OS === 'web'
          ? webAuthStorage
          : AsyncStorage;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
        storage: authStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});
