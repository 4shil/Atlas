/**
 * Supabase Database Types
 * Auto-generated schema matching the Atlas database.
 * Run: npx supabase gen types typescript --project-id <id> > src/lib/database.types.ts
 * to regenerate after schema changes.
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string; // UUID — matches auth.users.id
                    name: string;
                    bio: string | null;
                    avatar_url: string | null;
                    has_onboarded: boolean;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id: string;
                    name?: string;
                    bio?: string | null;
                    avatar_url?: string | null;
                    has_onboarded?: boolean;
                    created_at?: string;
                    updated_at?: string;
                    completion_photo_url?: string | null;
                    milestones?: Json;
                };
                Update: {
                    name?: string;
                    bio?: string | null;
                    avatar_url?: string | null;
                    has_onboarded?: boolean;
                    updated_at?: string;
                    completion_photo_url?: string | null;
                    milestones?: Json;
                };
            };
            goals: {
                Row: {
                    id: string;
                    user_id: string;
                    title: string;
                    description: string | null;
                    image_url: string | null;
                    category: string;
                    created_at: string;
                    timeline_date: string;
                    completed: boolean;
                    completed_at: string | null;
                    notes: string | null;
                    location_latitude: number | null;
                    location_longitude: number | null;
                    location_city: string | null;
                    location_country: string | null;
                    location_place_id: string | null;
                    updated_at: string;
                    completion_photo_url?: string | null;
                    milestones?: Json;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    title: string;
                    description?: string | null;
                    image_url?: string | null;
                    category?: string;
                    created_at?: string;
                    timeline_date: string;
                    completed?: boolean;
                    completed_at?: string | null;
                    notes?: string | null;
                    location_latitude?: number | null;
                    location_longitude?: number | null;
                    location_city?: string | null;
                    location_country?: string | null;
                    location_place_id?: string | null;
                    updated_at?: string;
                };
                Update: {
                    title?: string;
                    description?: string | null;
                    image_url?: string | null;
                    category?: string;
                    timeline_date?: string;
                    completed?: boolean;
                    completed_at?: string | null;
                    notes?: string | null;
                    location_latitude?: number | null;
                    location_longitude?: number | null;
                    location_city?: string | null;
                    location_country?: string | null;
                    location_place_id?: string | null;
                    updated_at?: string;
                };
            };
        };
        Views: {};
        Functions: {};
        Enums: {};
    };
}
