import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import uuid from 'react-native-uuid';
import { supabase as supabaseClient } from '../lib/supabase';
import { track } from '../lib/analytics';

const supabase = supabaseClient as any;

const noopStorage = {
    getItem: async (_key: string) => null,
    setItem: async (_key: string, _value: string) => {},
    removeItem: async (_key: string) => {},
};

const persistStorage = createJSONStorage(() =>
    typeof window === 'undefined' ? noopStorage : (AsyncStorage as any)
);

export interface Location {
    latitude: number;
    longitude: number;
    city: string;
    country: string;
    placeId?: string;
}

export interface Milestone {
    id: string;
    title: string;
    completed: boolean;
    targetDate?: string;
}

export interface Goal {
    id: string;
    title: string;
    description: string;
    image: string;
    category: string;
    createdAt: string;
    updatedAt?: string;
    timelineDate: string;
    completed: boolean;
    completedAt: string | null;
    notes: string;
    location: Location;
    completionPhoto?: string | null;
    progressPhotos?: string[];
    milestones?: Milestone[];
    priority?: 'low' | 'medium' | 'high';
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
        updated_at: goal.updatedAt ?? goal.createdAt,
        timeline_date: goal.timelineDate,
        completed: goal.completed,
        completed_at: goal.completedAt,
        notes: goal.notes,
        location_latitude: goal.location.latitude,
        location_longitude: goal.location.longitude,
        location_city: goal.location.city,
        location_country: goal.location.country,
        location_place_id: goal.location.placeId ?? null,
        completion_photo_url: goal.completionPhoto ?? null,
        milestones: goal.milestones ?? [],
        priority: goal.priority ?? 'medium',
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
        updatedAt: row.updated_at ?? row.created_at,
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
        completionPhoto: row.completion_photo_url ?? null,
        milestones: row.milestones ?? [],
        priority: row.priority ?? 'medium',
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
    addMilestone: (goalId: string, milestone: Omit<Milestone, 'id'>) => void;
    toggleMilestone: (goalId: string, milestoneId: string) => void;
    syncFromCloud: () => Promise<void>;
    getCompletedGoals: () => Goal[];
    getPendingGoals: () => Goal[];
    getMonthlyCompletionStreak: () => number;
    getWeeklyActivity: () => number;
    getGoalsPage: (page: number, pageSize: number) => Goal[];
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
                    priority: goalData.priority ?? 'medium',
                };

                // Optimistic local update
                set(state => ({ goals: [...state.goals, newGoal] }));
                track('goal_created', { category: newGoal.category });

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
                    goals: state.goals.map(g =>
                        g.id === id ? { ...g, ...updates, updatedAt: new Date().toISOString() } : g
                    ),
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
                track('goal_deleted');

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
                // 1. Local — instant
                const wasCompleted = get().goals.find(g => g.id === id)?.completed ?? false;
                set(state => ({
                    goals: state.goals.map(g => {
                        if (g.id !== id) return g;
                        const isNowCompleted = !g.completed;
                        return {
                            ...g,
                            completed: isNowCompleted,
                            completedAt: isNowCompleted ? new Date().toISOString() : null,
                            updatedAt: new Date().toISOString(),
                            notes: notes !== undefined ? notes : g.notes,
                        };
                    }),
                }));
                if (!wasCompleted) track('goal_completed');

                // 2. Cloud — background
                getSession().then(session => {
                    if (!session) return;
                    const updated = get().goals.find(g => g.id === id);
                    if (!updated) return;
                    supabase
                        .from('goals')
                        .update({
                            completed: updated.completed,
                            completed_at: updated.completedAt,
                            notes: updated.notes,
                        })
                        .eq('id', id)
                        .eq('user_id', session.user.id)
                        .then(({ error }: { error: any }) => {
                            if (error) console.error('[GoalStore] toggle:', error.message);
                        });
                });
            },

            addMilestone: (goalId, milestone) => {
                const newMilestone: Milestone = {
                    ...milestone,
                    id: uuid.v4() as string,
                };
                set(state => ({
                    goals: state.goals.map(g =>
                        g.id === goalId
                            ? { ...g, milestones: [...(g.milestones ?? []), newMilestone] }
                            : g
                    ),
                }));
            },

            toggleMilestone: (goalId, milestoneId) => {
                set(state => ({
                    goals: state.goals.map(g => {
                        if (g.id !== goalId) return g;
                        return {
                            ...g,
                            milestones: (g.milestones ?? []).map(m =>
                                m.id === milestoneId ? { ...m, completed: !m.completed } : m
                            ),
                        };
                    }),
                }));
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
                    const cloudIds = new Set(cloudGoals.map((g: any) => g.id));

                    // 2. Push any local-only goals up to Supabase (created offline/before login)
                    const localOnly = localGoals.filter(g => !cloudIds.has(g.id));
                    if (localOnly.length > 0) {
                        await supabase.from('goals').upsert(
                            localOnly.map(g => toRow(g, session.user.id)),
                            { onConflict: 'id' }
                        );
                    }

                    // 3. Merge: newest updatedAt wins for conflicts, keep all local-only
                    const merged = [...cloudGoals, ...localGoals].reduce((acc, goal) => {
                        const existing = acc.find((g: Goal) => g.id === goal.id);
                        if (!existing) return [...acc, goal];
                        // Keep the one with newer updatedAt
                        const existingDate = new Date(existing.updatedAt ?? existing.createdAt);
                        const goalDate = new Date(goal.updatedAt ?? goal.createdAt);
                        if (goalDate > existingDate) {
                            return acc.map((g: Goal) => (g.id === goal.id ? goal : g));
                        }
                        return acc;
                    }, [] as Goal[]);

                    set({ goals: merged });
                } finally {
                    set({ syncing: false });
                }
            },

            getCompletedGoals: () => get().goals.filter(g => g.completed),
            getPendingGoals: () => get().goals.filter(g => !g.completed),

            getMonthlyCompletionStreak: () => {
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                return get().goals.filter(g => {
                    if (!g.completed || !g.completedAt) return false;
                    return new Date(g.completedAt) >= thirtyDaysAgo;
                }).length;
            },

            getWeeklyActivity: () => {
                const sevenDaysAgo = new Date();
                sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                return get().goals.filter(g => {
                    if (!g.completed || !g.completedAt) return false;
                    return new Date(g.completedAt) >= sevenDaysAgo;
                }).length;
            },

            getGoalsPage: (page, pageSize) => {
                const goals = get().goals;
                const start = page * pageSize;
                return goals.slice(start, start + pageSize);
            },

            clearGoals: () => set({ goals: [] }),
        }),
        {
            name: 'atlas-goal-storage',
            storage: persistStorage,
        }
    )
);
