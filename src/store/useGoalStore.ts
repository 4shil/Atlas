import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import uuid from 'react-native-uuid';
import { supabase } from '../lib/supabase';

export interface Location {
    latitude: number;
    longitude: number;
    city: string;
    country: string;
    placeId?: string;
}

export interface Goal {
    id: string;
    title: string;
    description: string;
    image: string;
    category: string;
    createdAt: string;
    timelineDate: string;
    completed: boolean;
    completedAt: string | null;
    notes: string;
    location: Location;
}

// Map local Goal shape to Supabase row shape
function toRow(goal: Goal, userId: string) {
    return {
        id: goal.id,
        user_id: userId,
        title: goal.title,
        description: goal.description,
        image_url: goal.image,
        category: goal.category,
        created_at: goal.createdAt,
        timeline_date: goal.timelineDate,
        completed: goal.completed,
        completed_at: goal.completedAt,
        notes: goal.notes,
        location_latitude: goal.location.latitude,
        location_longitude: goal.location.longitude,
        location_city: goal.location.city,
        location_country: goal.location.country,
        location_place_id: goal.location.placeId ?? null,
    };
}

// Map Supabase row back to local Goal shape
function fromRow(row: Record<string, any>): Goal {
    return {
        id: row.id,
        title: row.title,
        description: row.description ?? '',
        image: row.image_url ?? '',
        category: row.category,
        createdAt: row.created_at,
        timelineDate: row.timeline_date,
        completed: row.completed,
        completedAt: row.completed_at,
        notes: row.notes ?? '',
        location: {
            latitude: row.location_latitude ?? 0,
            longitude: row.location_longitude ?? 0,
            city: row.location_city ?? '',
            country: row.location_country ?? '',
            placeId: row.location_place_id ?? undefined,
        },
    };
}

interface GoalState {
    goals: Goal[];
    syncing: boolean;
    addGoal: (
        goal: Omit<Goal, 'id' | 'createdAt' | 'completed' | 'completedAt'>
    ) => Promise<string>;
    updateGoal: (id: string, updates: Partial<Goal>) => Promise<void>;
    deleteGoal: (id: string) => Promise<void>;
    toggleComplete: (id: string, notes?: string) => Promise<void>;
    syncFromCloud: () => Promise<void>;
    getCompletedGoals: () => Goal[];
    getPendingGoals: () => Goal[];
    clearGoals: () => void;
}

async function getSession() {
    const { data } = await supabase.auth.getSession();
    return data.session;
}

export const useGoalStore = create<GoalState>()(
    persist(
        (set, get) => ({
            goals: [],
            syncing: false,

            addGoal: async goalData => {
                const id = uuid.v4() as string;
                const newGoal: Goal = {
                    ...goalData,
                    id,
                    createdAt: new Date().toISOString(),
                    completed: false,
                    completedAt: null,
                };

                // Optimistic local update
                set(state => ({ goals: [...state.goals, newGoal] }));

                // Cloud sync
                const session = await getSession();
                if (session) {
                    const { error } = await supabase
                        .from('goals')
                        .insert(toRow(newGoal, session.user.id));
                    if (error) console.error('[GoalStore] insert error:', error.message);
                }

                return id;
            },

            updateGoal: async (id, updates) => {
                set(state => ({
                    goals: state.goals.map(g => (g.id === id ? { ...g, ...updates } : g)),
                }));

                const session = await getSession();
                if (session) {
                    const updated = get().goals.find(g => g.id === id);
                    if (!updated) return;
                    const { error } = await supabase
                        .from('goals')
                        .update(toRow(updated, session.user.id))
                        .eq('id', id)
                        .eq('user_id', session.user.id);
                    if (error) console.error('[GoalStore] update error:', error.message);
                }
            },

            deleteGoal: async id => {
                set(state => ({ goals: state.goals.filter(g => g.id !== id) }));

                const session = await getSession();
                if (session) {
                    const { error } = await supabase
                        .from('goals')
                        .delete()
                        .eq('id', id)
                        .eq('user_id', session.user.id);
                    if (error) console.error('[GoalStore] delete error:', error.message);
                }
            },

            toggleComplete: async (id, notes) => {
                set(state => ({
                    goals: state.goals.map(g => {
                        if (g.id !== id) return g;
                        const isNowCompleted = !g.completed;
                        return {
                            ...g,
                            completed: isNowCompleted,
                            completedAt: isNowCompleted ? new Date().toISOString() : null,
                            notes: notes !== undefined ? notes : g.notes,
                        };
                    }),
                }));

                const session = await getSession();
                if (session) {
                    const updated = get().goals.find(g => g.id === id);
                    if (!updated) return;
                    const { error } = await supabase
                        .from('goals')
                        .update({
                            completed: updated.completed,
                            completed_at: updated.completedAt,
                            notes: updated.notes,
                        })
                        .eq('id', id)
                        .eq('user_id', session.user.id);
                    if (error) console.error('[GoalStore] toggleComplete error:', error.message);
                }
            },

            // Sync: push local-only goals up, pull cloud goals down, merge
            syncFromCloud: async () => {
                const session = await getSession();
                if (!session) return;

                set({ syncing: true });
                try {
                    const localGoals = get().goals;

                    // 1. Fetch cloud goals
                    const { data, error } = await supabase
                        .from('goals')
                        .select('*')
                        .eq('user_id', session.user.id)
                        .order('created_at', { ascending: false });

                    if (error) {
                        console.error('[GoalStore] sync error:', error.message);
                        return;
                    }

                    const cloudGoals = (data ?? []).map(fromRow);
                    const cloudIds = new Set(cloudGoals.map(g => g.id));

                    // 2. Push any local-only goals up to Supabase (created offline/before login)
                    const localOnly = localGoals.filter(g => !cloudIds.has(g.id));
                    if (localOnly.length > 0) {
                        await supabase.from('goals').upsert(
                            localOnly.map(g => toRow(g, session.user.id)),
                            { onConflict: 'id' }
                        );
                    }

                    // 3. Merge: cloud wins for conflicts, keep all local-only
                    const cloudMap = new Map(cloudGoals.map(g => [g.id, g]));
                    const merged = [
                        ...cloudGoals,
                        ...localOnly, // already pushed, keep locally too
                    ];
                    // deduplicate by id, cloud wins
                    const seen = new Set<string>();
                    const deduped = merged.filter(g => {
                        if (seen.has(g.id)) return false;
                        seen.add(g.id);
                        return true;
                    });

                    set({ goals: deduped });
                } finally {
                    set({ syncing: false });
                }
            },

            getCompletedGoals: () => get().goals.filter(g => g.completed),
            getPendingGoals: () => get().goals.filter(g => !g.completed),
            clearGoals: () => set({ goals: [] }),
        }),
        {
            name: 'atlas-goal-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
