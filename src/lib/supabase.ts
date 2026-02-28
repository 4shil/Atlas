/**
 * Supabase Client
 * Single instance used across the app.
 * Credentials loaded from .env — never commit .env to git.
 */

import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Database } from './database.types';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || supabaseUrl.includes('your-project')) {
    console.warn('[Supabase] EXPO_PUBLIC_SUPABASE_URL not configured. Running in local-only mode.');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});
